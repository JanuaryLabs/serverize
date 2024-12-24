# Optimization

Serverize optimizes your workflow by exporting Docker images and uploading them to the cloud. However, in watch mode, this process repeats with every change, meaning larger images take longer to upload and may even time out.

To make the most of watch mode, it's crucial to minimize what gets sent. For example, instead of installing `node_modules` inside the Dockerfile, bundle the code beforehand and copy only the bundled files. The same goes for **Dotnet** projects—avoid running `dotnet restore` in the Dockerfile and instead copy over just the contents of the "Debug" folder.

Most frameworks already support building in watch mode. For example, **Vite**-based applications can use:

```
vite build --watch
```

This keeps your workflow fast and your updates efficient.
