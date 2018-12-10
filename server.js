const express = require('express');
const session = require('express-session');
const helmet = require('helmet');

let serverConfig = require('./server-config');

const app = express();
const ENV = app.get('env');
const PORT = 8081;
serverConfig = serverConfig[ENV];

app.use(helmet());
app.use(session(serverConfig.session));


let counter = 0;

app.get('/counter', (req, res) => {
  res.send({ counter });
});

app.put('/counter', (req, res) => {
  counter += 1;
  res.send({ counter });
});

app.listen(PORT, () => {
  console.log(`[${ENV}] app listening on port ${PORT}!`);
});
