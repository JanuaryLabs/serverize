### When to use health check?

The default health check uses `wget` command with `--spider` option to check the health of the service. The `--spider` option uses `HEAD` method by default so you have to make sure your web server supports `HEAD` method. If your web server does not support `HEAD` method, you need to define `HEALTHCHECK` instruction in your Dockerfile.

```dockerfile title="Dockerfile"
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD wget -qO- http://localhost:3000/health || exit 1
```
