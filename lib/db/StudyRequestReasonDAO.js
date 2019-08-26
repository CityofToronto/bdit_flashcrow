import db from './db';

/**
 * Since the set of study request statuses is small and static, we
 * cache it here to reduce DB load.
 */
let CACHE = null;

async function init() {
  const reasons = await db.many('SELECT * FROM "study_request_reasons"');
  CACHE = new Map(reasons.map(reason => [reason.value, reason]));
}

class StudyRequestReasonDAO {
  static isInited() {
    return CACHE !== null;
  }

  static async all() {
    if (!StudyRequestReasonDAO.isInited()) {
      await init();
    }
    return CACHE;
  }

  static async byValue(value) {
    if (!StudyRequestReasonDAO.isInited()) {
      await init();
    }
    return CACHE.get(value);
  }
}

export default StudyRequestReasonDAO;
