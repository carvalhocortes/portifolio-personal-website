"""The Browser program: the landing page inside a desktop window."""

from playwright.sync_api import expect

from support.pages import BROWSER, PAGE_TITLE, Desktop, Landing


def open_browser(desktop: Desktop):
    desktop.task(BROWSER).click()
    win = desktop.window(BROWSER)
    expect(win).to_be_visible()
    return win


def test_address_bar_shows_the_page_title(desktop: Desktop):
    win = open_browser(desktop)
    address = win.get_by_role("textbox", name="Endereço")
    expect(address).to_have_value(PAGE_TITLE)
    expect(address).to_have_attribute("readonly", "")
    for button in ["Voltar", "Avançar", "Recarregar"]:
        expect(win.get_by_role("button", name=button)).to_be_disabled()


def test_shows_the_landing_page(desktop: Desktop):
    win = open_browser(desktop)
    expect(Landing(win).heading).to_be_visible()


def test_menu_scrolls_inside_the_window_only(desktop: Desktop):
    win = open_browser(desktop)
    url = desktop.page.url
    Landing(win).nav.get_by_role("link", name="Contato").click()
    expect(win.locator('[id="contato"]')).to_be_in_viewport()
    assert desktop.page.url == url
    assert desktop.page.evaluate("window.scrollY") == 0


def test_enlarged_photo_covers_only_the_window(desktop: Desktop):
    win = open_browser(desktop)
    win.get_by_role("button", name="Ampliar a foto: Banco do hall do apartamento").click()
    dialog = win.get_by_role("dialog")
    expect(dialog).to_be_visible()
    photo = dialog.bounding_box()
    frame = win.bounding_box()
    assert photo["x"] >= frame["x"] and photo["y"] >= frame["y"]
    assert photo["x"] + photo["width"] <= frame["x"] + frame["width"] + 1
    assert photo["y"] + photo["height"] <= frame["y"] + frame["height"] + 1
    # The taskbar is still there and usable.
    expect(desktop.start).to_be_visible()


def test_opens_almost_full_screen_with_icons_in_view(desktop: Desktop):
    win = open_browser(desktop)
    box = win.bounding_box()
    area = desktop.area.bounding_box()
    icons = desktop.icons.bounding_box()
    assert box["x"] >= icons["x"] + icons["width"] - 1
    assert box["width"] > area["width"] * 0.7
