/** Markdown links written as `[label](#cmd:name)` run `name` when clicked. */
export const COMMAND_LINK_PREFIX = '#cmd:';

export const commandLink = (label: string, command: string = label): string =>
  `[${label}](${COMMAND_LINK_PREFIX}${encodeURIComponent(command)})`;

export const parseCommandLink = (href: string | undefined): string | null =>
  href?.startsWith(COMMAND_LINK_PREFIX)
    ? decodeURIComponent(href.slice(COMMAND_LINK_PREFIX.length))
    : null;
