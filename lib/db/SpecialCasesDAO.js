import db from './db';

class SpecialCasesDAO {
  static async getSpecialCaseCentrelineIds() {
    const sql = `
        select centreline_id from public.hacky_ids;
    `;
    const rows = await db.manyOrNone(sql);
    return rows.map(row => row.centreline_id);
  }

  static async getCautionableCentrelineIds() {
    const sql = `
        select centreline_id from public.caution_ids;
    `;
    const rows = await db.manyOrNone(sql);
    return rows.map(row => row.centreline_id);
  }
}

export default SpecialCasesDAO;
