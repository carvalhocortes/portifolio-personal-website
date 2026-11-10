"""Hidden things on the desktop: restart, shutdown, screensaver, blue screen, Plus!, Mussum mode."""

import re

from playwright.sync_api import Page, expect

from conftest import SKIP_BOOT_SCRIPT
from support.pages import NOTEPAD, RECYCLE_BIN, TERMINAL, Desktop, Terminal

KONAMI = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
]


def open_desktop_with_fake_clock(page: Page) -> Desktop:
    page.clock.install()
    page.add_init_script(SKIP_BOOT_SCRIPT)
    page.goto("/")
    desktop = Desktop(page)
    expect(desktop.window(NOTEPAD)).to_be_visible()
    return desktop


def test_restart_plays_the_boot_and_resets_the_desktop(desktop: Desktop, page: Page):
    desktop.open(RECYCLE_BIN)
    desktop.open_start_menu().get_by_role("menuitem", name="Reiniciar").click()
    boot = page.get_by_test_id("boot-screen")
    expect(boot).to_be_visible()
    page.keyboard.press("Enter")
    expect(boot).to_have_count(0)
    # A fresh desktop: the Recycle Bin is closed again.
    expect(desktop.task(RECYCLE_BIN)).to_have_count(0)
    expect(desktop.window(NOTEPAD)).to_be_visible()


def test_shutdown_screen_then_boots_again(page: Page):
    desktop = open_desktop_with_fake_clock(page)
    desktop.open_start_menu().get_by_role("menuitem", name="Desligar...").click()
    off = page.get_by_role("dialog", name="Agora é seguro desligar o computador.")
    expect(off).to_be_visible()
    expect(off).to_be_focused()
    page.clock.run_for(3100)
    expect(off).to_have_count(0)
    expect(page.get_by_test_id("boot-screen")).to_be_visible()


def test_shutdown_screen_leaves_with_a_click(desktop: Desktop, page: Page):
    desktop.open_start_menu().get_by_role("menuitem", name="Desligar...").click()
    page.get_by_test_id("fun-screen-off").click()
    expect(page.get_by_test_id("boot-screen")).to_be_visible()


def test_screensaver_after_two_minutes_idle(page: Page):
    open_desktop_with_fake_clock(page)
    saver = page.get_by_test_id("screensaver")
    page.clock.run_for(119_000)
    expect(saver).to_have_count(0)
    page.clock.run_for(2_000)
    expect(saver).to_be_visible()
    page.mouse.move(300, 300)
    expect(saver).to_have_count(0)


def test_activity_postpones_the_screensaver(page: Page):
    open_desktop_with_fake_clock(page)
    page.clock.run_for(100_000)
    page.mouse.move(200, 200)
    page.clock.run_for(100_000)
    expect(page.get_by_test_id("screensaver")).to_have_count(0)


def test_konami_shows_the_blue_screen(desktop: Desktop, page: Page):
    desktop.click_empty_desktop()
    for key in KONAMI:
        page.keyboard.press(key)
    bsod = page.get_by_test_id("fun-screen-bsod")
    expect(bsod).to_be_visible()
    expect(bsod).to_contain_text("O CAFÉ ACABOU")
    page.keyboard.press("Space")
    expect(bsod).to_have_count(0)
    expect(desktop.window(NOTEPAD)).to_be_visible()


def test_konami_typed_in_a_text_field_does_nothing(desktop: Desktop, page: Page):
    desktop.window(NOTEPAD).get_by_role("textbox").click()
    for key in KONAMI:
        page.keyboard.press(key)
    expect(page.get_by_test_id("fun-screen-bsod")).to_have_count(0)


def test_ten_clicks_on_start_add_plus(desktop: Desktop):
    for _ in range(10):
        desktop.start.click()
    # Ten clicks leave the menu closed; one more opens it with the banner.
    desktop.start.click()
    expect(desktop.start_menu).to_contain_text("CarvalhoCortes 84 Plus!")


def test_few_clicks_on_start_do_not_add_plus(desktop: Desktop):
    for _ in range(3):
        desktop.start.click()
    expect(desktop.start_menu).to_be_visible()
    expect(desktop.start_menu).not_to_contain_text("Plus!")


def start_button(page: Page):
    return page.get_by_role("button", name=re.compile(r"^Iniciar"))


def test_mussum_mode_from_the_terminal_until_a_reload(desktop: Desktop, page: Page):
    desktop.open(TERMINAL)
    terminal = Terminal(page)
    expect(terminal.run("mussum")).to_contain_text("Modis Mussum ligadis. Cacildis!")
    expect(start_button(page)).to_have_text("Iniciarzis")
    # The other commands keep working, and the name stays as it is.
    expect(terminal.run("sobre")).to_contain_text("Fernando Côrtes")
    page.reload()
    expect(start_button(page)).to_have_text("Iniciar")


def test_mussum_mode_by_typing_cacildis(desktop: Desktop, page: Page):
    desktop.click_empty_desktop()
    page.keyboard.type("cacildis")
    expect(start_button(page)).to_have_text("Iniciarzis")
    page.keyboard.type("cacildis")
    expect(start_button(page)).to_have_text("Iniciar")


def test_mussum_button_in_the_start_menu(desktop: Desktop, page: Page):
    menu = desktop.open_start_menu()
    expect(menu.get_by_role("menuitemradio", name=re.compile("pt-MUSSUM"))).to_have_count(0)
    for _ in range(3):
        menu.get_by_role("menuitemradio", name=re.compile(r"\(pt-BR\)")).click()
    menu.get_by_role("menuitemradio", name=re.compile("pt-MUSSUM")).click()
    expect(start_button(page)).to_have_text("Iniciarzis")
