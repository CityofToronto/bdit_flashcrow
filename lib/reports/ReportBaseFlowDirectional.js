import ArrayUtils from '@/lib/ArrayUtils';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { getDirectionCandidatesFrom } from '@/lib/geo/GeometryUtils';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';

/**
 * Base class for FLOW-related reports that rely on a sense of directional approaches,
 * major vs. minor roads, or other geometric aspects of an intersection.
 */
class ReportBaseFlowDirectional extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  /**
   * @typedef {Object} DirectionMap
   * @property {Array<CardinalDirection>} majorDirections
   * @property {Array<CardinalDirection>} minorDirections
   */

  /**
   *
   * @param {Object} intersection - intersection to get directions from
   * @param {Array} segments - segments incident to `intersection`
   * @returns {DirectionMap} major and minor directions
   */
  static getMajorAndMinorDirections(intersection, segments) {
    const segmentLineStrings = segments.map(({ geom: { coordinates } }) => coordinates);
    const intersectionPoint = intersection.geom.coordinates;
    const directionCandidates = getDirectionCandidatesFrom(segmentLineStrings, intersectionPoint);

    /*
     * Smaller `featureCode` values correspond to more major roads.
     *
     * TODO: what if all `segments` have the same `featureCode`?
     */
    const minFeatureCodeIndex = ArrayUtils.getMinBy(
      Array.from(directionCandidates.values()),
      i => segments[i].featureCode,
    );
    /*
     * `directionCandidates` values are indices into the `segmentLineStrings` array, which
     * we can also use on the input array `segments`.
     */
    const minFeatureCode = segments[minFeatureCodeIndex].featureCode;
    const majorDirections = [];
    const minorDirections = [];
    directionCandidates.forEach((i, direction) => {
      if (segments[i].featureCode === minFeatureCode) {
        majorDirections.push(direction);
      } else {
        minorDirections.push(direction);
      }
    });
    return {
      majorDirections,
      minFeatureCode,
      minorDirections,
    };
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
    const {
      majorDirections,
      minFeatureCode,
      minorDirections,
    } = ReportBaseFlowDirectional.getMajorAndMinorDirections(intersection, segments);
    return {
      countData,
      intersection,
      majorDirections,
      minFeatureCode,
      minorDirections,
      segments,
    };
  }
}

export default ReportBaseFlowDirectional;
