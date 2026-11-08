import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ageOn, content, pick, resource } from './content';

const PUBLIC_DIR = resolve(__dirname, '../../../../public');

// Walks the content tree and collects every localized text and every file
// name, with the path where it was found, so a failure names the field.
const collect = (
  node: unknown,
  path: string,
  texts: { path: string; value: Record<string, unknown> }[],
  files: { path: string; file: string }[]
) => {
  if (Array.isArray(node)) {
    node.forEach((child, i) => collect(child, `${path}[${i}]`, texts, files));
    return;
  }
  if (!node || typeof node !== 'object') return;
  const record = node as Record<string, unknown>;
  if ('pt' in record || 'en' in record) {
    texts.push({ path, value: record });
    return;
  }
  for (const [key, value] of Object.entries(record)) {
    if (
      (key === 'arquivo' || key === 'arquivo2x') &&
      typeof value === 'string'
    ) {
      files.push({ path: `${path}.${key}`, file: value });
    } else {
      collect(value, `${path}.${key}`, texts, files);
    }
  }
};

const texts: { path: string; value: Record<string, unknown> }[] = [];
const files: { path: string; file: string }[] = [];
collect(content, 'site', texts, files);

describe('content/site.yaml', () => {
  it('has every text in Portuguese and English', () => {
    const missing = texts
      .filter(({ value }) =>
        ['pt', 'en'].some(
          (lang) =>
            typeof value[lang] !== 'string' || !String(value[lang]).trim()
        )
      )
      .map(({ path }) => path);
    expect(texts.length).toBeGreaterThan(40);
    expect(missing).toEqual([]);
  });

  it('points only to files that exist in public/resources', () => {
    const missing = files
      .filter(({ file }) => !existsSync(resolve(PUBLIC_DIR, 'resources', file)))
      .map(({ path, file }) => `${path}: ${file}`);
    expect(files.length).toBeGreaterThan(10);
    expect(missing).toEqual([]);
  });

  it('has the four sections with their items', () => {
    expect(content.sobre.paragrafos.length).toBeGreaterThan(0);
    expect(content.hobbies.itens.map((h) => h.id)).toEqual([
      'marcenaria',
      'fotografia',
      'diy',
    ]);
    expect(content.voluntario.itens).toHaveLength(3);
    expect(content.contato.email).toMatch(/@/);
  });
});

describe('content helpers', () => {
  it('computes the age around the birthday', () => {
    expect(ageOn('1984-02-07', new Date(2026, 1, 6))).toBe(41);
    expect(ageOn('1984-02-07', new Date(2026, 1, 7))).toBe(42);
  });

  it('picks the language and fills {idade}', () => {
    const text = { pt: 'tenho {idade} anos', en: "I'm {idade}" };
    const age = ageOn(content.pessoa.nascimento);
    expect(pick(text, 'pt-BR')).toBe(`tenho ${age} anos`);
    expect(pick(text, 'en-US')).toBe(`I'm ${age}`);
    expect(pick(text, 'es')).toBe(`tenho ${age} anos`);
  });

  it('builds absolute resource URLs', () => {
    expect(resource('banco.png')).toBe('/resources/banco.png');
  });
});
