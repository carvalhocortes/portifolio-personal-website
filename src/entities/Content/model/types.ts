/** A text in both site languages. Markdown is allowed. */
export interface Localized {
  pt: string;
  en: string;
}

export interface Photo {
  /** File name inside public/resources/. */
  arquivo: string;
  legenda: Localized;
}

export interface Hobby {
  id: string;
  titulo: Localized;
  paragrafos: Localized[];
  fotos: Photo[];
  curiosidade?: {
    rotulo: Localized;
    texto: Localized;
    link: { texto: Localized; url: string };
  };
}

export interface VolunteerWork {
  id: string;
  nome: Localized;
  url: string;
  logo: { arquivo: string; alt: Localized };
  descricao: Localized;
}

export interface SiteContent {
  pessoa: {
    nome: string;
    /** ISO date, YYYY-MM-DD. */
    nascimento: string;
    titulo: Localized;
    resumo: Localized;
    assinatura: { arquivo: string };
    avatar: { arquivo: string; arquivo2x: string; alt: Localized };
  };
  contato: {
    menu: Localized;
    titulo: Localized;
    email: string;
    linkedin: string;
  };
  sobre: { titulo: Localized; saudacao: Localized; paragrafos: Localized[] };
  hobbies: { titulo: Localized; itens: Hobby[] };
  voluntario: { titulo: Localized; itens: VolunteerWork[] };
}
