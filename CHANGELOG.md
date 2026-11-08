# Changelog

Todas as mudanças perceptíveis do site ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). O site não numera
versões: cada entrega na `main` vira uma seção com a data.

## [Unreleased]

### Added
- Landing page na página principal: abertura com avatar e faixa de fotos, Sobre, Hobbies com galeria
  ampliável, Voluntário e Contato. Modo claro e escuro, PT/EN e layout para celular.
- Formulário de contato que envia a mensagem por e-mail, protegido por captcha (hCaptcha).
- Assinatura "Carvalho Cortes" no topo da landing page.

### Changed
- O desktop com o Terminal passa para `/desktop`.
- Todo o conteúdo vem de um só arquivo, `content/site.yaml`, usado pela landing page e pelo Terminal.
- Fotos em WebP, bem mais leves.
- O e-mail não aparece na landing page; o contato é pelo formulário ou pelo LinkedIn.

## 2026-11-08 (desktop)

### Added
- Desktop no estilo Windows 95 no computador: fundo verde-azulado, ícone do Terminal e barra de
  tarefas com o botão Iniciar, um botão por janela, seletor PT/EN e relógio.
- Menu Iniciar com a faixa "CC 84", que funciona com o mouse e com o teclado.
- Janelas que podem ser arrastadas, redimensionadas pelas bordas e cantos, minimizadas,
  maximizadas e fechadas. O Terminal já abre numa janela quando o site carrega.
- Logo próprio do botão Iniciar: uma bandeira de quatro cores num mastro, em pixel art.

### Changed
- O programa "MS-DOS" passa a se chamar "Terminal".
- O banner das boas-vindas se ajusta à largura da janela do Terminal e muda de idioma junto com o site.
- No celular, o Terminal continua em tela cheia, sem desktop.

## 2026-11-07 (terminal MS-DOS)

### Added
- Visual de MS-DOS no terminal: fundo preto, fonte bitmap Px437 IBM VGA, prompt
  `C:\CARVALHO-CORTES\>` e cursor `_` piscando, parado se o sistema pedir menos movimento.
- Comandos clicáveis nas boas-vindas, no `ajuda` e no `dir`: um clique executa o comando, sem precisar digitar.
- Atalhos nas boas-vindas: SOBRE, HOBBIES, VOLUNTARIO, CONTATO e AJUDA.
- Comando `dir`, que lista as seções como arquivos (`SOBRE.TXT`…).
- Comando `ver`, que mostra a versão do sistema (1984.02.07).
- Ícone próprio do site: um monitor em pixel art com o prompt `>_`.

### Changed
- Comando inválido responde no estilo DOS: "Comando ou nome de arquivo inválido" / "Bad command or file name".
- `ajuda` virou uma lista com os comandos clicáveis.
- Fotos sem moldura e com cantos arredondados. As tabelas só organizam as fotos e não têm linhas.
- Selos de contato menores na seção "sobre".
- Imagens do trabalho voluntário menores: 64% do tamanho das fotos.
- As setas ↑/↓ também trazem os comandos clicados. O `cls` limpa a tela, mas não o histórico.

### Fixed
- A tabela de fotografia não é mais cortada à direita em telas médias.
- Links de comando antigos continuam funcionando depois de trocar o idioma.
- Em inglês, o `clear` volta a limpar a tela.
- Num comando longo, que quebra de linha, o clique cai no caractere mostrado.
- E-mail de contato atualizado para carvalhocortes@gmail.com.
- Depois de clicar num comando, o teclado volta para o prompt: as setas ↑/↓ trazem os comandos em vez de rolar a página.

## 2026-11-07 (GitHub Pages)

### Changed
- Site publicado no GitHub Pages, em https://carvalhocortes.com.br, com HTTPS. Antes ficava num servidor FTP.

### Removed
- Instagram dos contatos, em português e inglês.
