import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import i18n from '../../../shared/i18n';
import { executeCommand, getEffect, help, isExitCommand } from './index';
import { fortune, SECRET_COMMANDS } from './secrets';

describe('hidden Terminal commands', () => {
  beforeEach(async () => {
    await act(() => i18n.changeLanguage('pt-BR'));
  });

  it('answer in Portuguese and English, with the aliases of both', () => {
    expect(executeCommand('cafe')).toContain('Pausa para o café');
    expect(executeCommand('café')).toContain('Pausa para o café');
    expect(executeCommand('coffee')).toContain('Pausa para o café');
    expect(executeCommand('sudo')).toBe(
      'Permissão negada. Este incidente será reportado ao Fernando.'
    );
    expect(executeCommand('sair')).toBe(
      'Não dá para sair: você já está em casa.'
    );
    expect(executeCommand('matrix')).toContain('pílula vermelha');
    expect(executeCommand('hackear')).toContain('Acesso concedido');
  });

  it('switch with the language', async () => {
    await act(() => i18n.changeLanguage('en-US'));
    expect(executeCommand('coffee')).toContain('Coffee break');
    expect(executeCommand('sudo help')).toContain('Administrator commands');
  });

  it('stay out of the help, and sudo ajuda lists them all', () => {
    const helpText = help();
    for (const word of ['cafe', 'matrix', 'sorte', 'hackear', 'sair']) {
      expect(helpText).not.toContain(`#cmd:${word}`);
    }
    const sudoHelp = executeCommand('sudo ajuda');
    expect(sudoHelp).toContain('Comandos do administrador');
    expect(sudoHelp.match(/^- /gm)).toHaveLength(SECRET_COMMANDS.length);
    expect(sudoHelp).toContain('#cmd:hackear');
  });

  it('pick a fortune from the list', () => {
    const lines = i18n.t('secrets.fortune', {
      returnObjects: true,
    }) as string[];
    expect(fortune(() => 0)).toBe(`> ${lines[0]}`);
    expect(fortune(() => 0.999)).toBe(`> ${lines[lines.length - 1]}`);
    expect(executeCommand('sorte')).toMatch(/^> /);
  });

  it('know which ones play an effect or close the window', () => {
    expect(getEffect('matrix')).toBe('matrix');
    expect(getEffect('HACK')).toBe('hack');
    expect(getEffect('cafe')).toBeNull();
    expect(isExitCommand('sair')).toBe(true);
    expect(isExitCommand('exit ')).toBe(true);
    expect(isExitCommand('sudo')).toBe(false);
  });
});
