const Hapi = require('hapi');

const config = require('./config');
const CounterDAO = require('./db/CounterDAO');

const options = {
  app: { config },
  host: config.host,
  port: config.port,
};
if (config.ENV === 'development') {
  const tls = config.https;
  Object.assign(options, { tls });
}
const server = Hapi.server(options);

server.route({
  method: 'GET',
  path: '/counter',
  handler: async () => {
    const counter = await CounterDAO.get();
    return { counter };
  },
});

server.route({
  method: 'PUT',
  path: '/counter',
  handler: async () => {
    const counter = await CounterDAO.increment();
    return { counter };
  },
});

server.route({
  method: 'DELETE',
  path: '/counter',
  handler: async () => {
    const counter = await CounterDAO.reset();
    return { counter };
  },
});

module.exports = server;
