# Testes de ponta a ponta (E2E)

Abrem o site num navegador de verdade, com [Playwright](https://playwright.dev/python/) e
[pytest](https://pytest.org), e passam por tudo o que uma pessoa faria: desktop, janelas, programas, landing,
Terminal, ICQ, easter eggs, idiomas e celular. Os testes de unidade (Vitest) continuam em `src/`.

## Rodar

Precisa do [uv](https://docs.astral.sh/uv/) e do Node.js (para o build do site).

```bash
cd e2e
uv sync
uv run playwright install chromium
uv run pytest
```

O `pytest` faz o build (`npm run build`), serve o `dist/` com `vite preview` em `http://127.0.0.1:4173` e roda os
testes em paralelo (`pytest-xdist`). Leva cerca de 30 segundos.

| Para | Use |
| --- | --- |
| Pular o build (o `dist/` já está pronto) | `E2E_SKIP_BUILD=1 uv run pytest` |
| Outra porta | `E2E_PORT=4300 uv run pytest` |
| Um arquivo ou um teste | `uv run pytest tests/test_icq.py -k validation` |
| Ver o navegador | `uv run pytest --headed -n 0 --slowmo 300` |
| Outro navegador | `uv run playwright install firefox` e `uv run pytest --browser firefox` |
| Rastro para depurar uma falha | `uv run pytest --tracing retain-on-failure` (abre com `uv run playwright show-trace`) |
| Contra o site no ar | `BASE_URL=https://carvalhocortes.com.br uv run pytest` |

Contra o site no ar, os testes que enviam formulário são pulados (`local_only`).

## Como funcionam

- **Nada sai do site**: o hCaptcha vira um captcha falso que passa com um clique, o Web3Forms responde o que cada
  teste pede (e guarda o que recebeu) e qualquer outra requisição externa recebe uma resposta vazia
  (`support/fakes.py`). Nenhum e-mail de verdade é enviado.
- **Saúde da página**: todo teste falha se a página registrar erro no console ou se algum arquivo do site não
  carregar. Quem espera erro (envio que falha) usa `@pytest.mark.allow_errors`.
- **Seletores** por papel e nome acessível, em português (`support/pages.py`), nunca por classe CSS.
- **Tempo**: protetor de tela e desligamento usam o relógio falso do Playwright (`page.clock`), sem esperar de
  verdade.
- **Celular**: `tests/test_celular.py` roda como um iPhone 13 (tela pequena, toque e user agent de celular).

## Arquivos

```
conftest.py          build, servidor, idioma, tela, simulações e checagem de erros
support/fakes.py     captcha e Web3Forms falsos
support/pages.py     seletores das telas (Desktop, Terminal, Landing)
tests/               um arquivo por área do site
```
