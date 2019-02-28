const db = require('./db');

class UserDAO {
  static async bySubject(subject) {
    return db.oneOrNone(
      'SELECT * FROM "TEST"."USERS" WHERE "subject" = $(subject)',
      { subject },
    );
  }

  static async create(user) {
    const { subject } = await db.one(
      'INSERT INTO "TEST"."USERS" ("subject", "email", "token") VALUES ($(subject), $(email), $(token)) RETURNING subject',
      user,
    );
    return subject;
  }

  static async update(user) {
    const rowsUpdated = await db.result(
      'UPDATE "TEST"."USERS" SET "email" = $(email), "token" = $(token) WHERE "subject" = $(subject)',
      user,
      r => r.rowCount,
    );
    return rowsUpdated === 1;
  }

  static async delete({ subject }) {
    const rowsDeleted = await db.result(
      'DELETE FROM "TEST"."USERS" WHERE "subject" = $(subject)',
      { subject },
      r => r.rowCount,
    );
    return rowsDeleted === 1;
  }
}

module.exports = UserDAO;
