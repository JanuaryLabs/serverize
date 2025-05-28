import { camelcase, dotcase, spinalcase } from 'stringcase';

import { join } from 'node:path';
import type { Extension } from '@januarylabs/extensions';
import { refineExecute } from '@januarylabs/generator';
export const makeFeatureFile = (featureName: string, fileName: string) =>
  join('./src/app/features', spinalcase(featureName), fileName);

export const makeControllerPath = (featureName: string, suffix = 'router') =>
  makeFeatureFile(
    featureName,
    `${spinalcase(featureName)}.${dotcase(`${suffix} ts`)}`,
  );
export const fileWatch: () => Extension = () => {
  return {
    packages: {},
    files: {},
    primitives: {
      trigger: {
        watchFile(config: any) {
          return {
            type: 'observe',
            inputs: {
              stream: {
                static: true,
                type: 'Readable',
                value: `chunk`,
                data: {
                  parameterName: 'stream',
                  standalone: true,
                },
                structure: ['import { Readable } from "node:stream";'],
              },
              controller: {
                static: true,
                type: 'AbortController',
                value: `controller`,
                data: {
                  parameterName: 'controller',
                  standalone: true,
                },
                structure: [],
              },
            },
            config: config,
            policies: config.policies ?? [],
            refineExecute: (execute: any) => {
              return refineExecute(execute, {
                replaceKey: (key) => key,
                setOutput: (arg) =>
                  `${typeof arg === 'undefined' ? '' : `return ${arg}`}`,
              });
            },
          };
        },
      },
    },
    onFeature(contract, api) {
      const workflows = contract.workflows.filter(
        (workflow) => workflow.trigger.sourceId === 'observe',
      );
      if (!workflows.length) {
        return {};
      }
      const imports = [
        `import { observeFile } from '#extensions/user/index.ts';`,
      ];
      const lines: string[] = [
        `export default function (gracefulController: AbortController) {`,
      ];
      for (const workflow of contract.workflows) {
        const operationName = `${camelcase(
          workflow.tag,
        )}.${camelcase(workflow.trigger.operationName)}`;
        imports.push(
          `import * as ${camelcase(workflow.tag)} from './${spinalcase(workflow.tag)}'`,
        );
        lines.push(
          `{const controller = new AbortController();
              const signal = AbortSignal.any([
                controller.signal,
                gracefulController.signal,
              ]);
              const stream = observeFile({
                filePath: '${workflow.trigger.details.filePath}',
                autoRestart: ${workflow.trigger.details.autoRestart || false},
                signal: signal,
              });
              ${operationName}(stream, {
                signal,
                abort: () => controller.abort(),
              });}
            `,
        );
      }
      lines.push(`}`);

      return {
        [makeControllerPath(contract.displayName, 'watchers')]: [
          ...imports,
          ...lines,
        ],
      };
    },
  };
};
