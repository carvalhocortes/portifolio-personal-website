"""The landing page at /landing: sections, menu, hobbies, photos and contact form."""

import pytest
from playwright.sync_api import Page, expect

from support.fakes import CAPTCHA_LABEL, CAPTCHA_TOKEN, Captcha, Web3Forms, multipart_field
from support.pages import NAME, Landing

LINKEDIN = "https://www.linkedin.com/in/carvalhocortes/"
SECTIONS = ["Sobre", "Hobbies", "Trabalho Voluntário", "Entre em contato"]


@pytest.fixture
def landing(page: Page) -> Landing:
    page.goto("/landing/")
    lp = Landing(page)
    expect(lp.heading).to_be_visible()
    return lp


def test_hero(landing: Landing, page: Page):
    expect(page.get_by_text("Engenheiro de software", exact=False).first).to_be_visible()
    avatar = page.get_by_role("main").get_by_role("img").first
    expect(avatar).to_be_visible()
    assert (
        page.evaluate(
            "() => [...document.images].filter(i => i.complete && i.naturalWidth === 0"
            " && i.loading !== 'lazy').map(i => i.src)"
        )
        == []
    )
    expect(page.get_by_role("link", name="LinkedIn").first).to_have_attribute("href", LINKEDIN)
    expect(page.get_by_role("link", name=NAME, exact=True)).to_have_attribute("href", "#inicio")


def test_has_the_four_sections(landing: Landing, page: Page):
    for section in SECTIONS:
        expect(page.get_by_role("heading", level=2, name=section)).to_be_attached()


@pytest.mark.parametrize(
    ("link", "section_id"),
    [
        ("Sobre", "sobre"),
        ("Hobbies", "hobbies"),
        ("Trabalho Voluntário", "voluntario"),
        ("Contato", "contato"),
    ],
)
def test_menu_links_scroll_to_sections(landing: Landing, page: Page, link: str, section_id: str):
    landing.nav.get_by_role("link", name=link, exact=True).click()
    section = page.locator(f'[id="{section_id}"]')
    expect(section).to_be_in_viewport()


def test_skip_link(landing: Landing, page: Page):
    page.keyboard.press("Tab")
    skip = page.get_by_role("link", name="Pular para o conteúdo")
    expect(skip).to_be_focused()
    skip.press("Enter")
    expect(page.locator("#conteudo")).to_be_focused()


def test_language_button_switches_to_english(landing: Landing, page: Page):
    landing.nav.get_by_role("button", name="EN, mudar o idioma para English").click()
    expect(page.get_by_role("heading", level=2, name="About")).to_be_attached()
    expect(page.get_by_role("navigation", name="Sections")).to_be_visible()
    expect(page.locator("html")).to_have_attribute("lang", "en")


def test_photo_strip_pauses(landing: Landing, page: Page):
    pause = page.get_by_role("button", name="Pausar as fotos")
    pause.click()
    play = page.get_by_role("button", name="Continuar as fotos")
    expect(play).to_have_attribute("aria-pressed", "true")
    play.click()
    expect(pause).to_have_attribute("aria-pressed", "false")


class TestHobbies:
    def test_tabs(self, landing: Landing, page: Page):
        tabs = page.get_by_role("tablist").get_by_role("tab")
        expect(tabs.first).to_have_attribute("aria-selected", "true")
        page.get_by_role("tab", name="Fotografia").click()
        expect(page.get_by_role("tab", name="Fotografia")).to_have_attribute("aria-selected", "true")
        expect(page.get_by_role("tabpanel")).to_contain_text("Só se vive uma vez")

    def test_arrow_keys_move_between_tabs(self, landing: Landing, page: Page):
        first = page.get_by_role("tab").first
        first.focus()
        page.keyboard.press("ArrowRight")
        expect(page.get_by_role("tab").nth(1)).to_be_focused()
        expect(page.get_by_role("tab").nth(1)).to_have_attribute("aria-selected", "true")
        page.keyboard.press("Home")
        expect(first).to_be_focused()
        page.keyboard.press("ArrowLeft")
        expect(page.get_by_role("tab").last).to_have_attribute("aria-selected", "true")


class TestLightbox:
    def open(self, page: Page):
        page.get_by_role("button", name="Ampliar a foto: Banco do hall do apartamento").click()
        dialog = page.get_by_role("dialog")
        expect(dialog).to_be_visible()
        return dialog

    def test_opens_with_caption_and_count(self, landing: Landing, page: Page):
        dialog = self.open(page)
        expect(dialog).to_have_accessible_name("Banco do hall do apartamento")
        expect(dialog).to_contain_text("Foto 1 de 3")
        expect(dialog.get_by_role("button", name="Fechar")).to_be_focused()

    def test_arrows_and_buttons_step(self, landing: Landing, page: Page):
        dialog = self.open(page)
        page.keyboard.press("ArrowRight")
        expect(dialog).to_contain_text("Foto 2 de 3")
        dialog.get_by_role("button", name="Próxima foto").click()
        expect(dialog).to_contain_text("Foto 3 de 3")
        dialog.get_by_role("button", name="Próxima foto").click()
        expect(dialog).to_contain_text("Foto 1 de 3")
        dialog.get_by_role("button", name="Foto anterior").click()
        expect(dialog).to_contain_text("Foto 3 de 3")

    def test_escape_closes_and_returns_focus(self, landing: Landing, page: Page):
        self.open(page)
        page.keyboard.press("Escape")
        expect(page.get_by_role("dialog")).to_have_count(0)
        expect(
            page.get_by_role("button", name="Ampliar a foto: Banco do hall do apartamento")
        ).to_be_focused()

    def test_tab_stays_inside(self, landing: Landing, page: Page):
        dialog = self.open(page)
        for _ in range(4):
            page.keyboard.press("Tab")
            assert dialog.evaluate("d => d.contains(document.activeElement)")

    def test_backdrop_click_closes(self, landing: Landing, page: Page):
        self.open(page)
        page.mouse.click(5, 5)
        expect(page.get_by_role("dialog")).to_have_count(0)


