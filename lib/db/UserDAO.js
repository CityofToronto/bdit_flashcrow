import db from '@/lib/db/db';
import Joi from '@/lib/model/Joi';
import User from '@/lib/model/User';
import DateTime from '@/lib/time/DateTime';

async function normalizeUser(user) {
  if (user === null) {
    return null;
  }
  return User.read.validateAsync(user);
}

async function normalizeUsers(users) {
  const usersSchema = Joi.array().items(User.read);
  return usersSchema.validateAsync(users);
}

/**
 * Data access layer for users.
 */
class UserDAO {
  static async byId(id) {
    const sql = 'SELECT * FROM "users" WHERE "id" = $(id)';
    const user = await db.oneOrNone(sql, { id });
    return normalizeUser(user);
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
    const users = await db.manyOrNone(sql, { uniqueIds });
    const usersNormalized = await normalizeUsers(users);
    return new Map(usersNormalized.map(user => [user.id, user]));
  }

  static async bySub(sub) {
    const sql = 'SELECT * FROM "users" WHERE "sub" = $(sub)';
    const user = await db.oneOrNone(sql, { sub });
    return normalizeUser(user);
  }

  static async byEmail(email) {
    const sql = 'SELECT * FROM "users" WHERE "email" = $(email)';
    const user = await db.oneOrNone(sql, { email });
    return normalizeUser(user);
  }

  static async create(user) {
    const sql = `
INSERT INTO "users" (
  "createdAt",
  "email",
  "scope",
  "sub",
  "uniqueName"
) VALUES (
  $(createdAt),
  $(email),
  $(scope),
  $(sub),
  $(uniqueName)
) RETURNING "id"`;
    const persistedUser = {
      createdAt: DateTime.local(),
      ...user,
    };
    const { id } = await db.one(sql, persistedUser);
    persistedUser.id = id;
    return normalizeUser(persistedUser);
  }

  static async update(user) {
    const sql = `
UPDATE "users"
  SET
    "email" = $(email),
    "scope" = $(scope),
    "uniqueName" = $(uniqueName)
  WHERE "id" = $(id)`;
    await db.query(sql, user);
    return normalizeUser(user);
  }

  static async delete({ id }) {
    const sql = 'DELETE FROM "users" WHERE "id" = $(id)';
    const rowsDeleted = await db.result(sql, { id }, r => r.rowCount);
    return rowsDeleted === 1;
  }
}

export default UserDAO;
