<div align="center">

# 💻 Terminal Portfolio - Fernando Cortes

<img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
<img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
<img src="https://img.shields.io/badge/Vite-6.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
<img src="https://img.shields.io/badge/i18next-25.6.0-26A69A?style=for-the-badge&logo=i18next&logoColor=white" alt="i18next" />
<img src="https://img.shields.io/badge/Vitest-3.2.4-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
<img src="https://img.shields.io/badge/Coverage-95%25-brightgreen?style=for-the-badge" alt="Coverage" />
[<img alt="Deployed with FTP Deploy Action" src="https://img.shields.io/badge/Deployed With-FTP DEPLOY ACTION-%3CCOLOR%3E?style=for-the-badge&color=d00000">](https://github.com/SamKirkland/FTP-Deploy-Action)

**Um portfólio interativo inspirado em terminal Unix/Linux, construído com React e TypeScript**

[🐛 Reportar Bug / ✨ Solicitar Feature](https://github.com/carvalhocortes/portifolio-personal-website/issues)

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Status do Projeto](#-status-do-projeto)
- [Demonstração](#-demonstração)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Como Usar](#-como-usar)
- [Comandos Disponíveis](#-comandos-disponíveis)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)
- [Autor](#-autor)
- [Agradecimentos](#-agradecimentos)

---

## 🎯 Sobre o Projeto

Este é um **portfólio pessoal interativo** que simula um terminal de linha de comando Unix/Linux. Desenvolvido com foco em **experiência do usuário**, **performance** e **boas práticas de engenharia de software**, o projeto oferece uma forma única e moderna de apresentar informações profissionais.

### Por que um Terminal?

- **🎨 Diferenciação**: Uma abordagem criativa e memorável para um portfólio
- **💡 Demonstração de Habilidades**: Mostra conhecimento em desenvolvimento front-end e UX
- **🎮 Interatividade**: Engaja o visitante de forma lúdica e interativa
- **⚡ Performance**: Construído com tecnologias modernas e otimizado para velocidade

---

## 🚦 Status do Projeto

<div align="center">

### ✅ Versão 2.0 - Em Produção

![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen?style=flat-square)
![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=flat-square)

</div>

### ✨ Funcionalidades Implementadas

- ✅ Interface de terminal interativa
- ✅ Sistema de comandos customizados
- ✅ Internacionalização (PT-BR e EN-US)
- ✅ Renderização de Markdown
- ✅ Histórico de comandos
- ✅ Responsividade completa
- ✅ Testes unitários com >95% de cobertura
- ✅ CI/CD com GitHub Actions
- ✅ Deploy automatizado via FTP

---

## ⚡ Funcionalidades

### 🎯 Funcionalidades Principais

- **Terminal Interativo**: Interface de linha de comando totalmente funcional
- **Sistema de Comandos**: Conjunto completo de comandos customizados para navegação
- **Histórico de Comandos**: Navegação por comandos anteriores com setas ↑/↓
- **Auto-complete**: Sugestões inteligentes de comandos (Tab)
- **Markdown Support**: Renderização de conteúdo Markdown com suporte a GFM
- **Internacionalização**: Suporte completo para PT-BR e EN-US
- **Tema Customizado**: Visual inspirado em terminais clássicos com cores modernas
- **Responsivo**: Adaptado para desktop, tablet e mobile

### 🛠️ Funcionalidades Técnicas

- **Feature-Sliced Design**: Arquitetura escalável e manutenível
- **Type Safety**: TypeScript estrito para maior confiabilidade
- **Code Quality**: ESLint + Prettier para código consistente
- **Testing**: Vitest com alta cobertura de testes
- **Performance**: Lazy loading e otimizações de bundle
- **Acessibilidade**: Suporte a navegação por teclado

---

## 🚀 Tecnologias Utilizadas

### Core

- **[React 19.1.0](https://react.dev/)** - Biblioteca para construção de interfaces
- **[TypeScript 5.8.3](https://www.typescriptlang.org/)** - Superset JavaScript com tipagem estática
- **[Vite 6.3.5](https://vite.dev/)** - Build tool e dev server de alta performance

### Bibliotecas e Frameworks

- **[i18next 25.6.0](https://www.i18next.com/)** - Framework de internacionalização
- **[react-i18next 16.1.0](https://react.i18next.com/)** - Integração do i18next com React
- **[react-markdown 10.1.0](https://github.com/remarkjs/react-markdown)** - Renderizador Markdown para React
- **[remark-gfm 4.0.1](https://github.com/remarkjs/remark-gfm)** - Plugin para GitHub Flavored Markdown

### Testes

- **[Vitest 3.2.4](https://vitest.dev/)** - Framework de testes unitários
- **[@testing-library/react 16.3.0](https://testing-library.com/react)** - Utilitários para testes de componentes
- **[@vitest/coverage-v8 3.2.4](https://vitest.dev/guide/coverage.html)** - Relatórios de cobertura de código

### Qualidade de Código

- **[ESLint 9.25.0](https://eslint.org/)** - Linter para JavaScript/TypeScript
- **[Prettier 3.6.2](https://prettier.io/)** - Formatador de código
- **[TypeScript ESLint 8.30.1](https://typescript-eslint.io/)** - Regras ESLint para TypeScript

### DevOps

- **GitHub Actions** - CI/CD pipeline
- **FTP Deploy** - Deploy automatizado

---

## 📦 Pré-requisitos

Antes de começar, você precisará ter instalado em sua máquina:

- **[Node.js](https://nodejs.org/)** - Versão 18.x ou superior
- **[npm](https://www.npmjs.com/)** - Versão 9.x ou superior (incluso no Node.js)
- **[Git](https://git-scm.com/)** - Para clonar o repositório

### Verificando as versões instaladas:

```bash
node --version  # Deve retornar v18.x.x ou superior
npm --version   # Deve retornar 9.x.x ou superior
git --version   # Deve retornar 2.x.x ou superior
```

---

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/carvalhocortes/portifolio-personal-website.git
cd portifolio-personal-website
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute o projeto em modo de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## 💻 Como Usar

### Iniciando a Aplicação

1. Acesse a aplicação no navegador
2. Você verá uma tela de boas-vindas com o logo ASCII
3. Digite `ajuda` ou `help` para ver todos os comandos disponíveis

### Atalhos de Teclado

- `↑` / `↓` - Navegar pelo histórico de comandos
- `Enter` - Executar comando

---

## 📟 Comandos Disponíveis

### Informações Pessoais

| Comando      | Aliases                     | Descrição                                                                  |
| ------------ | --------------------------- | -------------------------------------------------------------------------- |
| `sobre`      | `info`                      | Exibe informações sobre mim, incluindo formação, experiência e habilidades |
| `hobbies`    | `interesses`                | Lista meus hobbies: marcenaria, fotografia e DIY                           |
| `voluntario` | `trabalho-voluntario`, `tv` | Mostra projetos de trabalho voluntário                                     |
| `contato`    | `email`                     | Exibe informações de contato (email, LinkedIn, Instagram)                  |

### Navegação e Utilidades

| Comando  | Aliases               | Descrição                                        |
| -------- | --------------------- | ------------------------------------------------ |
| `ajuda`  | `help`, `h`           | Mostra lista completa de comandos disponíveis    |
| `idioma` | `language`, `lang`    | Alterna entre Português (PT-BR) e Inglês (EN-US) |
| `limpar` | `cls`                 | Limpa o histórico do terminal                    |
| `start`  | `bem-vindo`, `inicio` | Exibe novamente a mensagem de boas-vindas        |

---

## 🎯 Scripts Disponíveis

### Desenvolvimento

```bash
# Inicia servidor de desenvolvimento
npm run dev

# Inicia servidor com preview da build de produção
npm run preview
```

### Build e Produção

```bash
# Compila TypeScript e gera build de produção
npm run build

# Apenas compila TypeScript (verificação de tipos)
npm run build:types
```

### Testes

```bash
# Executa todos os testes
npm test

# Executa testes em modo watch
npm run test:watch

# Executa testes com interface UI
npm run test:ui

# Gera relatório de cobertura
npm run test:coverage
```

### Qualidade de Código

```bash
# Executa linter (ESLint)
npm run lint

# Corrige automaticamente problemas de lint
npm run lint:fix

# Verifica formatação (Prettier)
npm run format:check

# Formata automaticamente o código
npm run format
```

---

## 📁 Estrutura do Projeto

O projeto segue a arquitetura **Feature-Sliced Design (FSD)** para melhor organização e escalabilidade:

```
personal-website/
├── public/                    # Arquivos estáticos
│   └── resources/            # Imagens e recursos
├── src/
│   ├── app/                  # Configurações globais da aplicação
│   │   └── styles/          # Estilos globais (CSS)
│   ├── entities/             # Entidades de negócio
│   │   └── Command/         # Definições de tipos de comandos
│   ├── features/             # Funcionalidades da aplicação
│   │   ├── CommandHistory/  # Histórico de comandos
│   │   └── CommandInput/    # Input de comandos
│   ├── pages/                # Páginas da aplicação
│   │   └── TerminalPage/    # Página principal do terminal
│   ├── shared/               # Código compartilhado
│   │   ├── config/          # Constantes e configurações
│   │   ├── i18n/            # Internacionalização
│   │   ├── lib/             # Utilitários e hooks
│   │   └── ui/              # Componentes UI reutilizáveis
│   ├── test/                 # Configurações de teste
│   ├── widgets/              # Widgets complexos
│   │   └── Terminal/        # Widget principal do terminal
│   │       ├── commands/    # Implementação dos comandos
│   │       ├── model/       # Lógica de negócio do terminal
│   │       └── ui/          # Interface do terminal
│   ├── App.tsx               # Componente raiz
│   └── main.tsx              # Entry point
├── coverage/                  # Relatórios de cobertura de testes
├── .github/                   # GitHub Actions workflows
├── eslint.config.js          # Configuração ESLint
├── vite.config.ts            # Configuração Vite
├── tsconfig.json             # Configuração TypeScript
└── package.json              # Dependências e scripts

```

### Princípios Arquiteturais

- **Feature-Sliced Design**: Organização por funcionalidades
- **Separation of Concerns**: Separação clara de responsabilidades
- **DRY (Don't Repeat Yourself)**: Reutilização de código
- **SOLID Principles**: Aplicados em toda a base de código
- **Clean Code**: Código limpo e legível

---

## 🧪 Testes

O projeto possui uma suíte completa de testes com **>95% de cobertura**.

### Executar Testes

```bash
# Todos os testes
npm test

# Modo watch (reexecuta ao salvar)
npm run test:watch

# Com interface visual
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

### Visualizar Cobertura

Após executar `npm run test:coverage`, abra o arquivo `coverage/index.html` no navegador.

### Estrutura de Testes

```
src/
├── features/
│   ├── CommandHistory/
│   │   └── ui/
│   │       ├── CommandHistory.tsx
│   │       └── CommandHistory.test.tsx  ✓
│   └── CommandInput/
│       └── ui/
│           ├── CommandInput.tsx
│           └── CommandInput.test.tsx    ✓
├── shared/
│   └── lib/
│       ├── terminalUtils.ts
│       ├── terminalUtils.test.ts        ✓
│       ├── useScreenSize.ts
│       └── useScreenSize.test.ts        ✓
└── widgets/
    └── Terminal/
        ├── commands/
        │   └── language.test.ts          ✓
        └── model/
            └── useTerminal.ts
```

---

## 🚀 Deploy

O projeto utiliza **GitHub Actions** para CI/CD automatizado com deploy via FTP.

### Configuração do Deploy

1. **Configure os secrets no GitHub**:
   - `FTP_SERVER` - Endereço do servidor FTP
   - `FTP_USERNAME` - Usuário FTP
   - `FTP_PASSWORD` - Senha FTP

2. **Script auxiliar** (opcional):
   ```bash
   # Crie um arquivo .env.ghsecrets com suas credenciais
   ./setup-ftp-secrets.sh
   ```

### Workflow de Deploy

O deploy é acionado automaticamente ao fazer push na branch `main`:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
```

### Deploy Manual

```bash
# Build local
npm run build

# Os arquivos estarão em dist/
# Faça upload manual via FTP client
```

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Se você tem alguma sugestão para melhorar este projeto, sinta-se à vontade para criar um fork e abrir um Pull Request.

### Como Contribuir

1. **Fork o projeto**
2. **Crie sua Feature Branch**
   ```bash
   git checkout -b feature/MinhaNovaFuncionalidade
   ```
3. **Commit suas mudanças**
   ```bash
   git commit -m 'feat: Adiciona nova funcionalidade X'
   ```
4. **Push para a Branch**
   ```bash
   git push origin feature/MinhaNovaFuncionalidade
   ```
5. **Abra um Pull Request**

### Convenção de Commits

Este projeto segue a [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações na documentação
- `style:` - Formatação, ponto e vírgula faltando, etc
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Tarefas de manutenção

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2025 Fernando Cortes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 Autor

<div align="center">

### **Fernando Cortes**

Engenheiro Eletricista | Desenvolvedor Full Stack | Entusiasta de Cloud Computing

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/carvalhocortes)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/carvalhocortes)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/carvalhocortes)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:carvalhocortes@gmail.com)

**"A engenharia me ensinou que posso construir qualquer coisa."**

</div>

### ⭐ Se este projeto foi útil para você, considere dar uma estrela!
