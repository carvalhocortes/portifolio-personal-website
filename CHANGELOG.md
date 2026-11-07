# Changelog

Todas as mudanças perceptíveis do site ficam registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). O site não numera
versões: cada entrega na `main` vira uma seção com a data.

## [Unreleased]

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
- As setas ↑/↓ também trazem os comandos clicados. O `cls` limpa a tela, mas não o histórico.

### Fixed
- A tabela de fotografia não é mais cortada à direita em telas médias.
- Links de comando antigos continuam funcionando depois de trocar o idioma.
- Em inglês, o `clear` volta a limpar a tela.
- Num comando longo, que quebra de linha, o clique cai no caractere mostrado.
- E-mail de contato atualizado para carvalhocortes@gmail.com.

## 2026-11-07

### Changed
- Site publicado no GitHub Pages, em https://carvalhocortes.com.br, com HTTPS. Antes ficava num servidor FTP.

### Removed
- Instagram dos contatos, em português e inglês.
