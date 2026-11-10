"""Language: detection, switching and remembering."""

import pytest
from playwright.sync_api import Page, expect

from conftest import SKIP_BOOT_SCRIPT
from support.pages import Desktop


def test_taskbar_button_switches_everything(desktop: Desktop, page: Page):
    page.get_by_role("button", name="PT, mudar o idioma para English").click()
    expect(page.get_by_role("button", name="Start", exact=True)).to_be_visible()
    expect(page.get_by_role("region", name="Readme.txt - Notepad")).to_be_visible()
    expect(
        page.get_by_role("navigation", name="Open windows").get_by_role("button", name="Browser")
    ).to_be_visible()
    expect(page.locator("html")).to_have_attribute("lang", "en")


def test_choice_is_remembered(desktop: Desktop, page: Page):
    page.get_by_role("button", name="PT, mudar o idioma para English").click()
    page.reload()
    expect(page.get_by_role("button", name="Start", exact=True)).to_be_visible()


@pytest.mark.parametrize(
    ("locale", "start"),
    [("en-US", "Start"), ("en-GB", "Start"), ("pt-BR", "Iniciar"), ("pt-PT", "Iniciar")],
)
def test_detects_the_browser_language(new_context, locale: str, start: str):
    page = new_context(locale=locale).new_page()
    page.add_init_script(SKIP_BOOT_SCRIPT)
    page.goto("/")
    expect(page.get_by_role("button", name=start, exact=True)).to_be_visible()


def test_boot_in_english(new_context):
    page = new_context(locale="en-US").new_page()
    page.goto("/")
    expect(page.get_by_test_id("boot-screen")).to_contain_text("Press any key to skip")
