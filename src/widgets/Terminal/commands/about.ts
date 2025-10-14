import { formatObjectArray, type TextObject } from "./render-text";

export const about = (): string => {
  return formatObjectArray(aboutPtBr);
};

const myAge = (() => {
  const today = new Date();
  const birthDate = new Date(1984, 1, 7); // Month is 0-indexed (1 = February)
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  // Verifica se o aniversário ainda não aconteceu este ano para corrigir a idade
  // Se o mês de nascimento ainda não chegou OU se estamos no mês do aniversário mas o dia ainda não chegou
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
})();

const aboutPtBr: TextObject = {
  'Olá': [
    `meu nome é Fernando Cortes, tenho ${myAge} anos e sou natural do interior de Minas Gerais. Em 2003, mudei-me para São Paulo para cursar Engenharia Elétrica na Universidade Presbiteriana Mackenzie, onde me formei em 2008.`,
    'Sou pós-graduado em Arquitetura de Sistemas de Software pela FIAP e possuo especializações em Engenharia Clínica (IESAE) e Gerenciamento de Projetos pela FGV-SP, certificado como Scrum Master pela Scrum.org.',
    'Por quase uma década atuei no setor de telecomunicações, adquirindo ampla experiência em gestão de equipes descentralizadas, coordenação de projetos e relacionamento com clientes internos e externos.',
    'Em 2022, decidi redirecionar minha carreira para a área de desenvolvimento de software, onde encontrei minha verdadeira paixão. Desde então, atuei como desenvolvedor em empresas como Ewally (fintech), Hospital Israelita Albert Einstein e, atualmente, Banco XP.',
    'Tenho experiência prática com Node.js, .NET, React.js, AWS, Azure, Dynatrace, DataDog, Git, além de bancos de dados SQL e NoSQL e soluções de cache. Sou entusiasta de boas práticas de engenharia de software, aplicando princípios como SOLID, DRY, KISS, CQRS e Clean Code em todos os meus projetos.',
    'Meu objetivo é continuar evoluindo como engenheiro de software, unindo sólida base técnica, mentalidade colaborativa e visão sistêmica para contribuir com times e produtos de alta performance.'
  ]
}
