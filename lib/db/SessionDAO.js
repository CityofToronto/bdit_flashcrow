import db from '@/lib/db/db';
import Session from '@/lib/model/Session';
import DateTime from '@/lib/time/DateTime';

class SessionDAO {
  static async create(user, ttl) {
    const sql = `
INSERT INTO "sessions" (
  "createdAt",
  "expiresAt",
  "userId"
) VALUES (
  $(createdAt),
  $(expiresAt),
  $(userId)
) RETURNING "id"`;
    const createdAt = DateTime.local();
    const expiresAt = createdAt.plus(ttl);
    const { id: userId } = user;
    const persistedSession = {
      createdAt,
      expiresAt,
      userId,
    };
    const { id } = await db.one(sql, persistedSession);
    persistedSession.id = id;
    return Session.read.validateAsync(persistedSession);
  }

  static async byId(id) {
    const sql = 'SELECT * FROM "sessions" WHERE "id" = $(id)';
    const session = await db.oneOrNone(sql, { id });
    if (session === null) {
      return null;
    }
    return Session.read.validateAsync(session);
  }

  static async delete({ id }) {
    const sql = 'DELETE FROM "sessions" WHERE "id" = $(id)';
    const rowsDeleted = await db.result(sql, { id }, r => r.rowCount);
    return rowsDeleted === 1;
  }
}

export default SessionDAO;
