// const csrf = require('csurf');
const express = require('express');
const Router = require('express-promise-router');
const session = require('express-session');
const helmet = require('helmet');

const config = require('./config');
const CounterDAO = require('./db/CounterDAO');

const app = express();
app.set('x-powered-by', false);

app.use(helmet());
app.use(session(config.session));
/*
app.use(csrf({
  cookie: false,
}));
*/

const router = new Router();

router.get('/counter', async (req, res) => {
  const counter = await CounterDAO.get();
  res.send({ counter });
});

router.put('/counter', async (req, res) => {
  const counter = await CounterDAO.increment();
  res.send({ counter });
});

router.delete('/counter', async (req, res) => {
  const counter = await CounterDAO.reset();
  res.send({ counter });
});

app.use(router);

module.exports = app;
