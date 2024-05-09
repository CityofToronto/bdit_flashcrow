import { ReportType } from '@/lib/Constants';
import StudyDAO from '@/lib/db/StudyDAO';
import FeatureResolver from '@/lib/geo/FeatureResolver';
import CompositeId from '@/lib/io/CompositeId';
import ArrayStats from '@/lib/math/ArrayStats';

const REPORT_TYPES_COLLISION = [
  ReportType.COLLISION_DIRECTORY,
  ReportType.COLLISION_TABULATION,
];
const LIMIT = 100;

class ReportDAO {
  static getReportsForStudy(study, reportFormat) {
    const { countGroupId, studyType } = study;
    const id = `${studyType.name}/${countGroupId}`;
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

  static async byCentrelineAndCollisionQuery(featuresSelection, collisionQuery, reportFormat) {
    const { features, selectionType } = featuresSelection;

    const reports = [];
    features.forEach((element) => {
      const item = REPORT_TYPES_COLLISION
        .filter(reportType => reportType.formats.includes(reportFormat))
        .map(reportType => ({
          type: reportType,
          id: `${CompositeId.encode([element])}/${selectionType.name}`,
          format: reportFormat,
          ...collisionQuery,
        }));
      reports.push(item);
    });
    return reports.flat();
  }

  static async byCentrelineAndStudyQuery(featuresSelection, studyQuery, reportFormat) {
    const features = await FeatureResolver.byFeaturesSelection(featuresSelection);

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
