import { describe, expect, it } from 'vitest';
import { CATCHPHRASES, mussumify, mussumWord } from './mussum';

const NAME = { names: ['Fernando Côrtes'] };

describe('mussumWord', () => {
  it.each([
    ['programa', 'programis'],
    ['contato', 'contatis'],
    ['Clique', 'Cliquis'],
    ['comandos', 'comandis'],
    ['janelas', 'janelis'],
    ['opções', 'opçãozis'],
    ['botão', 'botãozis'],
    ['Terminal', 'Terminalzis'],
    ['Iniciar', 'Iniciarzis'],
    ['café', 'cafézis'],
    ['Cacildis', 'Cacildis'],
  ])('%s → %s', (word, expected) => {
    expect(mussumWord(word)).toBe(expected);
  });
});

describe('mussumify', () => {
  it('converts one qualifying word, skips the next', () => {
    expect(mussumify('Clique num comando ou digite o nome dele')).toBe(
      'Cliquis num comando ou digitis o nome delis'
    );
  });

  it('keeps short and common words', () => {
    expect(mussumify('para como minha onde')).toBe('para como minha onde');
  });

  it('keeps acronyms, names of companies and technologies', () => {
    expect(mussumify('ICQ BIOS React GitHub LinkedIn')).toBe(
      'ICQ BIOS React GitHub LinkedIn'
    );
  });

  it('keeps the given names, whole or word by word', () => {
    expect(mussumify('Olá, Fernando Côrtes', NAME)).toBe(
      'Olá, Fernando Côrtes'
    );
    expect(mussumify('Memória do Fernando', NAME)).toBe('Memóriis do Fernando');
  });

  it.each([
    ['code', 'Digite `ajuda` agora mesmo'],
    ['quotes', 'Clique ou digite "ajuda"'],
    ['link target', 'Veja [o site](https://exemplo.com/programa)'],
    ['e-mail', 'Escreva para nome@exemplo.com'],
    ['variable', 'Tenho {{idade}} anos'],
    ['file', 'Abra Leia-me.txt'],
    ['domain', 'carvalhocortes.com.br/landing'],
  ])('protects %s', (_, text) => {
    const result = mussumify(text);
    for (const piece of [
      '`ajuda`',
      '"ajuda"',
      '(https://exemplo.com/programa)',
      'nome@exemplo.com',
      '{{idade}}',
      'Leia-me.txt',
      'carvalhocortes.com.br/landing',
    ]) {
      if (text.includes(piece)) expect(result).toContain(piece);
    }
  });

  it('converts the text of a Markdown link, not its target', () => {
    expect(mussumify('[Projeto](https://exemplo.com)')).toBe(
      '[Projetis](https://exemplo.com)'
    );
  });

  it('keeps lines in English', () => {
    const line = 'The button next to the clock switches the language.';
    expect(mussumify(line)).toBe(line);
  });

  it('keeps columns aligned, converting only what comes after the gap', () => {
    const text = [
      '  Navegador   Quem eu sou, meus hobbies',
      '              e um formulário',
    ].join('\n');
    const [first, second] = mussumify(text).split('\n');
    expect(first.startsWith('  Navegador   ')).toBe(true);
    expect(second.startsWith('              e ')).toBe(true);
  });

  it('adds a catchphrase only to long sentences, always the same', () => {
    const long = [
      'Em 2022, decidi redirecionar minha carreira para a área de software.',
      'Mensagem enviada. Obrigado! Respondo assim que puder, prometo.',
      'Os programas ficam na barra de tarefas, lá embaixo, como sempre.',
      'Pode digitar aqui à vontade: nada é salvo, nem o que é bonito.',
    ];
    const results = long.map((text) => mussumify(text));
    expect(results.some((r) => CATCHPHRASES.some((c) => r.endsWith(c)))).toBe(
      true
    );
    expect(long.map((text) => mussumify(text))).toEqual(results);
    expect(mussumify('Fechar.')).toBe('Fecharzis.');
    expect(mussumify('Minimizar')).toBe('Minimizarzis');
  });

  it('converts a real paragraph (a catchphrase may follow)', () => {
    expect(
      mussumify(
        'meu nome é **Fernando Côrtes**, tenho {{idade}} anos e sou natural do interior de Minas Gerais.',
        NAME
      )
    ).toMatch(
      /^meu nomis é \*\*Fernando Côrtes\*\*, tenho \{\{idade\}\} anis e sou natural do interiorzis de Minas Gerais\./
    );
  });
});
