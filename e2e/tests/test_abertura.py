"""The DOS-style boot: BIOS, DOS, logo, then the desktop."""

import pytest
from playwright.sync_api import Page, expect

from support.pages import Desktop


@pytest.fixture
def boot(page: Page):
    page.goto("/")
    return page.get_by_test_id("boot-screen")


def test_boot_plays_then_shows_the_desktop(page: Page, boot):
    expect(boot).to_have_attribute("data-phase", "bios")
    expect(boot).to_contain_text("CC BIOS")
    expect(boot).to_have_attribute("data-phase", "dos", timeout=5000)
    expect(boot).to_contain_text("C:\\> win", timeout=5000)
    expect(boot).to_have_attribute("data-phase", "splash", timeout=5000)
    expect(boot).to_have_count(0, timeout=5000)
    expect(Desktop(page).window("Leia-me.txt")).to_be_visible()


def test_desktop_is_inert_during_the_boot(page: Page, boot):
    expect(boot).to_be_visible()
    expect(page.get_by_role("main")).to_have_attribute("inert", "")


def test_a_key_skips_the_boot(page: Page, boot):
    expect(boot).to_be_visible()
    page.keyboard.press("Enter")
    expect(boot).to_have_count(0)
    expect(Desktop(page).area).to_be_visible()


def test_a_click_skips_the_boot(page: Page, boot):
    boot.click()
    expect(boot).to_have_count(0)


def test_boot_plays_once_per_tab(page: Page, boot):
    page.keyboard.press("Enter")
    expect(boot).to_have_count(0)
    page.reload()
    expect(Desktop(page).window("Leia-me.txt")).to_be_visible()
    expect(page.get_by_test_id("boot-screen")).to_have_count(0)


def test_boot_shows_again_in_a_new_tab(page: Page, boot):
    page.keyboard.press("Enter")
    other = page.context.new_page()
    other.goto("/")
    expect(other.get_by_test_id("boot-screen")).to_be_visible()


def test_del_opens_the_fake_setup(page: Page, boot):
    expect(boot).to_have_attribute("data-phase", "bios")
    page.keyboard.press("Delete")
    setup = page.get_by_role("dialog", name="CMOS SETUP - CC BIOS v1.984")
    expect(setup).to_be_visible()
    expect(setup).to_contain_text("Velocidade do café")
    # Any key leaves it and the boot starts over from the BIOS.
    page.keyboard.press("Escape")
    expect(setup).to_have_count(0)
    expect(boot).to_have_attribute("data-phase", "bios")


@pytest.mark.parametrize("path", ["/terminal", "/landing"])
def test_no_boot_on_direct_routes(page: Page, path: str):
    page.goto(path)
    page.wait_for_load_state("networkidle")
    expect(page.get_by_test_id("boot-screen")).to_have_count(0)


def test_reduced_motion_shows_only_the_logo(page: Page):
    page.emulate_media(reduced_motion="reduce")
    page.goto("/")
    boot = page.get_by_test_id("boot-screen")
    expect(boot).to_have_attribute("data-phase", "splash")
    expect(boot).to_have_count(0, timeout=3000)
