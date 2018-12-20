// const csrf = require('csurf');
const express = require('express');
const Router = require('express-promise-router');
const session = require('express-session');
const helmet = require('helmet');

const config = require('./config');

const app = express();
app.set('x-powered-by', false);

app.use(helmet());
app.use(session(config.session));
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

module.exports = app;
