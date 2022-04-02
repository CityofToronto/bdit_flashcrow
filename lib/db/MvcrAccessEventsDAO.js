import db from '@/lib/db/db';

class MvcrAccessEventsDAO {
  static async create(userId, collisionId, filename) {
    await db.none(
      'INSERT INTO mvcr_access_events(user_id, filename, collision_id) VALUES($1, $2, $3)',
      [userId, filename, collisionId],
    );
    return true;
  }
}

export default MvcrAccessEventsDAO;
