import db from '@/lib/db/db';
import pgPromise from 'pg-promise';

const pgp = pgPromise({
  capSQL: true,
});
class MvcrPermissionEventsDAO {
  static async create(adminId, userNew, userOld) {
    const values = {
      adminId,
      userId: userNew.id,
      eventAction: userOld.mvcrAcctType <= userNew.mvcrAcctType ? 'Upgraded' : 'Downgraded',
      accessPrevious: userOld.mvcrAcctType,
      accessNew: userNew.mvcrAcctType,
    };
    const query = pgp.helpers.insert(values, ['adminId', 'userId', 'eventAction', 'accessPrevious', 'accessNew'], 'mvcr_permission_events');
    await db.none(query);
    return true;
  }
}

export default MvcrPermissionEventsDAO;
