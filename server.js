const server = require('./lib/app');
const { ENV, host, port } = require('./lib/config');
const db = require('./lib/db/db');

async function initServer() {
  try {
    await server.start();
    console.log(`[${ENV}] server listening on ${host}:${port}...`);
  } catch (err) {
    console.error('Error starting server: ', err);
  }
}

initServer();

const shutdownEvents = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'];
function onShutdown() {
  db.$pool.end();
  server.stop();
}
shutdownEvents.forEach((event) => {
  process.on(event, onShutdown);
});
