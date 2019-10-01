import ArrayUtils from '@/lib/ArrayUtils';
import { ReportType } from '@/lib/Constants';
import { getDirectionCandidatesFrom } from '@/lib/geo/GeometryUtils';
import CentrelineDAO from '@/../lib/db/CentrelineDAO';
import ReportBaseFlow from './ReportBaseFlow';

/**
 * Subclass of {@link ReportBaseFlow} for the Intersection Warrant Summary Report.
 *
 * @see https://www.notion.so/bditto/Intersection-Warrant-Summary-Report-6f06d430038c4421b5e727a478af1b34
 */
class ReportIntersectionWarrantSummary extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.INTERSECTION_WARRANT_SUMMARY;
  }

  async fetchRawData(count) {
    const countData = await super.fetchRawData(count);

    /*
     * Determine major and minor directions.  Ideally we would push this heavy lifting to the
     * backend or database layer, but that will take some work.
     */
    const { centrelineId, centrelineType } = count;
    const [intersection, segments] = await Promise.all([
      CentrelineDAO.byIdAndType(centrelineId, centrelineType),
      CentrelineDAO.featuresIncidentTo(centrelineType, centrelineId),
    ]);
    const segmentLineStrings = segments.map(({ geom: { coordinates } }) => coordinates);
    const intersectionPoint = intersection.geom.coordinates;
    const directionCandidates = getDirectionCandidatesFrom(segmentLineStrings, intersectionPoint);
    const minFeatureCode = ArrayUtils.getMinBy(
      Array.from(Object.values(directionCandidates)),
      i => segments[i].featureCode,
    );
    const majorDirections = [];
    const minorDirections = [];
    Object.entries(directionCandidates).forEach(([direction, i]) => {
      if (segments[i].featureCode === minFeatureCode) {
        majorDirections.push(direction);
      } else {
        minorDirections.push(direction);
      }
    });
    return {
      countData,
      majorDirections,
      minorDirections,
    };
  }

  transformData({ countData, majorDirections, minorDirections }) {
    return { countData, majorDirections, minorDirections };
  }

  generateCsvLayout(/* count, transformedData */) {
    const columns = [
      // TODO: columns
    ];
    return { columns, rows: [] };
  }

  generatePdfLayout(count /* , transformedData */) {
    const metadata = this.getPdfMetadata(count);
    // TODO: content modules
    return {
      layout: 'portrait',
      metadata,
      content: [
        // TODO: content modules
      ],
    };
  }
}

export default ReportIntersectionWarrantSummary;
