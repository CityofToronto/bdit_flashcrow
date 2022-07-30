import db from '@/lib/db/db';

class MvcrAccessEventsDAO {
  static async create(userId, collisionId, collisionYear, collisionMonth) {
    const filename = `mvcr_${collisionYear}_${collisionMonth}_${collisionId}.pdf`;
    const longCollisionId = `${collisionYear}:${collisionId}`;
    await db.none(
      'INSERT INTO mvcr_access_events(user_id, filename, collision_id) VALUES($1, $2, $3)',
      [userId, filename, longCollisionId],
    );
    return true;
  }
}

export default MvcrAccessEventsDAO;
