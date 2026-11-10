"""The small programs: Leia-me.txt (Notepad), Clock and Recycle Bin."""

import pytest
from playwright.sync_api import Page, expect

from conftest import SKIP_BOOT_SCRIPT
from support.pages import CLOCK, NOTEPAD, RECYCLE_BIN, Desktop


class TestLeiaMe:
    def text(self, desktop: Desktop):
        return desktop.window(NOTEPAD).get_by_role("textbox", name="Leia-me.txt")

    def test_shows_the_readme(self, desktop: Desktop):
        value = self.text(desktop).input_value()
        assert value.startswith("LEIA-ME")
        for words in ["easter eggs", "carvalhocortes.com.br/landing", "carvalhocortes.com.br/terminal"]:
            assert words in value

    def test_menu_is_decorative(self, desktop: Desktop):
        win = desktop.window(NOTEPAD)
        for item in ["Arquivo", "Editar", "Pesquisar", "Ajuda"]:
            expect(win.get_by_text(item, exact=True)).to_be_visible()
        expect(win.get_by_role("menu")).to_have_count(0)

    def test_editable_but_not_saved(self, desktop: Desktop):
        text = self.text(desktop)
        text.fill("rascunho")
        expect(text).to_have_value("rascunho")
        desktop.control(NOTEPAD, "Fechar").click()
        desktop.open(NOTEPAD)
        assert self.text(desktop).input_value().startswith("LEIA-ME")

    def test_language_switch_brings_the_english_text(self, desktop: Desktop, page: Page):
        self.text(desktop).fill("rascunho")
        page.get_by_role("button", name="PT, mudar o idioma para English").click()
        english = page.get_by_role("textbox", name="Readme.txt")
        assert english.input_value().startswith("README")


class TestClock:
    def face(self, desktop: Desktop):
        return desktop.window(CLOCK).get_by_role("img", name="Agora são")

    def test_analog_by_default(self, desktop: Desktop):
        win = desktop.window(CLOCK)
        expect(win.get_by_role("radio", name="Analógico")).to_have_attribute("aria-checked", "true")
        expect(win.locator('[data-hand="second"]')).to_be_attached()

    def test_hands_move(self, desktop: Desktop, page: Page):
        second = desktop.window(CLOCK).locator('[data-hand="second"]')
        before = second.get_attribute("data-angle")
        page.wait_for_timeout(1100)
        assert second.get_attribute("data-angle") != before

    def test_digital_mode_is_remembered(self, desktop: Desktop, page: Page):
        win = desktop.window(CLOCK)
        win.get_by_role("radio", name="Digital").click()
        expect(win.get_by_role("radio", name="Digital")).to_have_attribute("aria-checked", "true")
        expect(win.locator('[data-hand="second"]')).to_have_count(0)
        expect(self.face(desktop)).to_contain_text(":")
        page.reload()
        expect(desktop.window(CLOCK).get_by_role("radio", name="Digital")).to_have_attribute(
            "aria-checked", "true"
        )

    def test_five_quick_clicks_spin_the_hands(self, page: Page):
        # A fake clock, stopped while clicking: the timing can't flake on a slow machine.
        page.clock.install()
        page.add_init_script(SKIP_BOOT_SCRIPT)
        page.goto("/")
        desktop = Desktop(page)
        minute = desktop.window(CLOCK).locator('[data-hand="minute"]')
        expect(minute).to_be_attached()
        page.clock.pause_at(page.evaluate("Date.now()") / 1000 + 1)  # seconds
        before = float(minute.get_attribute("data-angle"))
        for _ in range(5):
            self.face(desktop).click()
        page.clock.run_for(1000)
        during = float(minute.get_attribute("data-angle"))
        assert abs(during - before) > 90, (before, during)
        # Back to the right time once the 3-second spin is over.
        page.clock.run_for(2500)
        after = float(minute.get_attribute("data-angle"))
        assert abs(after - before) < 1, (before, after)

    def test_reduced_motion_does_not_spin(self, desktop: Desktop, page: Page):
        page.emulate_media(reduced_motion="reduce")
        minute = desktop.window(CLOCK).locator('[data-hand="minute"]')
        before = float(minute.get_attribute("data-angle"))
        for _ in range(5):
            self.face(desktop).click()
        page.wait_for_timeout(800)
        assert abs(float(minute.get_attribute("data-angle")) - before) < 1


class TestRecycleBin:
    @pytest.fixture
    def bin(self, desktop: Desktop):
        return desktop.open(RECYCLE_BIN)

    def address(self, bin):
        return bin.get_by_role("textbox", name="Endereço")

    def test_root(self, bin):
        items = bin.get_by_role("list", name="Lixeira").get_by_role("button")
        assert [i.inner_text().strip() for i in items.all()] == ["Projeto exemplo", "nao_abra.txt"]
        expect(self.address(bin)).to_have_value("Lixeira")
        expect(bin.get_by_role("button", name="Voltar")).to_be_disabled()
        expect(bin).to_contain_text("2 objetos")

    def test_folder_photo_and_text(self, bin, page: Page):
        bin.get_by_role("button", name="Projeto exemplo").click()
        expect(self.address(bin)).to_have_value("Lixeira\\Projeto exemplo")
        expect(bin.get_by_role("button", name="Projeto exemplo")).to_have_count(0)
        expect(bin).to_contain_text("2 objetos")

        bin.get_by_role("button", name="foto-provisoria.svg").click()
        photo = bin.get_by_role("img", name="foto-provisoria.svg")
        expect(photo).to_be_visible()
        assert photo.evaluate("img => img.complete && img.naturalWidth > 0")

        page.keyboard.press("ArrowRight")
        text = bin.get_by_role("textbox", name="leia-me.txt")
        assert text.input_value().startswith("PROJETO EXEMPLO")
        expect(text).to_have_attribute("readonly", "")
        bin.get_by_role("button", name="Arquivo anterior").click()
        expect(photo).to_be_visible()

        page.keyboard.press("Escape")
        expect(self.address(bin)).to_have_value("Lixeira\\Projeto exemplo")
        page.keyboard.press("Escape")
        expect(self.address(bin)).to_have_value("Lixeira")

    def test_do_not_open_file(self, bin):
        bin.get_by_role("button", name="nao_abra.txt").click()
        text = bin.get_by_role("textbox", name="nao_abra.txt")
        expect(text).to_be_focused()
        assert "sudo ajuda" in text.input_value()
        expect(bin.get_by_role("button", name="Próximo arquivo")).to_have_count(0)
        bin.get_by_role("button", name="Voltar").click()
        expect(self.address(bin)).to_have_value("Lixeira")
