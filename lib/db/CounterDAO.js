const db = require('./db');

class CounterDAO {
  static async get() {
    const { n } = await db.one('SELECT * FROM "TEST"."COUNTER"');
    return n;
  }

  static async increment() {
    const { n } = await db.one('UPDATE "TEST"."COUNTER" SET n = n + 1 RETURNING n');
    return n;
  }

  static async reset() {
    const { n } = await db.one('UPDATE "TEST"."COUNTER" SET n = 0 RETURNING n');
    return n;
  }
}

module.exports = CounterDAO;
