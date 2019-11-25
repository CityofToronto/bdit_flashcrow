import db from '@/lib/db/db';

/**
 * Data access layer for users.
 */
class UserDAO {
  static async bySubject(subject) {
    const sql = 'SELECT * FROM "users" WHERE "subject" = $(subject)';
    return db.oneOrNone(sql, { subject });
  }

  /**
   * Map user subjects to users.
   *
   * @param {Array<string>} subjects - array of user subjects
   * @returns {Promise<Map<string, Object>>} map from user subjects to users
   */
  static async bySubjects(subjects) {
    const uniqueSubjects = Array.from(new Set(subjects));
    const sql = 'SELECT * FROM "users" WHERE "subject" IN ($(uniqueSubjects:csv))';
    const rows = await db.manyOrNone(sql, { uniqueSubjects });
    const users = new Map();
    rows.forEach((user) => {
      const { subject } = user;
      users.set(subject, user);
    });
    return users;
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
