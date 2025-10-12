export const formatObjectArray = (objects: TextObject): string => {
  return Object.entries(objects).map(([key, values]) => {
    const title = key + '\n';
    const content = values.map(value => '  ' + value).join('\n') + '\n';
    return title + content;
  }).join('\n') + '\n';
};

export type TextObject = Record<string, string[]>;
