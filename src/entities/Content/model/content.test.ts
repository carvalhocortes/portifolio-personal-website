import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import enUS from '../../../shared/i18n/locales/en-US.yaml';
import ptBR from '../../../shared/i18n/locales/pt-BR.yaml';
import i18n from '../../../shared/i18n';
import { ageOn } from '../../../shared/lib/age';
import { content, resource, textList } from './content';

const PUBLIC_DIR = resolve(__dirname, '../../../../public');

// Every leaf of a text tree as "path → value", so a failure names the key.
const leaves = (node: unknown, path = ''): Map<string, unknown> => {
  const found = new Map<string, unknown>();
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      const child = path ? `${path}.${key}` : key;
      leaves(value, child).forEach((v, k) => found.set(k, v));
    }
  } else {
    found.set(path, node);
  }
  return found;
};

// Every file name in the data, with where it was found.
const files = (
  node: unknown,
  path = 'site'
): { path: string; file: string }[] => {
  if (!node || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([key, value]) =>
    (key === 'arquivo' || key === 'arquivo2x') && typeof value === 'string'
      ? [{ path: `${path}.${key}`, file: value }]
      : files(value, `${path}.${key}`)
  );
};

const pt = leaves(ptBR);
const en = leaves(enUS);

describe('i18n files (pt-BR.yaml and en-US.yaml)', () => {
  it('have the same keys in both languages', () => {
    // Terminal command aliases are words of each language: the lists may
    // differ in length, as long as both languages have them.
    const keys = (tree: Map<string, unknown>) =>
      new Set(
        [...tree.keys()].map((key) =>
          key.replace(/\.aliases\.\d+$/, '.aliases')
        )
      );
    const ptKeys = keys(pt);
    const enKeys = keys(en);
    expect([...ptKeys].filter((key) => !enKeys.has(key))).toEqual([]);
    expect([...enKeys].filter((key) => !ptKeys.has(key))).toEqual([]);
    expect(pt.size).toBeGreaterThan(150);
  });

  it('have no empty text', () => {
    const empty = [...pt, ...en]
      .filter(([, value]) => typeof value !== 'string' || !value.trim())
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });

  it('have the texts of every hobby, photo, volunteer work and Recycle Bin file', () => {
    const missing: string[] = [];
    const need = (key: string) => {
      for (const [lang, tree] of [
        ['pt', pt],
        ['en', en],
      ] as const) {
        if (![...tree.keys()].some((k) => k === key || k.startsWith(`${key}.`)))
          missing.push(`${lang}: ${key}`);
      }
    };
    for (const hobby of content.hobbies.itens) {
      const key = `hobbies.itens.${hobby.id}`;
      need(`${key}.titulo`);
      need(`${key}.paragrafos`);
      hobby.fotos.forEach((_, i) => need(`${key}.fotos.${i}.legenda`));
      if (hobby.curiosidade) need(`${key}.curiosidade.texto`);
    }
    for (const item of content.voluntario.itens) {
      const key = `voluntario.itens.${item.id}`;
      need(`${key}.nome`);
      need(`${key}.logo.alt`);
      need(`${key}.descricao`);
    }
    for (const contact of content.icq.contatos) {
      need(`icq.contatos.${contact.id}.nome`);
    }
    for (const folder of content.lixeira.pastas) {
      const key = `lixeira.pastas.${folder.id}`;
      need(`${key}.nome`);
      for (const file of folder.arquivos) {
        need(`${key}.arquivos.${file.id}.nome`);
        if (file.tipo === 'texto') need(`${key}.arquivos.${file.id}.texto`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('have no photo caption without a photo in the data', () => {
    const extra = content.hobbies.itens.flatMap((hobby) =>
      [...pt.keys()].filter(
        (key) =>
          key.startsWith(`hobbies.itens.${hobby.id}.fotos.`) &&
          Number(key.split('.')[4]) >= hobby.fotos.length
      )
    );
    expect(extra).toEqual([]);
  });
});

describe('content/site.yaml', () => {
  it('points only to files that exist in public/resources', () => {
    const all = files(content);
    const missing = all
      .filter(({ file }) => !existsSync(resolve(PUBLIC_DIR, 'resources', file)))
      .map(({ path, file }) => `${path}: ${file}`);
    expect(all.length).toBeGreaterThan(10);
    expect(missing).toEqual([]);
  });

  it('has the hobbies and volunteer works in order', () => {
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

  it('fills {{idade}} in any text and reads lists', () => {
    const age = ageOn(content.pessoa.nascimento);
    const [first] = textList(i18n.getFixedT('pt-BR'), 'sobre.paragrafos');
    expect(first).toContain(`tenho ${age} anos`);
    expect(textList(i18n.getFixedT('en-US'), 'sobre.paragrafos')[0]).toContain(
      `I'm ${age} years old`
    );
  });

  it('builds absolute resource URLs', () => {
    expect(resource('banco.png')).toBe('/resources/banco.png');
  });
});
