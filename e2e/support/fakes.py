"""Fakes for the outside services the site talks to.

No test reaches the real hCaptcha or Web3Forms: a captcha that passes with
one click stands in for hCaptcha, and the Web3Forms endpoint answers whatever
each test asks for, keeping every request for the test to inspect.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field

from playwright.sync_api import Request, Route

WEB3FORMS_URL = "https://api.web3forms.com/submit"
CAPTCHA_TOKEN = "e2e-captcha-token"
CAPTCHA_LABEL = "Sou humano (captcha de teste)"

# Replaces https://js.hcaptcha.com/1/api.js. It implements the part of the
# hCaptcha API that @hcaptcha/react-hcaptcha uses, and calls the onload
# function named in the script URL, as the real one does.
FAKE_HCAPTCHA_JS = """
(() => {
  const widgets = {};
  let next = 1;
  window.hcaptcha = {
    render(container, params) {
      const id = String(next++);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = __LABEL__;
      button.dataset.testid = 'fake-captcha';
      button.addEventListener('click', () => {
        widgets[id].response = __TOKEN__;
        params.callback && params.callback(__TOKEN__);
      });
      container.appendChild(button);
      widgets[id] = { response: '', button };
      return id;
    },
    getResponse: (id) => (widgets[id] ? widgets[id].response : ''),
    getRespKey: () => '',
    reset: (id) => { if (widgets[id]) widgets[id].response = ''; },
    remove: (id) => { if (widgets[id]) { widgets[id].button.remove(); delete widgets[id]; } },
    execute: () => Promise.resolve({ response: __TOKEN__, key: '' }),
    close: () => {},
    setData: () => {},
  };
  const onload = new URL(document.currentScript.src).searchParams.get('onload');
  if (onload && typeof window[onload] === 'function') window[onload]();
})();
""".replace("__LABEL__", json.dumps(CAPTCHA_LABEL)).replace("__TOKEN__", json.dumps(CAPTCHA_TOKEN))


@dataclass
class Web3Forms:
    """The fake Web3Forms endpoint: answers success unless told to fail."""

    fail: bool = False
    requests: list[str] = field(default_factory=list)

    def handle(self, route: Route, request: Request) -> None:
        if request.method == "OPTIONS":
            route.fulfill(status=204, headers=_cors())
            return
        self.requests.append(request.post_data or "")
        body = {"success": not self.fail, "message": "e2e"}
        route.fulfill(
            status=500 if self.fail else 200,
            headers=_cors(),
            content_type="application/json",
            body=json.dumps(body),
        )

    @property
    def last(self) -> str:
        assert self.requests, "nothing was sent to Web3Forms"
        return self.requests[-1]


@dataclass
class Captcha:
    """Counts how many times the hCaptcha script was asked for."""

    loads: int = 0

    def handle(self, route: Route, _request: Request) -> None:
        self.loads += 1
        route.fulfill(content_type="text/javascript", body=FAKE_HCAPTCHA_JS)


def _cors() -> dict[str, str]:
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
    }


def multipart_field(body: str, name: str) -> str | None:
    """The value of one field in a multipart/form-data body."""
    marker = f'name="{name}"'
    start = body.find(marker)
    if start == -1:
        return None
    value_start = body.find("\r\n\r\n", start) + 4
    value_end = body.find("\r\n--", value_start)
    return body[value_start:value_end]
