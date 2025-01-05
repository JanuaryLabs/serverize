import { dockerfile } from '../docker_file';
import { nodeServer } from '../servers';
import { join } from 'path';

interface FastAPIConfig {
  port?: number;
  mainFile: string;
  dir: string;
}

export const fastapi = (config: FastAPIConfig) => {
  const port = config.port || 80;

  return dockerfile({
    stages: {},
    start: {
      from: 'python:3.9-slim',
      workdir: '/code',
      copy: [
        './requirements.txt',
        {
          src: config.dir,
          dest: 'app',
        },
      ],
      run: ['pip install --no-cache-dir --upgrade -r /code/requirements.txt'],
      port,
      cmd: [
        'fastapi',
        'run',
        join('app', config.mainFile),
        '--port',
        `${port}`,
        '--proxy-headers',
      ],
      environment: {
        PYTHONUNBUFFERED: '1',
      },
    },
  });
};

fastapi.dockerignore = [
  ...nodeServer.dockerignore,
  // Python specific
  '__pycache__/',
  '*.pyc',
  '*.pyo',
  '*.pyd',
  'venv/',
  '.env',
  '.venv',
  'env/',
  'ENV/',
  'env.bak/',
  'venv.bak/',
  // Test files
  '.pytest_cache',
  '.coverage',
  'htmlcov/',
  '.mypy_cache/',
  'tests/',
  'test/',
  // Documentation
  'docs/',
  '*.md',
  // Development files
  '*.log',
  '*.sql',
  '*.sqlite',
  // Version control
  '.git',
  '.gitignore',
  '.gitattributes',
  // IDE specific
  '.idea/',
  '.vscode/',
  '*.swp',
  '*.swo',
  // Build artifacts
  'dist/',
  'build/',
  '*.egg-info/',
];
