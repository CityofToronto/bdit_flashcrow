import db from '@/lib/db/db';

class StudyDAO {
  static async byCategoryAndCountGroup(categoryId, countGroupId) {
    const sql = `
SELECT * FROM counts.studies
WHERE "CATEGORY_ID" = $(categoryId)
AND count_group_id = $(countGroupId)`;
    const row = await db.oneOrNone(sql, { categoryId, countGroupId });
    if (row === null) {
      return null;
    }
    // TODO: what do we return here?
    return row;
  }

  /*
  static async byCentreline(studyQuery) {

  }

  static async byCentrelineSummary(studyQuery) {

  }

  static async byCentrelineTotal(centrelineType, centrelineId) {

  }
  */
}

export default StudyDAO;
