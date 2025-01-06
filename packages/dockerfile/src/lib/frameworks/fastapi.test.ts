import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fastapi } from './fastapi';

test('FastAPI Dockerfile generation', async (t) => {
  await t.test('default configuration', () => {
    const result = fastapi({
      mainFile: 'main.py',
      dir: 'app',
      port: 8091,
    });

    const content = result.print();

    // Base image
    assert.match(content, /FROM python:3.9-slim/);
    assert.match(content, /WORKDIR \/code/);

    // Copy operations
    assert.match(content, /COPY \.\/requirements\.txt/);
    assert.match(content, /COPY \.\/app app/);

    // Dependencies installation
    assert.match(
      content,
      /RUN pip install --no-cache-dir --upgrade -r \/code\/requirements\.txt/,
    );

    // Environment variables
    assert.match(content, /ENV PYTHONUNBUFFERED=1/);

    // Port exposure
    assert.match(content, /EXPOSE 8091/);

    // Command
    assert.match(
      content,
      /CMD \["fastapi", "run", "app\/main\.py", "--port", "8091", "--proxy-headers"\]/,
    );
  });

  await t.test('custom port configuration', () => {
    const result = fastapi({
      mainFile: 'app.py',
      dir: 'src',
      port: 9000,
    });

    const content = result.print();
    assert.match(content, /EXPOSE 9000/);
    assert.match(content, /--port", "9000"/);
  });

  await t.test('default port when not specified', () => {
    const result = fastapi({
      mainFile: 'main.py',
      dir: 'src',
    });

    const content = result.print();
    assert.match(content, /EXPOSE 80/);
    assert.match(content, /--port", "80"/);
  });
});
