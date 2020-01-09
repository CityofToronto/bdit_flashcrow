import db from '@/lib/db/db';
import DateTime from '@/lib/time/DateTime';

/**
 * Data access layer for users.
 */
class UserDAO {
  static async byId(id) {
    const sql = 'SELECT * FROM "users" WHERE "id" = $(id)';
    return db.oneOrNone(sql, { id });
  }

  /**
   * Map user IDs to users.
   *
   * @param {Array<number>} ids - array of IDs
   * @returns {Promise<Map<number, Object>>} map from IDs to users
   */
  static async byIds(ids) {
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) {
      return new Map();
    }
    const sql = 'SELECT * FROM "users" WHERE "id" IN ($(uniqueIds:csv))';
    const rows = await db.manyOrNone(sql, { uniqueIds });
    return new Map(rows.map(user => [user.id, user]));
  }

  static async bySub(sub) {
    const sql = 'SELECT * FROM "users" WHERE "sub" = $(sub)';
    return db.oneOrNone(sql, { sub });
  }

  static async byEmail(email) {
    const sql = 'SELECT * FROM "users" WHERE "email" = $(email)';
    return db.oneOrNone(sql, { email });
  }

  static async create(user) {
    const sql = `
INSERT INTO "users" ("createdAt", "email", "sub", "uniqueName")
VALUES ($(createdAt), $(email), $(sub), $(uniqueName))
RETURNING "id"`;
    const createdAt = DateTime.local();
    const { id } = await db.one(sql, {
      createdAt,
      ...user,
    });
    return {
      id,
      createdAt,
      ...user,
    };
  }

  static async update(user) {
    const sql = `
UPDATE "users"
  SET "email" = $(email), "uniqueName" = $(uniqueName)
  WHERE "id" = $(id)`;
    const rowsUpdated = await db.result(sql, user, r => r.rowCount);
    return rowsUpdated === 1;
  }

  static async delete({ id }) {
    const sql = 'DELETE FROM "users" WHERE "id" = $(id)';
    const rowsDeleted = await db.result(sql, { id }, r => r.rowCount);
    return rowsDeleted === 1;
  }
}

export default UserDAO;
