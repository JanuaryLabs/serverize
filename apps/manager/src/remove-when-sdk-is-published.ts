export interface Release {
  id: string;
  createdAt: string;
  containerName: string;
  tarLocation: string;
  project: { name: string; id: string; createdAt: string };
  status: string;
  image: string;
  volumes: { src: string; dest: string }[];
  domainPrefix: string;
  name: string;
  projectId: string;
  channel: 'dev' | 'preview';
  conclusion: string;
  runtimeConfig: string;
}
