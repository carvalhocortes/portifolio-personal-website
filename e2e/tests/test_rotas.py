"""Routes, page titles, sharing tags and the files search engines read."""

import os

import pytest
from playwright.sync_api import Page, expect

from conftest import SKIP_BOOT_SCRIPT
from support.pages import NAME, PAGE_TITLE, Desktop, Landing, Terminal


def test_home_is_the_desktop(page: Page):
    page.add_init_script(SKIP_BOOT_SCRIPT)
    page.goto("/")
    expect(page).to_have_title(PAGE_TITLE)
    expect(Desktop(page).area).to_be_visible()


# GitHub Pages sends /terminal to /terminal/, where the build puts that
# route's own index.html (vite preview doesn't redirect, so use the slash).
def test_terminal_route_opens_only_the_terminal(page: Page):
    page.goto("/terminal/")
    expect(page).to_have_title(f"{NAME} - Terminal")
    expect(Terminal(page).input).to_be_focused()
    expect(Desktop(page).area).to_have_count(0)


def test_landing_route_opens_only_the_page(page: Page):
    page.goto("/landing/")
    expect(page).to_have_title(PAGE_TITLE)
    expect(Landing(page).heading).to_be_visible()
    expect(Desktop(page).area).to_have_count(0)


@pytest.mark.parametrize("path", ["/terminal", "/landing"])
def test_without_trailing_slash_works(page: Page, path: str):
    page.goto(path)
    expect(Desktop(page).area).to_have_count(0)


def test_unknown_path_falls_back_to_the_desktop(page: Page):
    # GitHub Pages serves 404.html for unknown paths; vite preview serves the
    # app. Either way the visitor lands on the desktop.
    if os.environ.get("BASE_URL"):
        pytest.skip("depends on the host's 404 page")
    page.add_init_script(SKIP_BOOT_SCRIPT)
    page.goto("/nao-existe")
    expect(Desktop(page).area).to_be_visible()


def test_sharing_tags(page: Page):
    page.goto("/")
    head = page.locator("head")
    expect(head.locator('link[rel="canonical"]')).to_have_attribute("href", "https://carvalhocortes.com.br/")
    expect(head.locator('meta[property="og:title"]')).to_have_attribute("content", PAGE_TITLE)
    og_image = head.locator('meta[property="og:image"]').get_attribute("content")
    assert og_image and og_image.startswith("https://carvalhocortes.com.br/")
    # The picture itself is served by the site.
    image = page.request.get("/" + og_image.split("/", 3)[3])
    assert image.ok
    assert image.headers["content-type"].startswith("image/")


def test_terminal_has_its_own_og_url(page: Page):
    page.goto("/terminal/")
    expect(page.locator('meta[property="og:url"]')).to_have_attribute(
        "content", "https://carvalhocortes.com.br/terminal/"
    )


@pytest.mark.parametrize(
    ("path", "type_start", "text"),
    [
        ("/robots.txt", "text/plain", "Sitemap: https://carvalhocortes.com.br/sitemap.xml"),
        ("/sitemap.xml", "", "https://carvalhocortes.com.br/"),
        ("/favicon.svg", "image/svg", "<svg"),
        ("/favicon.ico", "image/", ""),
        ("/apple-touch-icon.png", "image/png", ""),
    ],
)
def test_static_files(page: Page, path: str, type_start: str, text: str):
    response = page.request.get(path)
    assert response.ok, f"{path}: {response.status}"
    assert response.headers["content-type"].startswith(type_start)
    if text:
        assert text in response.text()
