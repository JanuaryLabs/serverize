import { docker } from 'serverize/docker';
import z from 'zod';
import { orgNameValidator } from '#extensions/zod/index.ts';
export const streamContainerLogsSchema = z.object({
  projectName: orgNameValidator,
  channelName: orgNameValidator,
  releaseName: orgNameValidator,
  timestamp: z.boolean().default(true).optional(),
  details: z.boolean().default(true).optional(),
  tail: z.number().max(250).default(250).optional(),
});

export async function streamContainerLogs(
  input: z.infer<typeof streamContainerLogsSchema>,
  signal: AbortSignal,
) {
  const containers = await docker.listContainers({
    all: true,
    filters: {
      label: [
        `serverize.projectName=${input.projectName}`,
        `serverize.channelName=${input.channelName}`,
        `serverize.releaseName=${input.releaseName}`,
      ],
    },
  });
  console.log(
    `Found ${containers.length} containers for ${input.projectName}/${input.channelName}/${input.releaseName}`,
  );
  const [containerInfo] = containers;
  const container = docker.getContainer(containerInfo.Id);
  // const stdout = new PassThrough();
  // const stderr = new PassThrough();

  const logsStream = await container.logs({
    follow: true,
    stdout: true,
    stderr: true,
    timestamps: input.timestamp,
    details: input.details,
    tail: input.tail,
    abortSignal: signal,
  });
  // docker.modem.demuxStream(logsStream, stdout, stderr);
  // return concatStreams(stdout, stderr);
  return logsStream;
}
