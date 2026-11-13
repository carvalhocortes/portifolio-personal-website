"""Minesweeper: a safe first click, the clock, flags and the level menu."""

import re

import pytest
from playwright.sync_api import Locator, Page, expect

from support.pages import MINESWEEPER, Desktop


@pytest.fixture
def game(page: Page, desktop: Desktop) -> Locator:
    # Each test starts on the beginner level.
    page.evaluate("localStorage.removeItem('cc84.minesweeperLevel')")
    return desktop.open(MINESWEEPER)


def cells(game: Locator) -> Locator:
    return game.get_by_role("gridcell")


def test_first_click_is_safe_and_starts_the_clock(game: Locator):
    expect(cells(game)).to_have_count(81)
    timer = game.get_by_role("img", name=re.compile(r"segundos?$"))
    expect(timer).to_have_attribute("data-value", "000")
    game.get_by_role("gridcell", name="Linha 5, coluna 5: fechada").click()
    # The first click never hits a mine and opens an area.
    expect(game.get_by_role("gridcell", name=re.compile(r"explodida"))).to_have_count(0)
    expect(game.get_by_role("gridcell", name="Linha 5, coluna 5: vazia")).to_be_visible()
    expect(timer).not_to_have_attribute("data-value", "000")
    expect(timer).not_to_have_attribute("data-value", "001", timeout=3000)


def test_right_click_puts_a_flag(game: Locator):
    counter = game.get_by_role("img", name=re.compile(r"minas? restantes?"))
    expect(counter).to_have_attribute("data-value", "010")
    game.get_by_role("gridcell", name="Linha 1, coluna 1: fechada").click(button="right")
    expect(game.get_by_role("gridcell", name="Linha 1, coluna 1: bandeira")).to_be_visible()
    expect(counter).to_have_attribute("data-value", "009")


def test_level_menu_resizes_the_window(game: Locator):
    before = game.bounding_box()
    game.get_by_role("button", name="Jogo", exact=True).click()
    game.get_by_role("menuitemradio", name=re.compile("Intermediário")).click()
    expect(cells(game)).to_have_count(256)
    after = game.bounding_box()
    assert before and after
    assert after["width"] > before["width"]
    assert after["height"] > before["height"]
    # The whole board shows: no scrolling inside the window.
    last = game.get_by_role("gridcell", name="Linha 16, coluna 16: fechada")
    expect(last).to_be_in_viewport()
