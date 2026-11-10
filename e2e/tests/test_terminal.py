"""The DOS-style Terminal: commands, links, history, language and secrets."""

import re

import pytest
from playwright.sync_api import Page, expect

from support.pages import NAME, TERMINAL, Desktop, Terminal


@pytest.fixture
def terminal(page: Page) -> Terminal:
    page.goto("/terminal/")
    term = Terminal(page)
    expect(term.input).to_be_focused()
    return term


def test_starts_with_the_welcome(terminal: Terminal):
    welcome = terminal.last_output()
    expect(welcome.get_by_role("heading", name="Bem vindo a minha pagina!")).to_be_visible()
    for shortcut in ["SOBRE", "HOBBIES", "VOLUNTARIO", "CONTATO", "AJUDA"]:
        expect(welcome.get_by_role("button", name=shortcut, exact=True)).to_be_visible()


def test_help_lists_the_commands(terminal: Terminal):
    output = terminal.run("ajuda")
    expect(output).to_contain_text("Comandos disponíveis:")
    for command in ["sobre", "hobbies", "contato", "idioma", "limpar", "dir", "ver"]:
        expect(output.get_by_role("button", name=command, exact=True).first).to_be_visible()
    # The administrator's commands stay hidden.
    expect(output).not_to_contain_text("sudo")


@pytest.mark.parametrize(
    ("command", "expected"),
    [
        ("sobre", "Olá,"),
        ("info", "Olá,"),
        ("hobbies", "Marcenaria"),
        ("voluntario", "Trabalho Voluntário"),
        ("tv", "Trabalho Voluntário"),
        ("contato", "carvalhocortes@gmail.com"),
        ("dir", "Pasta de C:\\CARVALHO-CORTES"),
        ("ls", "VOLUNTAR"),
        ("ver", "CARVALHO-CORTES Versão"),
        ("help", "Comandos disponíveis:"),
        ("SOBRE", "Olá,"),
        ("  sobre  ", "Olá,"),
    ],
)
def test_commands_and_aliases(terminal: Terminal, command: str, expected: str):
    expect(terminal.run(command)).to_contain_text(expected)


def test_contact_links(terminal: Terminal):
    output = terminal.run("contato")
    expect(output.get_by_role("link", name="carvalhocortes@gmail.com")).to_have_attribute(
        "href", "mailto:carvalhocortes@gmail.com"
    )
    expect(output.get_by_role("link", name="linkedin.com/in/carvalhocortes")).to_have_attribute(
        "href", "https://www.linkedin.com/in/carvalhocortes/"
    )


def test_unknown_command(terminal: Terminal):
    expect(terminal.run("xyz")).to_contain_text("Comando ou nome de arquivo inválido")


def test_empty_enter_does_nothing(terminal: Terminal):
    before = terminal.history.get_by_role("article").count()
    terminal.input.press("Enter")
    expect(terminal.history.get_by_role("article")).to_have_count(before)


def test_clicking_a_command_runs_it_and_keeps_the_focus(terminal: Terminal):
    terminal.last_output().get_by_role("button", name="SOBRE").click()
    expect(terminal.history.get_by_role("article").last).to_have_accessible_name("Command: sobre")
    expect(terminal.last_output()).to_contain_text("Olá,")
    expect(terminal.input).to_be_focused()


def test_clicking_the_screen_focuses_the_prompt(terminal: Terminal, page: Page):
    terminal.input.blur()
    page.get_by_role("heading", name="Bem vindo a minha pagina!").click()
    expect(terminal.input).to_be_focused()


def test_arrow_keys_walk_the_history(terminal: Terminal):
    terminal.run("sobre")
    terminal.run("dir")
    terminal.input.press("ArrowUp")
    expect(terminal.input).to_have_value("dir")
    terminal.input.press("ArrowUp")
    expect(terminal.input).to_have_value("sobre")
    terminal.input.press("ArrowDown")
    expect(terminal.input).to_have_value("dir")
    terminal.input.press("ArrowDown")
    expect(terminal.input).to_have_value("")


