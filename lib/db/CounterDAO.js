const db = require('./db');

class CounterDAO {
  static async get() {
    const { n } = await db.one('SELECT * FROM traffic.counter');
    return n;
  }

  static async increment() {
    const { n } = await db.one('UPDATE traffic.counter SET n = n + 1 RETURNING n');
    return n;
  }

  static async reset() {
    const { n } = await db.one('UPDATE traffic.counter SET n = 0 RETURNING n');
    return n;
  }
}

module.exports = CounterDAO;