def test_volunteer_links_open_in_a_new_tab(landing: Landing, page: Page):
    links = page.get_by_role("link", name="(abre em outra aba)")
    assert links.count() >= 1
    for link in links.all():
        expect(link).to_have_attribute("target", "_blank")
        expect(link).to_have_attribute("rel", "noreferrer")


class TestContactForm:
    def go_to_form(self, page: Page):
        page.locator("#contato").scroll_into_view_if_needed()
        expect(page.get_by_role("button", name=CAPTCHA_LABEL)).to_be_visible()

    def fill(self, page: Page, name="Ana", email="ana@exemplo.com", message="Oi!"):
        page.get_by_label("Nome", exact=True).fill(name)
        page.get_by_label("Seu e-mail", exact=True).fill(email)
        page.get_by_label("Mensagem", exact=True).fill(message)

    def test_captcha_loads_only_near_the_form(self, landing: Landing, page: Page, captcha: Captcha):
        page.wait_for_load_state("networkidle")
        assert captcha.loads == 0
        self.go_to_form(page)
        assert captcha.loads == 1

    def test_empty_form_shows_every_error(self, landing: Landing, page: Page, web3forms: Web3Forms):
        self.go_to_form(page)
        page.get_by_role("button", name="Enviar mensagem").click()
        expect(page.get_by_text("Preencha este campo.")).to_have_count(3)
        expect(page.get_by_role("alert")).to_have_text("Confirme que você não é um robô.")
        expect(page.get_by_label("Nome", exact=True)).to_be_focused()
        expect(page.get_by_label("Nome", exact=True)).to_have_attribute("aria-invalid", "true")
        assert web3forms.requests == []

    def test_invalid_email(self, landing: Landing, page: Page, web3forms: Web3Forms):
        self.go_to_form(page)
        self.fill(page, email="ana@")
        page.get_by_role("button", name=CAPTCHA_LABEL).click()
        page.get_by_role("button", name="Enviar mensagem").click()
        expect(page.get_by_text("Digite um e-mail válido")).to_be_visible()
        expect(page.get_by_label("Seu e-mail", exact=True)).to_be_focused()
        assert web3forms.requests == []

    def test_missing_captcha(self, landing: Landing, page: Page, web3forms: Web3Forms):
        self.go_to_form(page)
        self.fill(page)
        page.get_by_role("button", name="Enviar mensagem").click()
        expect(page.get_by_role("alert")).to_have_text("Confirme que você não é um robô.")
        assert web3forms.requests == []

    @pytest.mark.local_only
    def test_sends_the_message(self, landing: Landing, page: Page, web3forms: Web3Forms):
        self.go_to_form(page)
        self.fill(page, name="Ana Teste", message="Olá, Fernando!")
        page.get_by_role("button", name=CAPTCHA_LABEL).click()
        page.get_by_role("button", name="Enviar mensagem").click()
        expect(page.get_by_role("status")).to_contain_text("Mensagem enviada. Obrigado!")
        expect(page.get_by_role("status")).to_be_focused()
        body = web3forms.last
        assert multipart_field(body, "name") == "Ana Teste"
        assert multipart_field(body, "email") == "ana@exemplo.com"
        assert multipart_field(body, "message") == "Olá, Fernando!"
        assert multipart_field(body, "h-captcha-response") == CAPTCHA_TOKEN
        assert multipart_field(body, "subject") == "Mensagem pelo site de Ana Teste"
        assert multipart_field(body, "access_key")

    @pytest.mark.local_only
    @pytest.mark.allow_errors  # the failed request is logged by the browser
    def test_failure_shows_linkedin(self, landing: Landing, page: Page, web3forms: Web3Forms):
        web3forms.fail = True
        self.go_to_form(page)
        self.fill(page)
        page.get_by_role("button", name=CAPTCHA_LABEL).click()
        page.get_by_role("button", name="Enviar mensagem").click()
        alert = page.get_by_role("alert")
        expect(alert).to_contain_text("Não foi possível enviar agora")
        expect(alert.get_by_role("link", name="LinkedIn")).to_have_attribute("href", LINKEDIN)
        # The captcha must be solved again for another try.
        page.get_by_role("button", name="Enviar mensagem").click()
        expect(page.get_by_text("Confirme que você não é um robô.")).to_be_visible()
        assert len(web3forms.requests) == 1
