#!/bin/bash

# Script para enviar credenciais FTP para GitHub Secrets e Variables
# Uso: ./setup-ftp-secrets.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== GitHub FTP Secrets Setup ===${NC}\n"

# Verificar se o arquivo .env.ghsecrets existe
if [ ! -f ".env.ghsecrets" ]; then
    echo -e "${RED}❌ Arquivo .env.ghsecrets não encontrado!${NC}"
    echo -e "${YELLOW}Crie o arquivo .env.ghsecrets baseado no .env.ghsecrets.example${NC}"
    exit 1
fi

# Carregar variáveis do arquivo .env.ghsecrets
source .env.ghsecrets

# Verificar se todas as variáveis foram carregadas
if [ -z "$FTP_SERVER" ] || [ -z "$FTP_USERNAME" ] || [ -z "$FTP_PASSWORD" ] || [ -z "$FTP_DIRECTORY" ]; then
    echo -e "${RED}❌ Erro: Variáveis FTP não encontradas no .env.ghsecrets${NC}"
    echo -e "${YELLOW}Verifique se todas as variáveis estão definidas no arquivo.${NC}"
    exit 1
fi

# Verificar se GitHub CLI está instalado
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) não está instalado!${NC}"
    echo -e "${YELLOW}Instale com: brew install gh${NC}"
    echo -e "${YELLOW}Depois faça login: gh auth login${NC}"
    exit 1
fi

# Verificar se está autenticado no GitHub CLI
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Você não está autenticado no GitHub CLI${NC}"
    echo -e "${YELLOW}Execute: gh auth login${NC}"
    exit 1
fi

# Confirmar antes de prosseguir
echo -e "Configurações que serão enviadas:"
echo -e "  ${YELLOW}FTP_SERVER:${NC} $FTP_SERVER"
echo -e "  ${YELLOW}FTP_USERNAME:${NC} $FTP_USERNAME"
echo -e "  ${YELLOW}FTP_PASSWORD:${NC} ********"
echo -e "  ${YELLOW}FTP_DIRECTORY:${NC} $FTP_DIRECTORY"
echo ""
read -p "Deseja continuar? (s/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo -e "${YELLOW}❌ Operação cancelada${NC}"
    exit 1
fi

echo -e "\n${GREEN}Enviando secrets e variables para GitHub...${NC}\n"

# Criar variables usando GitHub CLI (não são criptografadas)
gh variable set FTP_SERVER -b"$FTP_SERVER" && echo -e "${GREEN}✓${NC} FTP_SERVER configurado (variable)"
gh variable set FTP_USERNAME -b"$FTP_USERNAME" && echo -e "${GREEN}✓${NC} FTP_USERNAME configurado (variable)"
gh variable set FTP_DIRECTORY -b"$FTP_DIRECTORY" && echo -e "${GREEN}✓${NC} FTP_DIRECTORY configurado (variable)"

# Criar secret usando GitHub CLI (criptografado)
gh secret set FTP_PASSWORD -b"$FTP_PASSWORD" && echo -e "${GREEN}✓${NC} FTP_PASSWORD configurado (secret)"

echo -e "\n${GREEN}✅ Todos os secrets e variables foram configurados com sucesso!${NC}"
echo -e "${GREEN}Você pode usá-los em seus GitHub Actions workflows.${NC}"
