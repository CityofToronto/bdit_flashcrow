import db from '@/lib/db/db';
import pgPromise from 'pg-promise';

const pgp = pgPromise({
  capSQL: true,
});
class AppBannerDAO {
  static async create(userId, banner) {
    const sql = `
      DELETE FROM app_banner WHERE id = 1;
    `;
    await db.none(sql);

    const values = {
      created_by: userId,
      message: banner.message,
      type: banner.type,
      display: banner.display,
    };

    const query = pgp.helpers.insert(values, ['created_by', 'message', 'type', 'display'], 'app_banner');
    await db.none(query);
    return true;
  }

  static async truncate() {
    const sql = `
      DELETE FROM app_banner WHERE id = 1;
    `;
    await db.none(sql);
    return true;
  }

  static async get() {
    const sql = `
      SELECT * FROM app_banner WHERE id = 1;
    `;
    const result = await db.oneOrNone(sql);
    return result;
  }
}

export default AppBannerDAO;
