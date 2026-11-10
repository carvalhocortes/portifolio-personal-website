"""Shared setup for the end-to-end tests.

- Serves the production build (`npm run build` + `vite preview`), unless
  BASE_URL points somewhere else (E2E_SKIP_BUILD=1 reuses an existing dist/).
- Every page runs in Portuguese, on a 1280 x 800 screen, with hCaptcha and
  Web3Forms faked and every other outside request answered empty.
- Every test fails if the page logs an error or a request to the site fails.
"""

from __future__ import annotations

import os
import socket
import subprocess
import time
from collections.abc import Callable
from pathlib import Path
from urllib.parse import urlparse

import pytest
from playwright.sync_api import Browser, BrowserContext, ConsoleMessage, Page, Response, Route

from support.fakes import WEB3FORMS_URL, Captcha, Web3Forms
from support.pages import Desktop

CODE_DIR = Path(__file__).resolve().parent.parent
PREVIEW_PORT = int(os.environ.get("E2E_PORT", "4173"))
DESKTOP_VIEWPORT = {"width": 1280, "height": 800}

# Marks the boot screen as already played in this tab (src/shared/lib/bootMark.ts).
SKIP_BOOT_SCRIPT = "try { sessionStorage.setItem('cc84.booted', '1') } catch {}"


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line("markers", "allow_errors: the test expects console or network errors")
    config.addinivalue_line("markers", "local_only: sends forms; skipped when BASE_URL is set")
    # One build and one server for the whole run, started by the main process
    # (with pytest-xdist, the workers inherit its address).
    is_worker = hasattr(config, "workerinput")
    # Commands that only list things (--help, --markers, --fixtures...) need no site.
    listing = ("help", "version", "markers", "showfixtures", "show_fixtures_per_test", "collectonly")
    if is_worker or os.environ.get("BASE_URL") or any(getattr(config.option, o, False) for o in listing):
        return
    os.environ["E2E_SERVER_URL"] = _start_preview(config)


def pytest_collection_modifyitems(items: list[pytest.Item]) -> None:
    if not os.environ.get("BASE_URL"):
        return
    skip = pytest.mark.skip(reason="only against the local build")
    for item in items:
        if "local_only" in item.keywords:
            item.add_marker(skip)


# --- The site under test ---------------------------------------------------


def _port_open(port: int) -> bool:
    with socket.socket() as sock:
        return sock.connect_ex(("127.0.0.1", port)) == 0


def _start_preview(config: pytest.Config) -> str:
    """Builds the site and serves dist/ with vite preview until the run ends."""
    if not os.environ.get("E2E_SKIP_BUILD"):
        subprocess.run(["npm", "run", "build"], cwd=CODE_DIR, check=True)

    if _port_open(PREVIEW_PORT):
        raise pytest.UsageError(f"port {PREVIEW_PORT} is busy; stop it or set E2E_PORT")
    server = subprocess.Popen(
        ["npx", "vite", "preview", "--host", "127.0.0.1", "--port", str(PREVIEW_PORT), "--strictPort"],
        cwd=CODE_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    def stop() -> None:
        server.terminate()
        server.wait(timeout=10)

    config.add_cleanup(stop)
    deadline = time.time() + 30
    while not _port_open(PREVIEW_PORT):
        if server.poll() is not None or time.time() > deadline:
            raise pytest.UsageError("vite preview did not start")
        time.sleep(0.2)
    return f"http://127.0.0.1:{PREVIEW_PORT}"


@pytest.fixture(scope="session")
def base_url() -> str:
    """The site's address: BASE_URL, or the local preview of the build."""
    return (os.environ.get("BASE_URL") or os.environ["E2E_SERVER_URL"]).rstrip("/")


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args: dict, base_url: str) -> dict:
    return {
        **browser_context_args,
        "base_url": base_url,
        "locale": "pt-BR",
        "viewport": DESKTOP_VIEWPORT,
    }


# --- Outside services ------------------------------------------------------


@pytest.fixture
def web3forms() -> Web3Forms:
    return Web3Forms()


@pytest.fixture
def captcha() -> Captcha:
    return Captcha()


def _fake_outside_world(context: BrowserContext, site: str, web3forms: Web3Forms, captcha: Captcha) -> None:
    """No request leaves the site: fakes for hCaptcha and Web3Forms, empty answers otherwise."""

    def outside(url: str) -> bool:
        return urlparse(url).netloc != site

    def answer(route: Route) -> None:
        url = route.request.url
        if url.startswith("https://js.hcaptcha.com/1/api.js"):
            captcha.handle(route, route.request)
        elif url.startswith(WEB3FORMS_URL):
            web3forms.handle(route, route.request)
        else:
            route.fulfill(status=200, body="")

    context.route(outside, answer)


def _watch_health(context: BrowserContext, site: str, problems: list[str]) -> None:
    """Collects console errors, uncaught errors and failed site requests of every page."""

    def on_console(message: ConsoleMessage) -> None:
        if message.type == "error":
            problems.append(f"console: {message.text}")

    def on_response(response: Response) -> None:
        if urlparse(response.url).netloc == site and response.status >= 400:
            problems.append(f"HTTP {response.status}: {response.url}")

    context.on("console", on_console)
    context.on("weberror", lambda error: problems.append(f"page error: {error.error}"))
    context.on("response", on_response)


@pytest.fixture
def problems() -> list[str]:
    return []


@pytest.fixture(autouse=True)
def prepare_context(
    request: pytest.FixtureRequest,
    context: BrowserContext,
    base_url: str,
    web3forms: Web3Forms,
    captcha: Captcha,
    problems: list[str],
) -> None:
    """Fakes the outside world and fails the test if the site logs an error or a file fails to load."""
    site = urlparse(base_url).netloc
    _fake_outside_world(context, site, web3forms, captcha)
    _watch_health(context, site, problems)
    yield
    if "allow_errors" not in request.keywords:
        assert not problems, "\n".join(problems)


@pytest.fixture
def new_context(
    browser: Browser,
    browser_context_args: dict,
    base_url: str,
    web3forms: Web3Forms,
    captcha: Captcha,
    problems: list[str],
) -> Callable[..., BrowserContext]:
    """Another context (other language, other device) with the same fakes and checks."""
    contexts: list[BrowserContext] = []
    site = urlparse(base_url).netloc

    def make(**overrides) -> BrowserContext:
        context = browser.new_context(**{**browser_context_args, **overrides})
        _fake_outside_world(context, site, web3forms, captcha)
        _watch_health(context, site, problems)
        contexts.append(context)
        return context

    yield make
    for context in contexts:
        context.close()


# --- Starting points ---------------------------------------------------------


@pytest.fixture
def desktop(page: Page) -> Desktop:
    """The desktop at /, with the boot screen already played in this tab."""
    page.add_init_script(SKIP_BOOT_SCRIPT)
    page.goto("/")
    screen = Desktop(page)
    screen.window("Leia-me.txt").wait_for()
    return screen
