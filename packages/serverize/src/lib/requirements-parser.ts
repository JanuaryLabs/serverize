import { notNullOrUndefined } from 'serverize/utils';

interface Requirement {
  type: 'requirement' | 'package' | 'url';
  file?: string | null;
  package?: string | null;
  version?: string | null;
  specifier?: string | null;
  envMarker?: string | null;
  extras?: string[] | null;
  url?: string | null;
}

/**
 * Parses a requirements.txt file content into structured requirements data
 * @param {string} content - Content of requirements.txt file
 * @returns {Array<Object>} Array of parsed requirements
 */
const parse = (content: string): (Requirement | null)[] => {
  // Split by newlines and filter out empty lines
  const lines = content.split(/\r?\n/);

  return lines
    .map((line) => {
      // Remove comments
      const commentIndex = line.indexOf('#');
      if (commentIndex !== -1) {
        line = line.slice(0, commentIndex);
      }

      line = line.trim();
      if (!line) return null;

      // Handle recursive requirements files
      if (line.startsWith('-r') || line.startsWith('--requirement')) {
        const [, ...fileParts] = line.split(/\s+/);
        return {
          type: 'requirement',
          file: fileParts.join(' ').trim(),
        } satisfies Requirement;
      }

      // Handle environment markers
      let envMarker = null;
      if (line.includes(';')) {
        [line, envMarker] = line.split(';').map((part) => part.trim());
      }

      // Handle direct URLs
      if (line.startsWith('git+') || line.includes('://')) {
        return {
          type: 'url',
          url: line,
          envMarker,
        } satisfies Requirement;
      }

      // Handle package specifications
      // Matches package names with extras like: package[extra1,extra2]
      const packageMatch = line.match(
        /^([a-zA-Z0-9\-._]+(?:\[[a-zA-Z0-9\-._,\s]+\])?)/,
      );
      if (!packageMatch) return null;

      const packageName = packageMatch[1];
      const versionMatch = line
        .slice(packageName.length)
        .match(/\s*(==|>=|<=|!=|~=|>|<)\s*([a-zA-Z0-9\-._*]+)/);

      const packageNameWithExtras = packageName.replace(/\[.*\]/, '');

      return {
        type: 'package',
        package: packageNameWithExtras,
        version: versionMatch ? versionMatch[2] : null,
        specifier: versionMatch ? versionMatch[1] : null,
        envMarker,
        extras: parseExtras(packageName),
      } satisfies Requirement;
    })
    .filter(Boolean);
};

/**
 * Parses package extras from package name (e.g., package[extra1,extra2])
 * @param {string} packageName - Package name potentially containing extras
 * @returns {Array<string>|null} Array of extras or null if no extras
 */
const parseExtras = (packageName: string) => {
  const extrasMatch = packageName.match(/\[(.*)\]$/);
  if (!extrasMatch) return [];
  return extrasMatch[1].split(',').map((extra) => extra.trim());
};

export async function parseRequirements(content: string) {
  try {
    return parse(content).filter(notNullOrUndefined);
  } catch (error) {
    console.error('Error parsing requirements:');
    console.error(error);
    return [];
  }
}
