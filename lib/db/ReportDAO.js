import { ReportType } from '@/lib/Constants';
import StudyDAO from '@/lib/db/StudyDAO';
import CompositeId from '@/lib/io/CompositeId';
import ArrayStats from '@/lib/math/ArrayStats';

const REPORT_TYPES_COLLISION = [
  ReportType.COLLISION_DIRECTORY,
  ReportType.COLLISION_TABULATION,
];
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
      .filter(reportType => reportType.formats.includes(reportFormat))
      .filter(reportType => !Object.prototype.hasOwnProperty.call(reportType, 'options'))
      .map(reportType => ({
        type: reportType,
        id,
        format: reportFormat,
      }));
  }

  static async byCentrelineAndCollisionQuery(features, collisionQuery, reportFormat) {
    const id = CompositeId.encode(features);
    return REPORT_TYPES_COLLISION
      .filter(reportType => reportType.formats.includes(reportFormat))
      .map(reportType => ({
        type: reportType,
        id,
        format: reportFormat,
        ...collisionQuery,
      }));
  }

  static async byCentrelineAndStudyQuery(features, studyQuery, reportFormat) {
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
