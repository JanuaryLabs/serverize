import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';

import { basename, dirname, relative } from 'path';

const filterFiles = (dir: string, fileName: string) => {
  const dirName = basename(dir);
  if (dirName.endsWith('e2e')) {
    return false;
  }
  return fileName.endsWith('.eslintrc.json');
};

export function addAngularConfig(
  file: string,
  eslintConfig: Record<string, any>,
) {
  console.log(
    basename(dirname(file)),
    relative(dirname(file), process.cwd()) + '/.eslintrc.json',
  );
  eslintConfig.extends = [
    relative(dirname(file), process.cwd()) + '/.eslintrc.json',
  ];
  eslintConfig.overrides ??= [];
  const tsOverrideIndex = eslintConfig.overrides.findIndex((item) =>
    item.files.includes('*.ts'),
  );
  const tsOverride = eslintConfig.overrides[tsOverrideIndex];
  tsOverride.extends = [];

  if (tsOverride.extends.length === 0) {
    delete tsOverride.extends;
  }
  eslintConfig.overrides[tsOverrideIndex] = tsOverride;
  return eslintConfig;
}

export function addParserOptions(
  file: string,
  eslintConfig: Record<string, any>,
) {
  const dirPath = file.replace('/.eslintrc.json', '');
  eslintConfig.parserOptions = {
    project: [`${dirPath}/tsconfig.*?.json`],
  };
  return eslintConfig;
}

function getFiles(
  dir: string,
  filter: (dir: string, name: string) => boolean,
  parentFiles: string[] = [],
) {
  console.log('dir', dir);
  const files = readdirSync(dir);
  for (const index in files) {
    const name = dir + '/' + files[index];
    if (statSync(name).isDirectory()) {
      getFiles(name, filter, parentFiles);
    } else {
      if (filter(dir, name)) {
        parentFiles.push(name);
      }
    }
  }
  return parentFiles;
}

const entries = [
  ...getFiles('apps', filterFiles),
  ...getFiles('packages', filterFiles),
];

entries.forEach((file) => {
  try {
    const eslintConfig = JSON.parse(readFileSync(file, 'utf-8'));
    addAngularConfig(file, eslintConfig);
    addParserOptions(file, eslintConfig);
    // console .log(eslintConfig)
    writeFileSync(file, JSON.stringify(eslintConfig, null, 2));
  } catch (error) {
    console.log('File:', file, 'cannot be auto configured');
    throw error;
  }
});
