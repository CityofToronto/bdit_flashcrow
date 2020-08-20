import StudyDAO from '@/lib/db/StudyDAO';
import ArrayStats from '@/lib/math/ArrayStats';

const LIMIT = 100;

class ReportDAO {
  static getReportsForStudy(study, reportFormat) {
    const { countGroupId, type } = study;
    const { id: categoryId, studyType } = type;
    const id = `${categoryId}/${countGroupId}`;
    /*
     * To simplify bulk report generation, we only generate reports of types that do not
     * have user-supplied parameters.
     */
    return studyType.reportTypes
      .filter(reportType => !Object.prototype.hasOwnProperty.call(reportType, 'options'))
      .map(reportType => ({ type: reportType, id, format: reportFormat }));
  }

  static async byCentreline(features, studyQuery, reportFormat) {
    const reports = [];

    const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
    const studyTotal = ArrayStats.sum(
      studySummary.map(({ n }) => n),
    );
    if (studyTotal === 0) {
      return reports;
    }

    for (let offset = 0; offset < studyTotal; offset += LIMIT) {
      const pagination = { limit: LIMIT, offset };
      /* eslint-disable-next-line no-await-in-loop */
      const studies = await StudyDAO.byCentreline(features, studyQuery, pagination);

      studies.forEach((study) => {
        const reportsForStudy = ReportDAO.getReportsForStudy(study, reportFormat);
        reportsForStudy.forEach((report) => {
          reports.push(report);
        });
      });
    }

    return reports;
  }
}

export default ReportDAO;
