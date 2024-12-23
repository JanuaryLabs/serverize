import { type Stage, dockerfile } from '../docker_file';
import { nodeServer } from '../servers';

const base: Stage = {
  from: 'python:3.9-slim',
  packages: ['build-essential', 'curl', 'software-properties-common', 'git'],
  run: ['rm -rf /var/lib/apt/lists/*'],
};

export const streamlit = () =>
  dockerfile({
    stages: { base: base },
    start: {
      from: base,
      workdir: '/app',
      copy: [
        // 'requirements.txt',
        '.',
      ],
      run: 'pip3 install -r requirements.txt',
      port: 8501,
      healthCheck: {
        test: 'curl --fail http://localhost:8501/_stcore/health',
      },
      cmd: ['app.py', '--server.port=8501', '--server.address=0.0.0.0'],
      entrypoint: ['streamlit', 'run'],
    },
  });
streamlit.dockerignore = [
  ...nodeServer.dockerignore,
  '__pycache__/',
  '*.pyc',
  'venv/',
];
