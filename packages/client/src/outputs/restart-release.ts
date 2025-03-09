import z from 'zod';
export type RestartReleaseOutput = {
  traceId: string;
  releaseId: string;
  finalUrl: string;
};
