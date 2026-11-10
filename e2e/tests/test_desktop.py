"""Desktop, icons, taskbar and Start menu."""

import re

import pytest
from playwright.sync_api import Page, expect

from support.pages import (
    BROWSER,
    CLOCK,
    ICQ,
    NOTEPAD,
    PROGRAMS,
    RECYCLE_BIN,
    TERMINAL,
    Desktop,
)


def test_icons_for_every_program(desktop: Desktop):
    names = [b.inner_text().strip() for b in desktop.icons.get_by_role("button").all()]
    assert names == PROGRAMS


def test_initial_state(desktop: Desktop):
    # Leia-me in front, the Clock open, the rest minimized; Recycle Bin closed.
    expect(desktop.window(NOTEPAD)).to_be_visible()
    expect(desktop.task(NOTEPAD)).to_have_attribute("aria-pressed", "true")
    expect(desktop.window(CLOCK)).to_be_visible()
    for program in (BROWSER, TERMINAL, ICQ):
        expect(desktop.task(program)).to_be_visible()
        expect(desktop.window(program)).to_be_hidden()
    expect(desktop.task(RECYCLE_BIN)).to_have_count(0)
    tasks = [b.inner_text().strip() for b in desktop.taskbar.get_by_role("button").all()]
    assert tasks == [BROWSER, TERMINAL, ICQ, CLOCK, NOTEPAD]


@pytest.mark.parametrize("program", PROGRAMS)
def test_one_click_opens_each_program(desktop: Desktop, program: str):
    desktop.icon(program).click()
    expect(desktop.window(program)).to_be_visible()
    expect(desktop.task(program)).to_have_attribute("aria-pressed", "true")


def test_tray_clock_shows_the_time_and_opens_the_clock(desktop: Desktop, page: Page):
    tray_clock = page.get_by_role("button", name="Abrir o Relógio")
    expect(tray_clock.locator("time")).to_have_text(re.compile(r"^\d{2}:\d{2}$"))
    desktop.control(CLOCK, "Fechar").click()
    expect(desktop.window(CLOCK)).to_have_count(0)
    tray_clock.click()
    expect(desktop.window(CLOCK)).to_be_visible()


def test_tray_flower_opens_icq(desktop: Desktop, page: Page):
    page.get_by_role("button", name="Abrir o ICQ").click()
    expect(desktop.window(ICQ)).to_be_visible()
    expect(desktop.task(ICQ)).to_have_attribute("aria-pressed", "true")


class TestStartMenu:
    def test_opens_with_banner_programs_and_languages(self, desktop: Desktop):
        menu = desktop.open_start_menu()
        expect(desktop.start).to_have_attribute("aria-expanded", "true")
        expect(menu).to_contain_text("CarvalhoCortes 84")
        items = [i.inner_text().strip() for i in menu.get_by_role("menuitem").all()]
        assert items == [*PROGRAMS, "Reiniciar", "Desligar..."]
        expect(menu.get_by_role("menuitemradio", name="Português (pt-BR)")).to_have_attribute(
            "aria-checked", "true"
        )
        expect(menu.get_by_role("menuitemradio", name="English (en-US)")).to_have_attribute(
            "aria-checked", "false"
        )

    def test_first_item_gets_the_focus(self, desktop: Desktop):
        menu = desktop.open_start_menu()
        expect(menu.get_by_role("menuitem", name=BROWSER)).to_be_focused()

    def test_arrows_home_and_end_move_the_focus(self, desktop: Desktop, page: Page):
        menu = desktop.open_start_menu()
        page.keyboard.press("ArrowDown")
        expect(menu.get_by_role("menuitem", name=TERMINAL)).to_be_focused()
        page.keyboard.press("ArrowUp")
        page.keyboard.press("ArrowUp")
        expect(menu.get_by_role("menuitem", name="Desligar...")).to_be_focused()
        page.keyboard.press("Home")
        expect(menu.get_by_role("menuitem", name=BROWSER)).to_be_focused()
        page.keyboard.press("End")
        expect(menu.get_by_role("menuitem", name="Desligar...")).to_be_focused()

    def test_escape_closes_and_returns_focus(self, desktop: Desktop, page: Page):
        desktop.open_start_menu()
        page.keyboard.press("Escape")
        expect(desktop.start_menu).to_have_count(0)
        expect(desktop.start).to_be_focused()

    def test_click_outside_closes(self, desktop: Desktop):
        desktop.open_start_menu()
        desktop.click_empty_desktop()
        expect(desktop.start_menu).to_have_count(0)

    def test_start_button_toggles(self, desktop: Desktop):
        desktop.open_start_menu()
        desktop.start.click()
        expect(desktop.start_menu).to_have_count(0)

    def test_opens_a_program(self, desktop: Desktop):
        menu = desktop.open_start_menu()
        menu.get_by_role("menuitem", name=RECYCLE_BIN).click()
        expect(desktop.start_menu).to_have_count(0)
        expect(desktop.window(RECYCLE_BIN)).to_be_visible()

    def test_switches_language_and_stays_open(self, desktop: Desktop, page: Page):
        menu = desktop.open_start_menu()
        menu.get_by_role("menuitemradio", name="English (en-US)").click()
        english_menu = page.get_by_role("menu", name="Start menu")
        expect(english_menu).to_be_visible()
        expect(english_menu.get_by_role("menuitem", name="Browser")).to_be_visible()
        expect(english_menu.get_by_role("menuitemradio", name="English (en-US)")).to_have_attribute(
            "aria-checked", "true"
        )
