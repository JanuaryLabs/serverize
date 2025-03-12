import boxen from 'boxen';

export const colors = {
  green: (message: string) => `\x1b[32m${message}\x1b[0m`,
  blue: (message: string) => `\x1b[34m${message}\x1b[0m`,
  magenta: (message: string) => `\x1b[35m${message}\x1b[0m`,
};

export function box(title: string, ...lines: string[]) {
  return boxen(lines.join('\n'), {
    padding: 0.75,
    margin: 0.85,
    borderStyle: 'round',
    title: title,
    titleAlignment: 'center',
    dimBorder: true,
  });
}

box.print = function (title: string, ...lines: string[]) {
  console.log(box(title, ...lines.map((it) => it.trimEnd())));
};
