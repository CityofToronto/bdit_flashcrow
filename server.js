const app = require('./lib/app');
const { port, ENV } = require('./lib/config');
const db = require('./lib/db/db');

const server = app.listen(port, () => {
  console.log(`[${ENV}] app listening on port ${port}!`);
});

const shutdownEvents = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'];
function onShutdown() {
  db.$pool.end();
  server.close();
}
shutdownEvents.forEach((event) => {
  process.on(event, onShutdown);
});
