import db from '@/lib/db/db';
import pgPromise from 'pg-promise';

const pgp = pgPromise({
  capSQL: true,
});
class MvcrPermissionEventsDAO {
  static async create(permissionChangeEvent) {
    const query = pgp.helpers.insert(permissionChangeEvent, ['adminId', 'userId', 'eventAction', 'accessPrevious', 'accessNew'], 'mvcr_permission_events');
    await db.none(query);
    return true;
  }
}

export default MvcrPermissionEventsDAO;
