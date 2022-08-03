import db from '@/lib/db/db';
import pgPromise from 'pg-promise';

const pgp = pgPromise({
  capSQL: true,
});
class MvcrAccessEventsDAO {
  static async create(userId, collisionParameters) {
    const values = collisionParameters.map((p) => {
      const filename = this.mvcrFilename(p.collisionYear, p.collisionMonth, p.collisionId);
      const longCollisionId = this.longCollisionId(p.collisionYear, p.collisionId);
      return { user_id: userId, filename, collision_id: longCollisionId };
    });
    const query = pgp.helpers.insert(values, ['user_id', 'filename', 'collision_id'], 'mvcr_access_events');
    await db.none(query);
    return true;
  }

  static mvcrFilename(collisionYear, collisionMonth, collisionId) {
    return `mvcr_${collisionYear}_${collisionMonth}_${collisionId}.pdf`;
  }

  static longCollisionId(collisionYear, collisionId) {
    return `${collisionYear}:${collisionId}`;
  }
}

export default MvcrAccessEventsDAO;
