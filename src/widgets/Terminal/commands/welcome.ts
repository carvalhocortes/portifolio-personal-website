import type { ScreenSize } from '../../../shared/lib/useScreenSize';

export const welcome = (screenSize: ScreenSize = 'xlarge'): string => {
  switch (screenSize) {
    case 'small':
      return welcomePtBrSm;
    case 'medium':
      return welcomePtBrMd;
    case 'large':
    case 'xlarge':
    default:
      return welcomePtBr;
  }
};

const welcomePtBr = `
  ## Bem vindo a minha pagina! \n
  \n\`\`\`
   █████╗  █████╗ ██████╗ ██╗   ██╗ █████╗ ██╗     ██╗  ██╗ █████╗
  ██╔══██╗██╔══██╗██╔══██╗██║   ██║██╔══██╗██║     ██║  ██║██╔══██╗
  ██║  ╚═╝███████║██████╔╝╚██╗ ██╔╝███████║██║     ███████║██║  ██║
  ██║  ██╗██╔══██║██╔══██╗ ╚████╔╝ ██╔══██║██║     ██╔══██║██║  ██║
  ╚█████╔╝██║  ██║██║  ██║  ╚██╔╝  ██║  ██║███████╗██║  ██║╚█████╔╝ █▀▀ █▀█ █▀█ ▀█▀ █▀▀ █▀
   ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚════╝  █▄▄ █▄█ █▀▄  █  ██▄ ▄█
  \n\`\`\`

  "Digite 'ajuda' para ver os comandos."`;

const welcomePtBrMd = `
  ## Bem vindo a minha pagina! \n
  \n\`\`\`
   █████╗  █████╗ ██████╗ ██╗   ██╗ █████╗ ██╗     ██╗  ██╗ █████╗
  ██╔══██╗██╔══██╗██╔══██╗██║   ██║██╔══██╗██║     ██║  ██║██╔══██╗
  ██║  ╚═╝███████║██████╔╝╚██╗ ██╔╝███████║██║     ███████║██║  ██║
  ██║  ██╗██╔══██║██╔══██╗ ╚████╔╝ ██╔══██║██║     ██╔══██║██║  ██║
  ╚█████╔╝██║  ██║██║  ██║  ╚██╔╝  ██║  ██║███████╗██║  ██║╚█████╔╝
   ╚════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚════╝
   █▀▀ █▀█ █▀█ ▀█▀ █▀▀ █▀
   █▄▄ █▄█ █▀▄  █  ██▄ ▄█
  \n\`\`\`

  "Digite 'ajuda' para ver os comandos."`;

const welcomePtBrSm = `
  Bem vindo a minha pagina! \n

  "Digite 'ajuda' para ver os comandos."`;
