"""Small page objects: the selectors live here, the tests read like steps.

Everything is found by role and accessible name (in Portuguese, the default
language of the tests), never by CSS class.
"""

from __future__ import annotations

from playwright.sync_api import Locator, Page, expect

NAME = "Fernando Côrtes"
PAGE_TITLE = f"{NAME} - Engenheiro de software"

# Desktop program names, as on the icons and the taskbar.
BROWSER = "Navegador"
TERMINAL = "Terminal"
NOTEPAD = "Leia-me.txt"
NOTEPAD_WINDOW = "Leia-me.txt - Bloco de Notas"
CLOCK = "Relógio"
RECYCLE_BIN = "Lixeira"
ICQ = "ICQ"

PROGRAMS = [BROWSER, TERMINAL, NOTEPAD, CLOCK, RECYCLE_BIN, ICQ]


def window_name(program: str) -> str:
    return NOTEPAD_WINDOW if program == NOTEPAD else program


class Desktop:
    def __init__(self, page: Page):
        self.page = page
        self.area = page.get_by_role("region", name="Área de trabalho")
        self.icons = page.get_by_role("list", name="Programas")
        self.taskbar = page.get_by_role("navigation", name="Janelas abertas")
        self.start = page.get_by_role("button", name="Iniciar", exact=True)
        self.start_menu = page.get_by_role("menu", name="Menu Iniciar")

    def icon(self, program: str) -> Locator:
        return self.icons.get_by_role("button", name=program, exact=True)

    def task(self, program: str) -> Locator:
        return self.taskbar.get_by_role("button", name=program, exact=True)

    def window(self, program: str) -> Locator:
        return self.area.get_by_role("region", name=window_name(program), exact=True)

    def open(self, program: str) -> Locator:
        self.icon(program).click()
        win = self.window(program)
        expect(win).to_be_visible()
        return win

    def control(self, program: str, name: str) -> Locator:
        return self.window(program).get_by_role("button", name=name, exact=True)

    def title_bar(self, program: str) -> Locator:
        return self.window(program).get_by_role("heading", name=window_name(program), exact=True)

    def click_empty_desktop(self) -> None:
        """A click on the wallpaper itself, at a spot no window or icon covers."""
        spot = self.area.evaluate(
            """area => {
                const box = area.getBoundingClientRect();
                for (let y = box.bottom - 10; y > box.top; y -= 40)
                    for (let x = box.right - 10; x > box.left; x -= 40)
                        if (document.elementFromPoint(x, y) === area) return { x, y };
                return null;
            }"""
        )
        assert spot, "no free spot on the desktop"
        self.page.mouse.click(spot["x"], spot["y"])

    def open_start_menu(self) -> Locator:
        self.start.click()
        expect(self.start_menu).to_be_visible()
        return self.start_menu


class Terminal:
    def __init__(self, scope: Page | Locator):
        self.scope = scope
        self.input = scope.get_by_role("textbox", name="Terminal command input")
        self.history = scope.get_by_role("log")

    def run(self, command: str) -> Locator:
        """Types a command, presses Enter and returns its output."""
        self.input.fill(command)
        self.input.press("Enter")
        return self.last_output()

    def last_output(self) -> Locator:
        return self.history.get_by_role("article").last.get_by_role("region", name="Command output")


class Landing:
    def __init__(self, scope: Page | Locator):
        self.scope = scope
        self.heading = scope.get_by_role("heading", level=1, name=NAME)
        self.nav = scope.get_by_role("navigation", name="Seções")

    def form_field(self, label: str) -> Locator:
        return self.scope.get_by_label(label, exact=True)

    def contact_form_submit(self) -> Locator:
        return self.scope.get_by_role("button", name="Enviar mensagem")
