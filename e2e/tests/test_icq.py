"""ICQ: contacts, offline notice, chat, identification, sending and reply."""

import pytest
from playwright.sync_api import Locator, Page, expect

from support.fakes import CAPTCHA_LABEL, CAPTCHA_TOKEN, Captcha, Web3Forms, multipart_field
from support.pages import ICQ, NAME, Desktop

OFFLINE = ["Bug em Produção", "Café", "Deploy de Sexta", "Recrutador", "Wi-Fi do Vizinho", "Mãe"]


@pytest.fixture
def icq(desktop: Desktop) -> Locator:
    desktop.task(ICQ).click()
    win = desktop.window(ICQ)
    expect(win).to_be_visible()
    return win


def open_chat(icq: Locator) -> Locator:
    icq.get_by_role("button", name=NAME, exact=True).click()
    return icq.get_by_role("textbox", name=f"Mensagem para {NAME}")


def send_draft(icq: Locator, text: str) -> Locator:
    draft = open_chat(icq)
    draft.fill(text)
    draft.press("Enter")
    form = icq.get_by_role("form", name="Seus dados")
    expect(form).to_be_visible()
    return form


def test_contact_list(icq: Locator):
    expect(icq).to_contain_text("Online")
    expect(icq.get_by_role("button", name=NAME, exact=True)).to_be_visible()
    for name in OFFLINE:
        expect(icq.get_by_role("button", name=f"{name} (offline)")).to_be_visible()


def test_offline_contact_shows_a_notice(icq: Locator):
    icq.get_by_role("button", name="Bug em Produção (offline)").click()
    expect(icq.get_by_role("status")).to_have_text(
        "Bug em Produção está offline e não pode receber mensagens."
    )
    expect(icq.get_by_role("log")).to_have_count(0)


def test_chat_opens_with_a_hint_and_goes_back(icq: Locator):
    open_chat(icq)
    log = icq.get_by_role("log", name=f"Conversa com {NAME}")
    expect(log).to_contain_text("Ele responde por e-mail")
    expect(icq.get_by_role("button", name="Enviar", exact=True)).to_be_disabled()
    icq.get_by_role("button", name="Voltar").click()
    expect(icq.get_by_role("button", name="Mãe (offline)")).to_be_visible()


def test_shift_enter_breaks_the_line(icq: Locator):
    draft = open_chat(icq)
    draft.type("linha 1")
    draft.press("Shift+Enter")
    draft.type("linha 2")
    expect(draft).to_have_value("linha 1\nlinha 2")
    expect(icq.get_by_role("form")).to_have_count(0)


def test_message_asks_for_name_email_and_captcha(icq: Locator, captcha: Captcha):
    form = send_draft(icq, "Oi, Fernando!")
    expect(icq.get_by_role("log")).to_contain_text("Você: Oi, Fernando!")
    expect(form.get_by_label("Nome")).to_be_visible()
    expect(form.get_by_label("Seu e-mail")).to_be_visible()
    expect(form.get_by_role("button", name=CAPTCHA_LABEL)).to_be_visible()
    assert captcha.loads == 1
    # While waiting, the draft box is locked.
    expect(icq.get_by_role("textbox", name=f"Mensagem para {NAME}")).to_be_disabled()


def test_validation(icq: Locator, web3forms: Web3Forms):
    form = send_draft(icq, "Oi")
    submit = form.get_by_role("button", name=f"Enviar para o {NAME}")
    submit.click()
    expect(form.get_by_text("Preencha este campo.")).to_have_count(2)
    expect(form.get_by_role("alert")).to_have_text("Confirme que você não é um robô.")
    expect(form.get_by_label("Nome")).to_be_focused()

    form.get_by_label("Nome").fill("Ana")
    form.get_by_label("Seu e-mail").fill("ana@")
    submit.click()
    expect(form.get_by_text("Digite um e-mail válido")).to_be_visible()
    expect(form.get_by_label("Seu e-mail")).to_be_focused()
    assert web3forms.requests == []


@pytest.mark.local_only
def test_sends_and_gets_a_reply(icq: Locator, web3forms: Web3Forms):
    form = send_draft(icq, "Oi, Fernando!")
    form.get_by_label("Nome").fill("Ana")
    form.get_by_label("Seu e-mail").fill("ana@exemplo.com")
    form.get_by_role("button", name=CAPTCHA_LABEL).click()
    form.get_by_role("button", name=f"Enviar para o {NAME}").click()

    log = icq.get_by_role("log")
    expect(log).to_contain_text(
        f"{NAME}: Oi, Ana! Recebi sua mensagem. Já te respondo no ana@exemplo.com. :)"
    )
    expect(icq.get_by_role("form")).to_have_count(0)
    body = web3forms.last
    assert multipart_field(body, "name") == "Ana"
    assert multipart_field(body, "email") == "ana@exemplo.com"
    assert multipart_field(body, "message") == "Oi, Fernando!"
    assert multipart_field(body, "subject") == "Mensagem pelo ICQ do site - Ana"
    assert multipart_field(body, "h-captcha-response") == CAPTCHA_TOKEN

    # The next message only asks for the captcha again.
    draft = icq.get_by_role("textbox", name=f"Mensagem para {NAME}")
    draft.fill("Mais uma")
    draft.press("Enter")
    form = icq.get_by_role("form", name="Seus dados")
    expect(form).to_contain_text("Confirme que você não é um robô para enviar:")
    expect(form.get_by_label("Nome")).to_have_count(0)
    form.get_by_role("button", name=CAPTCHA_LABEL).click()
    form.get_by_role("button", name=f"Enviar para o {NAME}").click()
    expect(log.get_by_text("Oi, Ana!", exact=False)).to_have_count(2)
    assert multipart_field(web3forms.last, "message") == "Mais uma"


@pytest.mark.local_only
@pytest.mark.allow_errors  # the failed request is logged by the browser
def test_failure_shows_linkedin(icq: Locator, web3forms: Web3Forms):
    web3forms.fail = True
    form = send_draft(icq, "Oi")
    form.get_by_label("Nome").fill("Ana")
    form.get_by_label("Seu e-mail").fill("ana@exemplo.com")
    form.get_by_role("button", name=CAPTCHA_LABEL).click()
    form.get_by_role("button", name=f"Enviar para o {NAME}").click()
    alert = form.get_by_role("alert")
    expect(alert).to_contain_text("Não foi possível enviar agora")
    expect(alert.get_by_role("link", name="LinkedIn")).to_be_visible()
    expect(icq.get_by_role("log")).not_to_contain_text("Recebi sua mensagem")


def test_send_button_works_like_enter(icq: Locator, page: Page):
    draft = open_chat(icq)
    draft.fill("Pelo botão")
    icq.get_by_role("button", name="Enviar", exact=True).click()
    expect(icq.get_by_role("log")).to_contain_text("Você: Pelo botão")
