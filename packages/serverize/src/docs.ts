import fs from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import cli from './cli'; // <-- Import your main CLI (the one with .addCommand(...))

function generateUsageInstructionFromCommand(prefix: string, command: Command) {
  const requiredOptions: string[] = [];
  const optionalOptions: string[] = [];

  for (const option of command.options) {
    const optionText = `${option.short || option.long} ${option.mandatory ? `<${option.attributeName()}>` : `[${option.attributeName()}]`}`;
    if (option.mandatory) {
      requiredOptions.push(optionText);
    } else {
      optionalOptions.push(optionText);
    }
  }
  const args = command.registeredArguments.map((arg) =>
    arg.required ? `<${arg.name()}>` : `[${arg.name()}]`,
  );

  const usages: string[] = [];

  const withArgs = args.length > 0 ? ` ${args.join(' ')}` : '';
  const withRequiredOptions = requiredOptions.length
    ? ` ${requiredOptions.join(' ')}`
    : '';
  const alwaysSuffix = `${withArgs}${withRequiredOptions}`;
  const alwaysVisible = `${prefix} ${command.name()}${alwaysSuffix}`;
  for (let index = 0; index < optionalOptions.length; index++) {
    const option = optionalOptions[index];
    usages.push(`${alwaysVisible} ${option}`);
    for (let j = index + 1; j < optionalOptions.length; j++) {
      usages.push(`${alwaysVisible} ${option} ${optionalOptions[j]}`);
    }
  }

  return usages;
}
function getArgumentBracketType(argumentStr: string): 'required' | 'optional' {
  if (argumentStr.startsWith('<') && argumentStr.endsWith('>')) {
    return 'required';
  }
  if (argumentStr.startsWith('[') && argumentStr.endsWith(']')) {
    return 'optional';
  }
  return 'required'; // Default fallback if not strictly bracketed
}

function generateDocsForCommand(
  prefix: string,
  cmd: Command,
  depth = 0,
): string {
  const cmdName = cmd.name()?.trim();
  if (!cmdName) {
    throw new Error(
      'A Commander command is missing a name. Please specify one.',
    );
  }
  const lines: string[] = [];

  const headingLevel = depth + 1; // e.g., depth=0 -> "##", depth=1 -> "###"
  const heading = '#'.repeat(headingLevel);
  const nextHeading = '#'.repeat(headingLevel + 1);

  const aliasList = cmd.aliases?.() || [];
  const description = cmd.description();
  const summary = cmd.summary();
  const usage = cmd.usage?.();

  // Start building the Markdown content

  // docs += `**Description:** ${description}\n\n`;
  if (depth !== 0) {
    lines.push(`${heading} \`${cmdName}\``);
  }

  // Usage
  // if (usage) {
  //   lines.push(`${nextHeading} Usage`);
  // lines.push(`\`${prefix} ${cmdName} ${usage}\``);
  // }
  lines.push(
    `

| **Description** | ${summary} |
|------------------|----------------------------------|
| **Usage**        | \`${prefix} ${cmdName} ${usage}\` |

    `,
  );
  if (description) {
    lines.push(`${description}`);
  }

  if (depth === 0) {
    lines.push(
      `> [!TIP]`,
      `> Arguments or options enclosed in \`<>\` are required, while those enclosed in \`[]\` are optional.`,
      ' ',
    );
  }

  // docs += `**Usage:**\n\n`;
  // const usages = generateUsageInstructionFromCommand('npx serverize', cmd);
  // for (const usage of usages) {
  //   docs += `\`\`\`sh\n${usage}\n\`\`\`\n\n`;
  // }
  //

  // IMPORTANT: arugments are confused with subcommands hence we need not use them
  // if (cmd.registeredArguments?.length) {
  //   lines.push(`${nextHeading} Arguments\n\n`);
  //   const rows: string[] = [
  //     `| **Argument** | **Description** | **Default** |`,
  //     `|------------|-----------------|-------------|`,
  //   ];
  //   cmd.registeredArguments.forEach((arg) => {
  //     const rawArgName = arg.name(); // e.g., "<file>"
  //     const bracketType = getArgumentBracketType(rawArgName);
  //     const argDesc = arg.description || 'No description';
  //     const variadic = arg.variadic ? ' (variadic)' : '';

  //     // Clean angle/square brackets from the name for clarity
  //     const cleanArgName = rawArgName.replace(/^[\[<]|[\]>]$/g, '');

  //     // docs += `- \`${cleanArgName}${variadic}\` **(${bracketType})**: ${argDesc}\n`;
  //     // lines.push(
  //     //   `- \`${cleanArgName}${variadic}\` **(${bracketType})**: ${argDesc}`,
  //     // );
  //     rows.push(`| \`${cleanArgName}${variadic}\` | ${argDesc} | |`);
  //   });
  //   lines.push(rows.join('\n'));
  //   // docs += '\n';
  // }

  if (cmd.options?.length) {
    // lines.push(`${nextHeading} Options\n\n`);
    const rows: string[] = [
      `| **Option** | **Description** | **Default** |`,
      `|------------|-----------------|-------------|`,
    ];
    cmd.options.forEach((opt) => {
      const {
        flags,
        description: optDescription,
        defaultValue,
        mandatory,
        required,
      } = opt;

      const descStr = optDescription || 'No description';
      const cwd = process.cwd();
      // If the default value is the current working directory, show $(pwd) instead
      // const defValStr =
      //   defaultValue !== undefined
      //     ? ` (default: \`${defaultValue === cwd ? '$(pwd)' : defaultValue}\`)`
      //     : '';
      const defValStr =
        defaultValue !== undefined
          ? `\`${defaultValue === cwd ? '$(pwd)' : defaultValue}\``
          : '';

      const isRequired = mandatory || required ? ' (required)' : '';
      rows.push(`| \`${flags}\` | ${descStr} | ${defValStr} |`);
      // return {
      //   flag: flags,
      //   mandatory: isRequired,
      //   description: descStr,
      // }
      // lines.push(`- \`${flags}\`${isRequired}: ${descStr}${defValStr}`);
      // docs += `- \`${flags}\`${isRequired}: ${descStr}${defValStr}\n`;
    });
    lines.push(rows.join('\n'));

    // docs += '\n';
  }

  if (cmd.commands?.length) {
    // lines.push(`${nextHeading} Subcommands\n\n`);
    cmd.commands.forEach((sub) => {
      lines.push(
        generateDocsForCommand(`${prefix} ${cmdName}`, sub, depth + 2),
      );
    });
  }

  return lines.join('\n');
}

function main(): void {
  const rootCommands = cli.commands || [];

  rootCommands.forEach((command) => {
    const cmdName = command.name()?.trim();
    if (!cmdName) {
      throw new Error(
        'A Commander command is missing a name. Please specify one.',
      );
    }

    const lines = [
      '---',
      `navName: "\`${cmdName}\`"`,
      `layout: ../../../layouts/DocsLayout.astro`,
      `title: npx serverize ${cmdName}`,
      '---',
      generateDocsForCommand('npx serverize', command, 0),
    ];

    const filePath = join(
      process.cwd(),
      'apps/www/src/pages/docs/cli',
      `${cmdName}.md`,
    );
    fs.writeFileSync(filePath, lines.join('\n').trim(), 'utf-8');
  });
}

main();
