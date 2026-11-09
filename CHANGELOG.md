# Changelog

Todas as mudanças perceptíveis do site ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). O site não numera
versões: cada entrega na `main` vira uma seção com a data.

## [Unreleased]

### Changed
- A faixa de fotos do topo da landing usa miniaturas: cerca de 190 KB em vez de 560 KB. O logo do Minha Cena também
  ficou no tamanho em que aparece, e saíram dois arquivos que não eram usados.

- O site carrega menos código na primeira visita: as bibliotecas de Markdown (~45 KB comprimidos) só são baixadas com
  a página que as usa.

### Fixed
- No visualizador de fotos da landing, Esc e as setas continuam funcionando depois de clicar na foto ampliada.

### Security
- Dependências atualizadas: corrigidas as vulnerabilidades críticas e altas apontadas pelo `npm audit`, quase todas
  nas ferramentas de teste e build (Vite 6.4, Vitest 4) e uma no Markdown do site. Atualizações semanais pelo
  Dependabot.

### Added
- Prévia de link ao compartilhar o site (LinkedIn, WhatsApp, X): título, descrição e a imagem com o logo
  Carvalho Côrtes84. Também entram `robots.txt`, `sitemap.xml` e o endereço canônico; `/landing` e `/terminal`
  apontam para a página principal.

### Added
- **ICQ** no desktop, minimizado na barra de tarefas e com a flor ao lado do relógio: a lista de contatos tem só o
  Fernando online (os outros, de piada, ficam offline e não recebem mensagens). Uma mensagem para ele pede nome,
  e-mail e o captcha, chega por e-mail e recebe uma resposta automática no chat.

## 2026-11-08 (velocidade no celular)

### Changed
- A landing page abre mais rápido no celular: o celular não baixa mais o código do desktop e do Terminal, e a fonte,
  a foto e a assinatura começam a baixar logo no início, em vez de esperar a página montar.

## 2026-11-08 (easter eggs)

### Added
- Easter eggs espalhados pelo desktop e pelo Terminal, como o Leia-me promete. Não vamos contar quais são.
- **Reiniciar** e **Desligar** no menu Iniciar: Reiniciar roda a abertura de novo; Desligar mostra a tela de
  "Agora é seguro desligar o computador." por alguns segundos e depois religa.

## 2026-11-08 (relógio e lixeira)

### Added
- **Relógio** no desktop, aberto no canto superior direito quando o site carrega: analógico (no estilo do relógio
  dos anos 90) ou digital com a data por extenso, escolhidos por dois botões embaixo. A escolha fica guardada.
  Clicar nas horas da barra de tarefas também abre o Relógio.
- **Lixeira** no desktop, com uma pasta por projeto antigo: abre as pastas, as fotos ampliadas e os textos. Por
  enquanto, só uma pasta de exemplo.

### Fixed
- O primeiro clique num botão de uma janela que estava atrás de outra agora funciona (antes, só trazia a janela
  para a frente).

### Changed
- README novo, com capturas de tela, os programas e a lista do que está no ar e do que vem depois.

## 2026-11-08 (textos no i18n)

### Fixed
- O site abre no idioma do navegador (inglês para quem usa o navegador em inglês) e lembra a escolha feita no botão
  PT/EN depois de recarregar. Antes, sempre abria em português.

### Changed
- O "sistema" passa a se chamar **CarvalhoCortes 84** (antes "CC 84"), na faixa do menu Iniciar e na abertura em DOS.
- No menu Iniciar, o idioma virou dois botões, pt-BR e en-US: o do idioma atual fica afundado, e clicar no outro
  troca o idioma na hora, com o menu aberto.
- Os textos do site ficam num arquivo por idioma (`src/shared/i18n/locales/`), com conteúdo e interface juntos; o
  `content/site.yaml` guarda só dados (fotos, links, datas). Nenhum texto mudou.

## 2026-11-08 (abertura)

### Added
- Abertura em estilo anos 90 antes do desktop: uma tela de BIOS, linhas de DOS com piadas terminando em
  `C:\> win` e uma tela com o logo "Cortes84", em cerca de 4 s. Aparece uma vez por aba, um clique ou tecla pula,
  e com movimento reduzido mostra só o logo. No celular, em `/terminal` e em `/landing` nada muda.

### Changed
- A landing page carrega mais leve: o captcha do formulário de contato só é baixado quando o formulário chega perto
  da tela ou quando alguém começa a preenchê-lo.
- No celular, a tela não fica mais preta enquanto a landing carrega, e recarregar o desktop não pisca em preto.

## 2026-11-08 (leia-me)

### Added
- Bloco de Notas **Leia-me.txt** no desktop, aberto na frente quando o site carrega: explica o que é o site e
  como usar. Dá para digitar nele, mas nada é salvo; o texto fica no `content/site.yaml`, em PT e EN.

### Fixed
- A primeira letra dos nomes na barra de tarefas e no título das janelas (o N de Navegador, o L de
  Leia-me) não aparece mais cortada.
- O título da página e a barra de endereço do Navegador usam o nome escrito no conteúdo (Fernando Côrtes).

## 2026-11-08 (navegador)

### Added
- Programa **Navegador** no desktop, com ícone próprio: uma janela de navegador que mostra a landing page. A
  barra de endereço é decorativa e mostra o título da página.
- Endereços diretos: `/landing` abre só a landing page e `/terminal` só o Terminal.

### Changed
- O desktop volta a ser a página principal e abre com o Navegador e o Terminal minimizados na barra de
  tarefas.
- No celular, a página principal mostra a landing page direto.
- A landing page se ajusta à largura da janela do Navegador; a foto ampliada cobre só a janela.

### Removed
- O endereço `/desktop`.

### Fixed
- Os botões da barra de tarefas ficam na ordem em que os programas foram abertos; clicar num deles só
  marca como pressionado o que está em foco.

## 2026-11-08 (formulário de contato)

### Fixed
- O formulário de contato volta a enviar: o captcha era recusado porque o token ia em dobro.

## 2026-11-08 (landing page)

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
