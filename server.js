const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();

let counter = 0;

router.get('/api/counter', async (ctx, next) => {
  await next();
  ctx.body = { counter };
});

router.put('/api/counter', async (ctx, next) => {
  await next();
  counter += 1;
  ctx.body = { counter };
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8081, 'localhost');
