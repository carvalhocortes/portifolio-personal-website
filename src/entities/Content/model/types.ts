// Site data that doesn't change with the language (content/site.yaml). The
// texts live in the i18n files at the same path: the title of the hobby with
// id "marcenaria" is `hobbies.itens.marcenaria.titulo`.

export interface Photo {
  /** File name inside public/resources/. */
  arquivo: string;
}

export interface Hobby {
  id: string;
  fotos: Photo[];
  curiosidade?: { link: { url: string } };
}

export interface VolunteerWork {
  id: string;
  url: string;
  logo: { arquivo: string };
}

/** A file in a Recycle Bin folder: a photo, or a text kept in the i18n files. */
export type TrashFile =
  | { id: string; tipo: 'foto'; arquivo: string }
  | { id: string; tipo: 'texto' };

export interface TrashFolder {
  id: string;
  arquivos: TrashFile[];
}

export interface SiteContent {
  pessoa: {
    nome: string;
    /** ISO date, YYYY-MM-DD. */
    nascimento: string;
    assinatura: { arquivo: string };
    avatar: { arquivo: string; arquivo2x: string };
  };
  contato: { email: string; linkedin: string };
  hobbies: { itens: Hobby[] };
  voluntario: { itens: VolunteerWork[] };
  abertura: { imagem: { arquivo: string } };
  /** Loose files at the top of the Recycle Bin, then one folder per project. */
  lixeira: { arquivos: TrashFile[]; pastas: TrashFolder[] };
  /** ICQ: the joke contacts, all offline. */
  icq: { contatos: { id: string }[] };
}
