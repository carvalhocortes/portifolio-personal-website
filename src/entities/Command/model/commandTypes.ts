export interface Command {
  id: number;
  text: string;
  output: string;
}

export type CommandFn = () => string;

export interface CommandDefinition {
  classification: string;
  acceptedCommands: string[];
  description: string;
  fn: CommandFn;
}

export type CommandsMap = Record<string, CommandFn>;

export interface CommandCategory {
  name: string;
  commands: CommandDefinition[];
}
