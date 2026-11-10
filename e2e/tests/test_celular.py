"""Phones: the landing page right away, without the desktop."""

import pytest
from playwright.sync_api import Page, Playwright, expect

from support.fakes import CAPTCHA_LABEL, Web3Forms
from support.pages import Landing


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args: dict, playwright: Playwright, browser_name: str) -> dict:
    """Every page in this file is an iPhone (touch, small screen, phone user agent)."""
    if browser_name == "firefox":
        pytest.skip("Firefox can't emulate a phone (no is_mobile)")
    iphone = playwright.devices["iPhone 13"]
    return {**browser_context_args, **iphone, "viewport": iphone["viewport"]}


@pytest.fixture
def phone_page(page: Page) -> Page:
    return page


def test_home_is_the_landing_without_the_desktop(phone_page: Page):
    requests: list[str] = []
    phone_page.on("request", lambda r: requests.append(r.url))
    phone_page.goto("/")
    expect(Landing(phone_page).heading).to_be_visible()
    phone_page.wait_for_load_state("networkidle")
    expect(phone_page.get_by_test_id("boot-screen")).to_have_count(0)
    expect(phone_page.get_by_role("region", name="Área de trabalho")).to_have_count(0)
    downloaded = [u for u in requests if "/assets/" in u]
    assert not [u for u in downloaded if "DesktopPage" in u or "Terminal-" in u], downloaded


def test_preloads_font_avatar_and_signature(phone_page: Page):
    phone_page.goto("/")
    preloads = phone_page.locator('link[rel="preload"]')
    hrefs = " ".join(preloads.evaluate_all("links => links.map(l => l.href)"))
    assert "avatar" in hrefs and "assinatura" in hrefs and ".woff2" in hrefs, hrefs


def test_menu_button_opens_the_sections(phone_page: Page):
    phone_page.goto("/")
    menu = phone_page.get_by_role("button", name="Menu")
    menu.click()
    expect(phone_page.get_by_role("button", name="Fechar o menu")).to_have_attribute("aria-expanded", "true")
    phone_page.get_by_role("navigation", name="Seções").get_by_role("link", name="Hobbies").click()
    expect(phone_page.get_by_role("button", name="Menu")).to_have_attribute("aria-expanded", "false")
    expect(phone_page.locator("#hobbies")).to_be_in_viewport()


def test_escape_closes_the_menu(phone_page: Page):
    phone_page.goto("/")
    phone_page.get_by_role("button", name="Menu").click()
    phone_page.keyboard.press("Escape")
    expect(phone_page.get_by_role("button", name="Menu")).to_have_attribute("aria-expanded", "false")


def test_no_horizontal_scroll(phone_page: Page):
    phone_page.goto("/")
    expect(Landing(phone_page).heading).to_be_visible()
    assert phone_page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")


@pytest.mark.local_only
def test_contact_form_sends(phone_page: Page, web3forms: Web3Forms):
    phone_page.goto("/")
    phone_page.locator("#contato").scroll_into_view_if_needed()
    phone_page.get_by_label("Nome", exact=True).fill("Ana")
    phone_page.get_by_label("Seu e-mail", exact=True).fill("ana@exemplo.com")
    phone_page.get_by_label("Mensagem", exact=True).fill("Pelo celular")
    phone_page.get_by_role("button", name=CAPTCHA_LABEL).click()
    phone_page.get_by_role("button", name="Enviar mensagem").click()
    expect(phone_page.get_by_role("status")).to_contain_text("Mensagem enviada")
    assert len(web3forms.requests) == 1


def test_terminal_route_still_works_on_a_phone(phone_page: Page):
    phone_page.goto("/terminal/")
    expect(phone_page.get_by_role("textbox", name="Terminal command input")).to_be_attached()
    expect(phone_page.get_by_role("heading", name="Bem vindo a minha pagina!")).to_be_visible()
