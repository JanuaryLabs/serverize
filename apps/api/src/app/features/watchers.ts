import stats from './stats/stats.watchers';
const controller = new AbortController();

// Start the stats watcher
stats(controller);

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => {
    controller.abort();
    process.exit();
  });
});
