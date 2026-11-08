import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  content,
  resource,
  type TrashFile,
  type TrashFolder,
} from '../../../entities/Content';
import type { ProgramProps } from '../../../entities/Program/model/types';
import { FolderIcon, TextFileIcon } from '../../../shared/ui/icons';
import styles from './RecycleBin.module.css';

type View =
  | { level: 'root' }
  | { level: 'folder'; folder: TrashFolder }
  | { level: 'file'; folder: TrashFolder; index: number };

/**
 * Recycle Bin: old projects that almost made it to the site, one folder per
 * project. Folders open their files; photos open enlarged, texts like the
 * Notepad. Back and Esc go up a level.
 */
export const RecycleBin = (_props: ProgramProps) => {
  const { t } = useTranslation();
  const [view, setView] = useState<View>({ level: 'root' });
  const bodyRef = useRef<HTMLDivElement>(null);

  // Texts of a folder live at lixeira.pastas.<id> in the i18n files.
  const folderName = (folder: TrashFolder) =>
    t(`lixeira.pastas.${folder.id}.nome`);
  const fileKey = (folder: TrashFolder, file: TrashFile) =>
    `lixeira.pastas.${folder.id}.arquivos.${file.id}`;
  const fileName = (folder: TrashFolder, file: TrashFile) =>
    t(`${fileKey(folder, file)}.nome`);

  // After moving to another level, the keyboard focus goes to its first item.
  useEffect(() => {
    bodyRef.current
      ?.querySelector<HTMLElement>('[data-autofocus], button')
      ?.focus({ preventScroll: true });
  }, [view]);

  const up = () =>
    setView((current) =>
      current.level === 'file'
        ? { level: 'folder', folder: current.folder }
        : { level: 'root' }
    );

  const step = (delta: number) =>
    setView((current) => {
      if (current.level !== 'file') return current;
      const count = current.folder.arquivos.length;
      return { ...current, index: (current.index + delta + count) % count };
    });

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && view.level !== 'root') {
      e.stopPropagation();
      up();
    }
    if (view.level === 'file' && e.key === 'ArrowRight') step(1);
    if (view.level === 'file' && e.key === 'ArrowLeft') step(-1);
  };

  const trashName = t('recycleBin.name');
  const address = [
    trashName,
    view.level !== 'root' ? folderName(view.folder) : null,
    view.level === 'file'
      ? fileName(view.folder, view.folder.arquivos[view.index])
      : null,
  ]
    .filter(Boolean)
    .join('\\');

  const count =
    view.level === 'root'
      ? content.lixeira.pastas.length
      : view.folder.arquivos.length;

  return (
    <div className={styles.bin} onKeyDown={onKeyDown}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.button}
          onClick={up}
          disabled={view.level === 'root'}
        >
          {t('recycleBin.back')}
        </button>
        <input
          className={styles.address}
          value={address}
          readOnly
          aria-label={t('recycleBin.address')}
          tabIndex={-1}
        />
      </div>

      <div ref={bodyRef} className={styles.body}>
        {view.level === 'root' && (
          <ul className={styles.grid} aria-label={trashName}>
            {content.lixeira.pastas.map((folder) => (
              <li key={folder.id}>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => setView({ level: 'folder', folder })}
                >
                  <FolderIcon size={32} />
                  <span className={styles.label}>{folderName(folder)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {view.level === 'folder' && (
          <ul className={styles.grid} aria-label={folderName(view.folder)}>
            {view.folder.arquivos.map((file, index) => (
              <li key={file.id}>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() =>
                    setView({ level: 'file', folder: view.folder, index })
                  }
                >
                  {file.tipo === 'foto' ? (
                    <img
                      className={styles.thumb}
                      src={resource(file.arquivo)}
                      alt=""
                      width={64}
                      height={48}
                      loading="lazy"
                    />
                  ) : (
                    <TextFileIcon size={32} />
                  )}
                  <span className={styles.label}>
                    {fileName(view.folder, file)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {view.level === 'file' && (
          <FileView
            name={fileName(view.folder, view.folder.arquivos[view.index])}
            file={view.folder.arquivos[view.index]}
            text={t(
              `${fileKey(view.folder, view.folder.arquivos[view.index])}.texto`
            )}
            multiple={view.folder.arquivos.length > 1}
            onStep={step}
          />
        )}
      </div>

      <div className={styles.status}>{t('recycleBin.objects', { count })}</div>
    </div>
  );
};

const FileView = ({
  name,
  file,
  text,
  multiple,
  onStep,
}: {
  name: string;
  file: TrashFile;
  text: string;
  multiple: boolean;
  onStep: (delta: number) => void;
}) => {
  const { t } = useTranslation();
  return (
    <figure className={styles.file}>
      {file.tipo === 'foto' ? (
        <img className={styles.photo} src={resource(file.arquivo)} alt={name} />
      ) : (
        <textarea
          className={styles.text}
          value={text}
          readOnly
          aria-label={name}
          data-autofocus
        />
      )}
      <figcaption className={styles.caption}>
        {multiple && (
          <button
            type="button"
            className={styles.button}
            aria-label={t('recycleBin.previous')}
            onClick={() => onStep(-1)}
          >
            ◀
          </button>
        )}
        <span className={styles.fileName}>{name}</span>
        {multiple && (
          <button
            type="button"
            className={styles.button}
            aria-label={t('recycleBin.next')}
            onClick={() => onStep(1)}
          >
            ▶
          </button>
        )}
      </figcaption>
    </figure>
  );
};