def test_enter_never_breaks_the_line(terminal: Terminal):
    terminal.input.fill("so")
    terminal.input.press("Shift+Enter")
    expect(terminal.input).not_to_have_value(re.compile("\n"))


def test_clear_leaves_only_the_welcome(terminal: Terminal):
    terminal.run("sobre")
    terminal.run("cls")
    articles = terminal.history.get_by_role("article")
    expect(articles).to_have_count(1)
    expect(articles.get_by_role("heading", name="Bem vindo a minha pagina!")).to_be_visible()
    # The typed history survives the clear.
    terminal.input.press("ArrowUp")
    expect(terminal.input).to_have_value("cls")


def test_language_switch_keeps_old_links_working(terminal: Terminal, page: Page):
    expect(terminal.run("idioma")).to_contain_text("Language changed to: en-US")
    expect(terminal.run("help")).to_contain_text("Available commands:")
    # A Portuguese link written before the switch still runs.
    page.get_by_role("button", name="SOBRE", exact=True).click()
    expect(terminal.last_output()).to_contain_text("Hello,")
    expect(terminal.run("language")).to_contain_text("Idioma alterado para: pt-BR")


class TestSecrets:
    def test_coffee(self, terminal: Terminal):
        expect(terminal.run("café")).to_contain_text("Pausa para o café")

    def test_fortune(self, terminal: Terminal):
        fortunes = [
            "Funciona na minha máquina.",
            "Todo código legado",
            "Engenheiro eletricista",
            "Não existe bug",
            "Medir duas vezes",
            "O café é a dependência",
        ]
        text = terminal.run("sorte").inner_text()
        assert any(f in text for f in fortunes), text

    def test_sudo(self, terminal: Terminal):
        expect(terminal.run("sudo")).to_contain_text("Permissão negada")

    def test_sudo_help_lists_the_secrets(self, terminal: Terminal):
        output = terminal.run("sudo ajuda")
        expect(output).to_contain_text("Comandos do administrador")
        for command in ["cafe", "matrix", "sorte", "hackear", "sair"]:
            expect(output.get_by_role("button", name=command, exact=True)).to_be_visible()

    def test_exit_on_the_terminal_page(self, terminal: Terminal):
        expect(terminal.run("sair")).to_contain_text("Não dá para sair: você já está em casa.")

    @pytest.mark.parametrize(
        ("command", "end"),
        [("matrix", "pílula vermelha"), ("hackear", "Acesso concedido")],
    )
    def test_effects_play_and_end_with_a_key(self, terminal: Terminal, page: Page, command: str, end: str):
        output = terminal.run(command)
        effect = page.get_by_test_id("terminal-effect")
        expect(effect).to_have_attribute("data-effect", "matrix" if command == "matrix" else "hack")
        page.keyboard.press("Escape")
        expect(effect).to_have_count(0)
        expect(output).to_contain_text(end)
        expect(terminal.input).to_be_focused()

    def test_effect_ends_with_a_click(self, terminal: Terminal, page: Page):
        terminal.run("matrix")
        page.get_by_test_id("terminal-effect").click()
        expect(page.get_by_test_id("terminal-effect")).to_have_count(0)


def test_exit_closes_the_terminal_window_on_the_desktop(desktop: Desktop):
    desktop.task(TERMINAL).click()
    term = Terminal(desktop.window(TERMINAL))
    expect(term.input).to_be_focused()
    term.input.fill("sair")
    term.input.press("Enter")
    expect(desktop.window(TERMINAL)).to_have_count(0)
    expect(desktop.task(TERMINAL)).to_have_count(0)


def test_terminal_window_runs_commands(desktop: Desktop):
    desktop.task(TERMINAL).click()
    term = Terminal(desktop.window(TERMINAL))
    expect(term.run("contato")).to_contain_text("carvalhocortes@gmail.com")
    expect(term.run("sobre")).to_contain_text(NAME.split()[0])
