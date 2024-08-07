import db from '@/lib/db/db';
import SessionDAO from '@/lib/db/SessionDAO';
import Joi from '@/lib/model/Joi';
import User from '@/lib/model/User';
import DateTime from '@/lib/time/DateTime';
import { AuthScope } from '@/lib/Constants';

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
    const normalizedUser = await normalizeUser(user);
    const cleanedUser = await this.cleanMVCRpermission(normalizedUser);
    return cleanedUser;
  }

  static async bySessionId(sessionId) {
    const session = await SessionDAO.byId(sessionId);
    if (session === null) {
      return null;
    }
    const now = DateTime.local();
    if (now.valueOf() >= session.expiresAt.valueOf()) {
      return null;
    }
    return UserDAO.byId(session.userId);
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

  static async all() {
    const sql = 'SELECT * FROM "users" ORDER BY "id" ASC';
    const users = await db.manyOrNone(sql);
    return normalizeUsers(users);
  }

  static async getUsersPagination(limit, offset, search) {
    const sql = `SELECT * FROM "users" WHERE "email" ILIKE '${search}%' ORDER BY "id" ASC LIMIT ${limit} OFFSET ${offset}`;
    const users = await db.manyOrNone(sql, { search, limit, offset });
    return normalizeUsers(users);
  }

  static async getUsersTotal(search) {
    const sql = `SELECT COUNT(*) as total from "users" WHERE "email" ILIKE '${search}%'`;
    const { total } = await db.one(sql, { search });
    return total;
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
  "uniqueName",
  "userTitle",
  "firstName",
  "lastName",
  "department"
) VALUES (
  $(createdAt),
  $(email),
  $(scope),
  $(sub),
  $(uniqueName),
  $(userTitle),
  $(firstName),
  $(lastName),
  $(department)
) RETURNING "id"`;
    const persistedUser = {
      createdAt: DateTime.local(),
      ...user,
    };
    const { id } = await db.one(sql, persistedUser);
    persistedUser.id = id;
    return normalizeUser(persistedUser);
  }

  static async updateSub(emailUser) {
    const sql = `
UPDATE "users"
  SET
    "sub" = $(sub),
    "userTitle" = $(userTitle),
    "firstName" = $(firstName),
    "lastName" = $(lastName),
    "department" = $(department)
  WHERE "email" = $(email) RETURNING "id"`;
    const persistedUser = {
      ...emailUser,
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
    "uniqueName" = $(uniqueName),
    "mvcrExpiryDate" = $(mvcrExpiryDate),
    "mvcrAcctType" = $(mvcrAcctType)
  WHERE "id" = $(id)`;
    await db.query(sql, user);
    return normalizeUser(user);
  }

  static async delete({ id }) {
    const sql = 'DELETE FROM "users" WHERE "id" = $(id)';
    const rowsDeleted = await db.result(sql, { id }, r => r.rowCount);
    return rowsDeleted === 1;
  }

  static async cleanMVCRpermission(normalizedUser) {
    if (normalizedUser && normalizedUser.mvcrAcctType === 1) {
      const now = DateTime.local();
      if (!normalizedUser.mvcrExpiryDate
        || now.valueOf() >= normalizedUser.mvcrExpiryDate.valueOf()) {
        const noMVCRscope = normalizedUser.scope.filter(
          scopeItem => scopeItem !== AuthScope.MVCR_READ,
        );
        const noMVCRuser = {
          ...normalizedUser,
          mvcrExpiryDate: null,
          mvcrAcctType: 0,
          scope: noMVCRscope,
        };
        this.update(noMVCRuser);
        return noMVCRuser;
      }
      return normalizedUser;
    }
    return normalizedUser;
  }
}

export default UserDAO;
