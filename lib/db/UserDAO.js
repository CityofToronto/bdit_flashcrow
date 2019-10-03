import db from '@/../lib/db/db';

class UserDAO {
  static async bySubject(subject) {
    const sql = 'SELECT * FROM "users" WHERE "subject" = $(subject)';
    return db.oneOrNone(sql, { subject });
  }

  static async byEmail(email) {
    const sql = 'SELECT * FROM "users" WHERE "email" = $(email)';
    return db.oneOrNone(sql, { email });
  }

  static async create(user) {
    const sql = `
INSERT INTO "users" ("subject", "email", "name", "token")
  VALUES ($(subject), $(email), $(name), $(token))`;
    await db.query(sql, user);
    return user;
  }

  static async update(user) {
    const sql = `
UPDATE "users"
  SET "email" = $(email), "name" = $(name), "token" = $(token)
  WHERE "subject" = $(subject)`;
    const rowsUpdated = await db.result(sql, user, r => r.rowCount);
    return rowsUpdated === 1;
  }

  static async delete({ subject }) {
    const sql = 'DELETE FROM "users" WHERE "subject" = $(subject)';
    const rowsDeleted = await db.result(sql, { subject }, r => r.rowCount);
    return rowsDeleted === 1;
  }
}

export default UserDAO;
