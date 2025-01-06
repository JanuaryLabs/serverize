import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import cli from './cli'; // <-- Import your main CLI (the one with .addCommand(...))

/**
 * Recursively generates a Markdown string for a given Commander.js command.
 * Throws an error if the command has no name.
 */
function generateDocsForCommand(cmd: Command, depth = 0): string {
  const cmdName = cmd.name()?.trim();
  if (!cmdName) {
    throw new Error(
      'A Commander command is missing a name. Please specify one.',
    );
  }

  const indent = '  '.repeat(depth);
  const headingLevel = depth + 2; // e.g., depth=0 -> "##", depth=1 -> "###"

  // Aliases
  const aliasList = cmd.aliases?.() || [];
  const aliases = aliasList.length ? ` (aliases: ${aliasList.join(', ')})` : '';

  // Description
  const description = cmd.description() || 'No description provided.';

  let docs = `${'#'.repeat(headingLevel)} \`${cmdName}\`${aliases}\n\n`;
  docs += `${indent}**Description:** ${description}\n\n`;

  // Usage
  const usage = cmd.usage?.();
  if (usage && usage !== cmdName) {
    docs += `${indent}**Usage:** \`${usage}\`\n\n`;
  }

  // Arguments
  // Using cmd.registeredArguments per your snippet; adapt if needed for your Commander version
  if (cmd.registeredArguments?.length) {
    docs += `${indent}**Arguments:**\n\n`;
    cmd.registeredArguments.forEach((arg) => {
      const argName = arg.name();
      const argDesc = arg.description || 'No description';
      const variadic = arg.variadic ? ' (variadic)' : '';
      docs += `${indent}- \`${argName}${variadic}\`: ${argDesc}\n`;
    });
    docs += '\n';
  }

  // Options
  if (cmd.options?.length) {
    docs += `${indent}**Options:**\n\n`;
    cmd.options.forEach((opt) => {
      const {
        flags,
        description: optDescription,
        defaultValue,
        mandatory,
        required,
      } = opt;

      const descStr = optDescription || 'No description';
      const defValStr =
        defaultValue !== undefined ? ` (default: \`${defaultValue}\`)` : '';
      const isRequired = mandatory || required ? ' (required)' : '';

      docs += `${indent}- \`${flags}\`${isRequired}: ${descStr}${defValStr}\n`;
    });
    docs += '\n';
  }

  // Subcommands
  if (cmd.commands?.length) {
    docs += `${indent}**Subcommands:**\n\n`;
    cmd.commands.forEach((sub) => {
      docs += generateDocsForCommand(sub, depth + 1);
    });
  }

  return docs;
}

/**
 * Loops through all root-level commands in your CLI and creates one Markdown file per command.
 */
function main(): void {
  const rootCommands = cli.commands || [];

  if (!rootCommands.length) {
    console.log('No root-level commands found on this CLI.');
    return;
  }

  // For each top-level command, generate docs and write to <cmdName>.md
  rootCommands.forEach((command) => {
    const cmdName = command.name()?.trim();
    if (!cmdName) {
      throw new Error(
        'A Commander command is missing a name. Please specify one.',
      );
    }

    const mdContent = generateDocsForCommand(command, 0);

    // Write to <commandName>.md
    const fileName = `${cmdName}.md`;
    const filePath = path.join(process.cwd(), fileName);

    fs.writeFileSync(filePath, mdContent, 'utf-8');
    console.log(`Documentation for "${cmdName}" written to: ${filePath}`);
  });
}

// Execute
main();
