const db = require('./db');

class CounterDAO {
  static async get() {
    const { n } = await db.one('SELECT n FROM "TEST"."COUNTER"');
    return parseInt(n, 10);
  }

  static async increment() {
    const { n } = await db.one('UPDATE "TEST"."COUNTER" SET n = n + 1 RETURNING n');
    return parseInt(n, 10);
  }

  static async reset() {
    const { n } = await db.one('UPDATE "TEST"."COUNTER" SET n = 0 RETURNING n');
    return parseInt(n, 10);
  }
}

module.exports = CounterDAO;
