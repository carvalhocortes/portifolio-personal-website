"""Solitaire: dealing, the stock, dragging and clicking cards, the menu.

The deal is random, so the tests read the cards on the table (each card has
its id, like "hearts-7", in data-card) and look for a move that fits.
"""

from __future__ import annotations

import pytest
from playwright.sync_api import Locator, Page, expect

from support.pages import SOLITAIRE, Desktop

RED = {"hearts", "diamonds"}


def parse(card_id: str) -> tuple[str, int]:
    suit, rank = card_id.split("-")
    return suit, int(rank)


def fits_on(card: str, target: str | None) -> bool:
    """A card fits on a column top (or an empty column, for a King)."""
    suit, rank = parse(card)
    if target is None:
        return rank == 13
    t_suit, t_rank = parse(target)
    return (suit in RED) != (t_suit in RED) and rank == t_rank - 1


class Table:
    def __init__(self, win: Locator):
        self.win = win

    def pile(self, pile_id: str) -> Locator:
        return self.win.locator(f'[data-pile="{pile_id}"]')

    def top(self, pile_id: str) -> Locator:
        return self.pile(pile_id).locator("[data-card]").last

    def top_id(self, pile_id: str) -> str | None:
        cards = self.pile(pile_id).locator("[data-card]")
        return cards.last.get_attribute("data-card") if cards.count() else None

    def stock(self) -> Locator:
        return self.win.get_by_role("button", name="Monte", exact=False).first

    def menu(self, menu: str, item: str, role: str = "menuitem") -> None:
        self.win.get_by_role("menuitem", name=menu, exact=True).click()
        self.win.get_by_role(role, name=item, exact=True).click()

    def find_move(self) -> tuple[str, str] | None:
        """A pile whose top card fits somewhere, and that place; draws from
        the stock until one shows up (one full turn of it at most)."""
        for _ in range(25):
            sources = [f"tableau-{i}" for i in range(7)]
            if self.top_id("waste"):
                sources.insert(0, "waste")
            for source in sources:
                card = self.top_id(source)
                if not card:
                    continue
                if parse(card)[1] == 1:
                    return source, "foundation-0"
                for i in range(7):
                    target = f"tableau-{i}"
                    if target != source and self.top_id(target) and fits_on(card, self.top_id(target)):
                        return source, target
            self.stock().click()
        return None

    def find_move_in_some_game(self) -> tuple[str, str]:
        for _ in range(10):
            found = self.find_move()
            if found:
                return found
            self.menu("Jogo", "Novo jogo")
        raise AssertionError("no move found in 10 games")

    def moves(self) -> int:
        text = self.win.get_by_text("Jogadas:").inner_text()
        return int(text.split(":")[1])


@pytest.fixture
def table(desktop: Desktop) -> Table:
    return Table(desktop.open(SOLITAIRE))


def test_opens_from_the_start_menu(desktop: Desktop):
    desktop.open_start_menu().get_by_role("menuitem", name=SOLITAIRE).click()
    expect(desktop.window(SOLITAIRE)).to_be_visible()


def test_deals_a_new_game(table: Table):
    expect(table.win.get_by_role("button", name="Monte: 24 cartas")).to_be_visible()
    expect(table.win.get_by_role("button", name="Descarte vazio")).to_be_visible()
    for i in range(7):
        assert table.pile(f"tableau-{i}").locator("[data-card]").count() == i + 1
    expect(table.win.get_by_role("button", name="Coluna 7: 6 cartas escondidas", exact=False)).to_be_visible()
    expect(table.win).to_contain_text("Jogadas: 0")


def test_stock_turns_a_card_and_undo_puts_it_back(table: Table):
    table.stock().click()
    expect(table.win.get_by_role("button", name="Monte: 23 cartas")).to_be_visible()
    assert table.top_id("waste")
    expect(table.win).to_contain_text("Jogadas: 1")
    table.menu("Jogo", "Desfazer")
    expect(table.win.get_by_role("button", name="Monte: 24 cartas")).to_be_visible()
    expect(table.win.get_by_role("button", name="Descarte vazio")).to_be_visible()


def test_drag_a_card_where_it_fits(table: Table):
    source, target = table.find_move_in_some_game()
    card = table.top_id(source)
    before = table.moves()
    table.top(source).drag_to(table.pile(target))
    assert table.top_id(target) == card
    assert table.moves() == before + 1
    # The click right after a drag works too.
    table.stock().click()
    assert table.moves() == before + 2


def test_a_card_dragged_where_it_does_not_fit_goes_back(table: Table):
    table.stock().click()
    card = table.top_id("waste")
    before = table.moves()
    # The stock never takes cards.
    table.top("waste").drag_to(table.pile("stock"))
    assert table.top_id("waste") == card
    assert table.moves() == before


def test_one_click_makes_the_automatic_move(table: Table):
    source, _ = table.find_move_in_some_game()
    card = table.top_id(source)
    before = table.moves()
    table.top(source).click()
    assert table.top_id(source) != card
    assert table.moves() == before + 1


def test_new_game_starts_over(table: Table):
    table.stock().click()
    table.menu("Jogo", "Novo jogo")
    expect(table.win).to_contain_text("Jogadas: 0")
    expect(table.win.get_by_role("button", name="Monte: 24 cartas")).to_be_visible()


def test_draw_three_is_remembered(desktop: Desktop, table: Table, page: Page):
    table.menu("Jogo", "Virar 3 cartas", role="menuitemradio")
    table.stock().click()
    expect(table.win.get_by_role("button", name="Monte: 21 cartas")).to_be_visible()

    page.reload()
    table = Table(desktop.open(SOLITAIRE))
    table.win.get_by_role("menuitem", name="Jogo", exact=True).click()
    expect(table.win.get_by_role("menuitemradio", name="Virar 3 cartas")).to_have_attribute(
        "aria-checked", "true"
    )
    page.keyboard.press("Escape")
    table.stock().click()
    expect(table.win.get_by_role("button", name="Monte: 21 cartas")).to_be_visible()


def test_how_to_play(table: Table, page: Page):
    table.menu("Ajuda", "Como jogar")
    dialog = table.win.get_by_role("dialog", name="Como jogar")
    expect(dialog).to_contain_text("do Ás ao Rei")
    page.keyboard.press("Escape")
    expect(dialog).to_have_count(0)
