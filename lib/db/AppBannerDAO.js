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
      alert_text: banner.bannerMessage,
      alert_type: banner.bannerType,
      display_alert: banner.displayBanner,
      display_button: banner.displayButton,
      button_link: banner.buttonLink,
      button_text: banner.buttonText,
    };

    const query = pgp.helpers.insert(
      values, ['created_by', 'display_alert', 'alert_text', 'alert_type', 'display_button', 'button_link', 'button_text'], 'app_banner',
    );
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
