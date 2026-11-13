// Lists the dependencies with a new major version and writes a Markdown body
// for the weekly issue (see .github/workflows/outdated-majors.yml). Dependabot
// ignores major versions, so this is how they get noticed.
// Usage: npm outdated --json | node scripts/outdated-majors.mjs > body.md
// Exits with 0 and prints nothing when there is no new major version.
import { readFileSync } from 'node:fs';

const input = readFileSync(0, 'utf8').trim();
const outdated = input ? JSON.parse(input) : {};
const major = (version) => Number(String(version).split('.')[0]);

const rows = Object.entries(outdated)
  .filter(
    ([, info]) => info.current && major(info.latest) > major(info.current)
  )
  .sort(([a], [b]) => a.localeCompare(b))
  .map(
    ([name, info]) =>
      `| [\`${name}\`](https://www.npmjs.com/package/${name}) | ${info.current} | ${info.latest} |`
  );

if (rows.length) {
  console.log(
    [
      'Versões principais novas, que o Dependabot não atualiza sozinho (elas costumam pedir mudanças no código). Teste uma de cada vez antes de atualizar.',
      '',
      '| Pacote | Versão atual | Versão nova |',
      '| --- | --- | --- |',
      ...rows,
      '',
      `_Atualizado automaticamente em ${new Date().toISOString().slice(0, 10)}._`,
    ].join('\n')
  );
}
