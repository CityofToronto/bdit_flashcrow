import db from './db';

/**
 * Since the set of study request statuses is small and static, we
 * cache it here to reduce DB load.
 */
let CACHE = null;

async function init() {
  const statii = await db.many('SELECT * FROM "study_request_status"');
  CACHE = new Map(statii.map(status => [status.value, status]));
}

class StudyRequestStatusDAO {
  static isInited() {
    return CACHE !== null;
  }

  static async all() {
    if (!StudyRequestStatusDAO.isInited()) {
      await init();
    }
    return CACHE;
  }

  static async byValue(value) {
    if (!StudyRequestStatusDAO.isInited()) {
      await init();
    }
    return CACHE.get(value);
  }
}

export default StudyRequestStatusDAO;
