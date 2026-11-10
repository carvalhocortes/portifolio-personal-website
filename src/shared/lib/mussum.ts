/**
 * The Mussum mode converter: Portuguese the way Mussum spoke it ("programis",
 * "Terminalzis", "Cacildis!"). A pure function, always the same result for the
 * same text, so nothing flickers between renders.
 */

// Short, common words stay as they are, so the text stays readable.
const KEEP = new Set([
  'para',
  'como',
  'minha',
  'minhas',
  'onde',
  'desde',
  'então',
  'mesmo',
  'mesma',
  'assim',
  'quem',
  'este',
  'esta',
  'esse',
  'essa',
  'isso',
  'isto',
  'aqui',
  'ainda',
  'pelo',
  'pela',
  'pelos',
  'pelas',
  'mais',
  'seus',
  'suas',
  'meus',
  'também',
  'algum',
  'alguns',
  'alguma',
  'depois',
  'antes',
  'sobre',
  'entre',
  'foram',
  'está',
  'estão',
  'agora',
  'tudo',
  'nada',
  'muito',
  'muitos',
  'quando',
  'porque',
  'cada',
  'outra',
  'outro',
  'nunca',
  'sempre',
  'você',
  'vocês',
  'qual',
  'quais',
]);

// Names of companies and technologies, English words used in Portuguese
// texts, and words that just look odd with "-is". Compared in lower case.
const NAMES = new Set([
  'react',
  'typescript',
  'github',
  'linkedin',
  'node',
  'azure',
  'dynatrace',
  'datadog',
  'clean',
  'code',
  'solid',
  'mackenzie',
  'einstein',
  'albert',
  'ewally',
  'english',
  'minas',
  'gerais',
  'paulo',
  'fintech',
  'software',
  'windows',
  'plus',
  'easter',
  'eggs',
  'hobbies',
  'deploy',
  'online',
  'offline',
  'mainframe',
  'firewall',
  'setup',
  'enter',
  'mussum',
  'cacildis',
]);

// Two or more of these in a line: the line is in English and stays.
const ENGLISH = new Set([
  'the',
  'and',
  'to',
  'of',
  'is',
  'next',
  'you',
  'your',
  'this',
  'it',
  'in',
  'on',
  'switches',
  'button',
  'clock',
  'language',
]);

export const CATCHPHRASES = ['Cacildis!', 'Forévis.', 'Mé!', 'Pelis sacis!'];

/** Texts shorter than this (labels, buttons, titles) get no catchphrase. */
const CATCHPHRASE_MIN_LENGTH = 40;

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Pieces that never change: code, quotes, link targets, URLs, e-mails,
// {{variables}}, HTML tags and words with a dot inside (files, domains,
// "Node.js", "1.44MB").
const PROTECTED = [
  '```[\\s\\S]*?```',
  '`[^`\\n]*`',
  '"[^"\\n]*"',
  '“[^”\\n]*”',
  '\\]\\([^)]*\\)',
  'https?:\\/\\/\\S+',
  '\\S+@\\S+',
  '\\{\\{[^}]*\\}\\}',
  '<[^>]+>',
  '[\\p{L}\\p{N}_/-]+(?:\\.[\\p{L}\\p{N}_/-]+)+',
];

const WORD = /\p{L}+(?:-\p{L}+)*/gu;

/** The Mussum ending of one word. */
export const mussumWord = (word: string): string => {
  if (/(ões|ãos)$/.test(word)) return `${word.slice(0, -3)}ãozis`;
  if (/ão$/.test(word)) return `${word}zis`;
  if (/is$/.test(word)) return word;
  if (/[aeo]s$/.test(word)) return `${word.slice(0, -2)}is`;
  if (/[aeo]$/.test(word)) return `${word.slice(0, -1)}is`;
  return `${word}zis`;
};

const qualifies = (word: string) =>
  word.length >= 4 &&
  !word.includes('-') &&
  word !== word.toUpperCase() &&
  !KEEP.has(word.toLowerCase()) &&
  !NAMES.has(word.toLowerCase());

const isEnglish = (line: string) =>
  (line.toLowerCase().match(/[a-z]+/g) ?? []).filter((w) => ENGLISH.has(w))
    .length >= 2;

// A small, stable hash: the same text always picks the same catchphrase.
const hash = (text: string) => {
  let h = 5381;
  for (const char of text) h = (h * 33 + char.charCodeAt(0)) >>> 0;
  return h;
};

export interface MussumOptions {
  /** Names that stay as they are, like the site owner's (word by word). */
  names?: string[];
}

export const mussumify = (
  text: string,
  options: MussumOptions = {}
): string => {
  const names = (options.names ?? [])
    .flatMap((name) => [name, ...name.split(/\s+/)])
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map(escape);
  const protectedPieces = new RegExp(
    `(${[...PROTECTED, ...names.map((n) => `(?<!\\p{L})${n}(?!\\p{L})`)].join('|')})`,
    'u'
  );

  // "One yes, one no" among the words that qualify, across the whole text.
  let count = 0;
  const convertWords = (piece: string) =>
    piece.replace(WORD, (word) => {
      if (!qualifies(word)) return word;
      count += 1;
      return count % 2 === 1 ? mussumWord(word) : word;
    });

  const convertLine = (line: string) => {
    if (isEnglish(line)) return line;
    // Columns (the Leia-me): only the text after the gap changes, so the
    // columns stay aligned.
    const column = /^(\s*\S.*?\S {3,})(.*)$/.exec(line);
    const [head, tail] = column ? [column[1], column[2]] : ['', line];
    const parts = tail.split(protectedPieces);
    return (
      head +
      parts
        .map((part, i) =>
          // split() with a capture group: odd items are the protected pieces.
          i % 2 === 1 || part === undefined ? (part ?? '') : convertWords(part)
        )
        .join('')
    );
  };

  let result = text.split('\n').map(convertLine).join('\n');

  const trimmed = result.trimEnd();
  const lastLine = trimmed.slice(trimmed.lastIndexOf('\n') + 1);
  if (
    trimmed.length >= CATCHPHRASE_MIN_LENGTH &&
    /[.!]$/.test(trimmed) &&
    !isEnglish(lastLine)
  ) {
    const h = hash(text);
    if (h % 2 === 0) {
      result = `${trimmed} ${CATCHPHRASES[(h >>> 1) % CATCHPHRASES.length]}${result.slice(trimmed.length)}`;
    }
  }
  return result;
};
