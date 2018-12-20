// const csrf = require('csurf');
const express = require('express');
const Router = require('express-promise-router');
const session = require('express-session');
const helmet = require('helmet');

let serverConfig = require('./server-config');

const app = express();
const ENV = app.get('env');
const PORT = 8081;
serverConfig = serverConfig[ENV];

app.use(helmet());
app.use(session(serverConfig.session));
/*
app.use(csrf({
  cookie: false,
}));
*/

let counter = 0;

const router = new Router();

router.get('/counter', async (req, res) => {
  res.send({ counter });
});

router.put('/counter', async (req, res) => {
  counter += 1;
  res.send({ counter });
});

app.use(router);

app.listen(PORT, () => {
  console.log(`[${ENV}] app listening on port ${PORT}!`);
});
