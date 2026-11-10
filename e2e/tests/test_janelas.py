"""Windows: open, focus, minimize, maximize, close, drag and resize."""

from playwright.sync_api import Page, expect

from support.pages import CLOCK, NOTEPAD, RECYCLE_BIN, TERMINAL, Desktop


def box(desktop: Desktop, program: str) -> dict:
    found = desktop.window(program).bounding_box()
    assert found, f"{program} has no box"
    return found


def test_minimize_and_restore_from_the_taskbar(desktop: Desktop):
    desktop.control(NOTEPAD, "Minimizar").click()
    expect(desktop.window(NOTEPAD)).to_be_hidden()
    expect(desktop.task(NOTEPAD)).to_have_attribute("aria-pressed", "false")
    desktop.task(NOTEPAD).click()
    expect(desktop.window(NOTEPAD)).to_be_visible()
    expect(desktop.task(NOTEPAD)).to_have_attribute("aria-pressed", "true")


def test_active_task_button_minimizes(desktop: Desktop):
    desktop.task(NOTEPAD).click()
    expect(desktop.window(NOTEPAD)).to_be_hidden()


def test_taskbar_brings_a_minimized_program_to_front(desktop: Desktop):
    desktop.task(TERMINAL).click()
    expect(desktop.window(TERMINAL)).to_be_visible()
    expect(desktop.task(TERMINAL)).to_have_attribute("aria-pressed", "true")
    expect(desktop.task(NOTEPAD)).to_have_attribute("aria-pressed", "false")


def test_clicking_a_window_focuses_it(desktop: Desktop):
    expect(desktop.window(CLOCK)).to_have_attribute("data-active", "false")
    desktop.title_bar(CLOCK).click()
    expect(desktop.window(CLOCK)).to_have_attribute("data-active", "true")
    expect(desktop.task(CLOCK)).to_have_attribute("aria-pressed", "true")
    expect(desktop.window(NOTEPAD)).to_have_attribute("data-active", "false")


def test_maximize_fills_the_desktop_and_restore_goes_back(desktop: Desktop):
    before = box(desktop, NOTEPAD)
    desktop.control(NOTEPAD, "Maximizar").click()
    area = desktop.area.bounding_box()
    after = box(desktop, NOTEPAD)
    assert abs(after["width"] - area["width"]) <= 2
    assert abs(after["height"] - area["height"]) <= 2
    desktop.control(NOTEPAD, "Restaurar").click()
    assert box(desktop, NOTEPAD) == before


def test_double_click_on_the_title_maximizes(desktop: Desktop):
    desktop.title_bar(NOTEPAD).dblclick()
    expect(desktop.control(NOTEPAD, "Restaurar")).to_be_visible()
    desktop.title_bar(NOTEPAD).dblclick()
    expect(desktop.control(NOTEPAD, "Maximizar")).to_be_visible()


def test_close_removes_the_window_and_task(desktop: Desktop):
    desktop.control(NOTEPAD, "Fechar").click()
    expect(desktop.window(NOTEPAD)).to_have_count(0)
    expect(desktop.task(NOTEPAD)).to_have_count(0)


def test_drag_by_the_title_bar(desktop: Desktop, page: Page):
    win = desktop.open(RECYCLE_BIN)
    before = box(desktop, RECYCLE_BIN)
    title = win.get_by_role("heading", name=RECYCLE_BIN)
    start = title.bounding_box()
    x, y = start["x"] + 20, start["y"] + start["height"] / 2
    page.mouse.move(x, y)
    page.mouse.down()
    page.mouse.move(x - 120, y + 60, steps=8)
    page.mouse.up()
    after = box(desktop, RECYCLE_BIN)
    assert round(after["x"] - before["x"]) == -120
    assert round(after["y"] - before["y"]) == 60
    assert after["width"] == before["width"]


def test_maximized_window_does_not_drag(desktop: Desktop, page: Page):
    desktop.control(NOTEPAD, "Maximizar").click()
    before = box(desktop, NOTEPAD)
    title = desktop.title_bar(NOTEPAD).bounding_box()
    page.mouse.move(title["x"] + 10, title["y"] + 5)
    page.mouse.down()
    page.mouse.move(title["x"] + 200, title["y"] + 200, steps=5)
    page.mouse.up()
    assert box(desktop, NOTEPAD) == before


def test_resize_from_the_bottom_right_corner(desktop: Desktop, page: Page):
    win = desktop.open(RECYCLE_BIN)
    before = box(desktop, RECYCLE_BIN)
    handle = win.locator('[data-resize="se"]').bounding_box()
    x, y = handle["x"] + handle["width"] / 2, handle["y"] + handle["height"] / 2
    page.mouse.move(x, y)
    page.mouse.down()
    page.mouse.move(x + 80, y + 50, steps=8)
    page.mouse.up()
    after = box(desktop, RECYCLE_BIN)
    assert round(after["width"] - before["width"]) == 80
    assert round(after["height"] - before["height"]) == 50
    assert (after["x"], after["y"]) == (before["x"], before["y"])


def test_resize_from_the_left_edge_moves_the_left_side(desktop: Desktop, page: Page):
    win = desktop.open(RECYCLE_BIN)
    before = box(desktop, RECYCLE_BIN)
    handle = win.locator('[data-resize="w"]').bounding_box()
    x, y = handle["x"] + handle["width"] / 2, handle["y"] + handle["height"] / 2
    page.mouse.move(x, y)
    page.mouse.down()
    page.mouse.move(x - 40, y, steps=5)
    page.mouse.up()
    after = box(desktop, RECYCLE_BIN)
    assert round(after["width"] - before["width"]) == 40
    assert round(before["x"] - after["x"]) == 40


def test_window_stays_inside_the_desktop(desktop: Desktop, page: Page):
    win = desktop.open(RECYCLE_BIN)
    title = win.get_by_role("heading", name=RECYCLE_BIN).bounding_box()
    page.mouse.move(title["x"] + 10, title["y"] + 5)
    page.mouse.down()
    page.mouse.move(title["x"] + 10, -500, steps=5)
    page.mouse.up()
    area = desktop.area.bounding_box()
    assert box(desktop, RECYCLE_BIN)["y"] >= area["y"]


def test_resizing_the_browser_window_keeps_windows_reachable(desktop: Desktop, page: Page):
    desktop.open(RECYCLE_BIN)
    page.set_viewport_size({"width": 900, "height": 700})
    area = desktop.area.bounding_box()
    win = box(desktop, RECYCLE_BIN)
    assert win["x"] < area["x"] + area["width"]
    assert win["y"] < area["y"] + area["height"]
