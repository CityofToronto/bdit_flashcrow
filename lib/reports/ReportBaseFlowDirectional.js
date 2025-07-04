/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import {
  CardinalDirection,
  CentrelineType,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
  TurningMovement,
} from '@/lib/Constants';
import { identity } from '@/lib/FunctionUtils';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { getDirectionCandidatesFrom, getHackyDirectionCandidatesFrom } from '@/lib/geo/GeometryUtils';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';

/**
 * Base class for FLOW-related reports that rely on a sense of directional approaches,
 * major vs. minor roads, or other geometric aspects of an intersection.
 */
class ReportBaseFlowDirectional extends ReportBaseFlow {
  /**
   * Useful with {@link ArrayUtils.sumObjects} to ensure reports have all expected object
   * keys, even if there's no available data.  (Some counts are missing their associated
   * data, but it's still important that MOVE be able to generate valid reports without
   * errors!)
   *
   * @returns {Object} object with keys for all basic TMC parameters, each with zero volume
   */
  static emptyTmcRecord() {
    const data = {};
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      TurningMovement.enumValues.forEach(({ short: turn }) => {
        TMC_MODES_VEHICLE.forEach((mode) => {
          data[`${dir}_${mode}_${turn}`] = 0;
        });
      });
      TMC_MODES_NON_VEHICLE.forEach((mode) => {
        data[`${dir}_${mode}`] = 0;
      });
    });
    return data;
  }

  static computeMovements(rawData) {
    const data = {};

    /*
     * Swap directions from `rawData`.
     *
     * Note that `rawData` understands directions a bit differently: `rawData.N_CARS_R`,
     * for instance, is "cars entering via the northern leg, turning right" - these
     * vehicles would be travelling *southbound*, and would show up in `S_CARS_R` below.
     */
    CardinalDirection.enumValues.forEach(({
      short: dir,
      opposing: { short: dirOpposing },
    }) => {
      TurningMovement.enumValues.forEach(({ short: turn }) => {
        TMC_MODES_VEHICLE.forEach((mode) => {
          data[`${dir}_${mode}_${turn}`] = rawData[`${dirOpposing}_${mode}_${turn}`];
        });
      });
      TMC_MODES_NON_VEHICLE.forEach((mode) => {
        data[`${dir}_${mode}`] = rawData[`${dir}_${mode}`];
      });
    });

    return data;
  }

  /**
   * Computes "movement totals" and "vehicle totals" by adding across various fields
   * in `rawData`.  This normalizes `rawData` into a form useful for further processing.
   *
   * @param {Object} rawData - one bucket of raw TMC data, e.g. from {@link StudyDataDAO}
   * @returns {Object} `rawData`, but with movement and vehicle totals computed
   */
  static computeMovementAndVehicleTotals(rawData) {
    const data = ReportBaseFlowDirectional.computeMovements(rawData);

    /*
     * Directional totals, by type of vehicle.
     *
     * After swapping directions `N_CARS_R` means "cars travelling northbound,
     * turning right", i.e. cars that enter the intersection from the south,
     * turn right, and exit the intersection at east travelling eastbound.
     *
     * `N_CARS_TOTAL`, then, means "cars travelling northbound" - this is the sum
     * of the three possible turning movements (Right, Thru, Left).
     */
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      TMC_MODES_VEHICLE.forEach((mode) => {
        data[`${dir}_${mode}_TOTAL`] = ArrayStats.sum(
          TurningMovement.enumValues.map(
            ({ short: turn }) => data[`${dir}_${mode}_${turn}`],
          ),
        );
      });
    });

    /*
     * Directional exits, by type of vehicle.  Here `N_TRUCK_EXITS` means "trucks exiting
     * northbound".  Each directional exit is the sum of three turning movements from the
     * other three legs.
     *
     * It is generally assumed that all vehicles entering the intersection then proceed to
     * exit the intersection.  As such, the sum of directional exits should equal the sum
     * of directional totals.
     */
    TMC_MODES_VEHICLE.forEach((mode) => {
      data[`N_${mode}_EXITS`] = data[`W_${mode}_R`] + data[`N_${mode}_T`] + data[`E_${mode}_L`];
      data[`E_${mode}_EXITS`] = data[`N_${mode}_R`] + data[`E_${mode}_T`] + data[`S_${mode}_L`];
      data[`S_${mode}_EXITS`] = data[`E_${mode}_R`] + data[`S_${mode}_T`] + data[`W_${mode}_L`];
      data[`W_${mode}_EXITS`] = data[`S_${mode}_R`] + data[`W_${mode}_T`] + data[`N_${mode}_L`];
    });

    /*
     * Turning movement totals, all vehicles combined.  `N_VEHICLE_R` means "vehicles entering
     * via the northbound leg, turning right", and is the sum of vehicle-type-specific counts
     * (i.e. cars, trucks, busses).
     */
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      TurningMovement.enumValues.forEach(({ short: turn }) => {
        data[`${dir}_VEHICLE_${turn}`] = ArrayStats.sum(
          TMC_MODES_VEHICLE.map(
            mode => data[`${dir}_${mode}_${turn}`],
          ),
        );
      });
    });

    /*
     * Directional exit totals, all vehicles combined.  `N_VEHICLE_EXITS` means "vehicles exiting
     * via the northbound leg", and is the sum of vehicle-type-specific exits (i.e. cars, trucks,
     * busses).
     */
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      data[`${dir}_VEHICLE_EXITS`] = ArrayStats.sum(
        TMC_MODES_VEHICLE.map(
          mode => data[`${dir}_${mode}_EXITS`],
        ),
      );
    });

    /*
     * Directional totals, all vehicles combined.  `N_VEHICLE_TOTAL` means "vehicles entering
     * via the northbound leg", and is the sum of vehicle-type-specific directional totals.
     */
    CardinalDirection.enumValues.forEach(({ short: dir }) => {
      data[`${dir}_VEHICLE_TOTAL`] = ArrayStats.sum(
        TMC_MODES_VEHICLE.map(
          mode => data[`${dir}_${mode}_TOTAL`],
        ),
      );
    });

    /*
     * Modal totals, including peds / bikes.  `VEHICLE_TOTAL` means "total number of vehicles
     * entering via any leg".
     *
     * For peds, bikes, and other, we do not have turning movement or other direction-of-travel
     * information.  `N_PEDS` means "pedestrians crossing the northbound leg in either direction".
     *
     * It is unclear how a cyclist turning in lane would be counted.
     */
    data.VEHICLE_TOTAL = ArrayStats.sum(
      CardinalDirection.enumValues.map(
        ({ short: dir }) => data[`${dir}_VEHICLE_TOTAL`],
      ),
    );
    TMC_MODES_NON_VEHICLE.forEach((mode) => {
      data[`${mode}_TOTAL`] = ArrayStats.sum(
        CardinalDirection.enumValues.map(
          ({ short: dir }) => data[`${dir}_${mode}`],
        ),
      );
    });

    /*
     * Overall total.
     */
    data.TOTAL = data.VEHICLE_TOTAL + ArrayStats.sum(
      TMC_MODES_NON_VEHICLE.map(
        mode => data[`${mode}_TOTAL`],
      ),
    );

    return data;
  }

  /**
   *
   * @param {Array} countData - raw TMC data, e.g. from {@link StudyDataDAO}
   * @returns {Array} `countData`, normalized for further processing
   * @see {@link ReportBaseFlowDirectional.computeMovementAndVehicleTotals}
   */
  static computeAllMovementAndVehicleTotals(countData) {
    return countData.map(({
      id,
      countId,
      t,
      data: rawData,
    }) => {
      const data = ReportBaseFlowDirectional.computeMovementAndVehicleTotals(rawData);
      return {
        id,
        countId,
        t,
        data,
      };
    });
  }

  /**
   *
   * @param {Array} countData - TMC data, either raw or normalized
   * @returns {Array} hourly totals from `countData`
   */
  static sumHourly(countData) {
    const n = countData.length;
    const hourlyData = [];
    for (let i = 0; i < n; i += ReportBaseFlow.ROWS_PER_HOUR) {
      const hourRows = countData.slice(i, i + ReportBaseFlow.ROWS_PER_HOUR);
      const rawHourData = hourRows.map(({ data }) => data);
      const hourData = ArrayUtils.sumObjects(rawHourData);
      hourlyData.push(hourData);
    }
    return hourlyData;
  }

  /**
   *
   * @param {Array<Object>} segments - segments incident to `intersection`
   * @returns {Array<Array<number>>} arrays of indices from `segments`, with each such
   * array representing a single road
   */
  static getRoads(segments) {
    const segmentRoadIndices = segments.map(({ roadId }, i) => ({ i, roadId }));
    return ArrayUtils.groupBy(segmentRoadIndices, ({ roadId }) => roadId)
      .map(road => road.map(({ i }) => i));
  }

  /**
   * @param {Array<Array<number>>} roads - arrays of indices from `segments`, with each such
   * array representing a single road
   * @param {Map<CardinalDirection, number>} directionCandidates - mapping from
   * `CardinalDirection` values to indices from `segments` representing best directional
   * candidates
   * @returns {Array<Array<CardinalDirection>>} array of roads, each containing
   * an array of "X-bound" directions from `intersection` for that road
   */
  static inferRoadDirections(roads, directionCandidates) {
    /*
     * `indexToDirection` here is the "inverse" mapping of `directionCandidates`.  Using this,
     * we can map indices into `segments` into directions.
     */
    const indexToDirection = new Map();
    directionCandidates.forEach((i, dir) => {
      indexToDirection.set(i, dir.opposing);
    });

    const roadDirections = roads.map(
      road => road
        .filter(i => indexToDirection.has(i))
        .map(i => indexToDirection.get(i)),
    );

    /*
     * We now attempt to assign any unused directions to roads.
     *
     * This is mainly useful for "offset intersections", where looking at the geometry of
     * `intersection` and incident `segments` alone will miss one of the offset legs.  If
     * a road exists with one identified leg in the opposing direction of the missing offset
     * leg, we add the missing offset leg to that road.
     *
     * In the case of T-intersections, the missing leg will have zero volume in the count data,
     * so we can apply this same heuristic without issue.
     *
     * If no such road can be found, we instead add the unused direction to its own road, to
     * ensure that the data for that leg can at least be included in approach totals.
     */
    const unusedDirections = CardinalDirection.enumValues
      .filter(dir => !directionCandidates.has(dir))
      .map(dir => dir.opposing);
    unusedDirections.forEach((dir) => {
      const road = roadDirections.find(
        roadCandidate => roadCandidate.length === 1 && roadCandidate.includes(dir.opposing),
      );
      if (road === undefined) {
        roadDirections.push([dir]);
      } else {
        road.push(dir);
      }
    });
    return roadDirections;
  }

  /**
   * @param {Object} intersection - intersection to get directions from
   * @param {Array<Object>} segments - segments incident to `intersection`
   * @returns {Array<Array<CardinalDirection>>} array of roads, each containing
   * an array of "X-bound" directions from `intersection` for that road
   */

  static getRoadDirections(intersection, segments) {
    const specialCaseCentrelineIds = [13453619];

    if (intersection === null || segments.length === 0) {
      /*
       * If the underlying centreline locations cannot be found (e.g. because this study refers
       * to locations that no longer exist in the centreline), default to north-south and
       * east-west roads.
       */
      return [
        [CardinalDirection.NORTH, CardinalDirection.SOUTH],
        [CardinalDirection.EAST, CardinalDirection.WEST],
      ];
    }

    /*
     * Figure out which `segments` lie in which directions from `intersection`.  By combining
     * this information with `roads` (which `segments` belong to which roads), we can figure
     * out directions for each road at the intersection.
     */
    const segmentLineStrings = segments.map(({ geom: { coordinates } }) => coordinates);
    const intersectionPoint = intersection.geom.coordinates;

    const directionCandidates = getDirectionCandidatesFrom(segmentLineStrings, intersectionPoint);

    const roads = ReportBaseFlowDirectional.getRoads(segments);

    if (specialCaseCentrelineIds.includes(intersection.centrelineId)) {
      const hackyDirectionCandidates = getHackyDirectionCandidatesFrom(
        segmentLineStrings,
        intersectionPoint,
      );
      return ReportBaseFlowDirectional.inferRoadDirections(roads, hackyDirectionCandidates);
    }
    return ReportBaseFlowDirectional.inferRoadDirections(roads, directionCandidates);
  }

  /**
   * Returns the total volume entering the intersection from any legs that extend in one of
   * `roadDirections` away from the intersection.
   *
   * Note that, as per {@link ReportBaseFlowDirectional.computeMovementAndVehicleTotals},
   * `data` lists volumes according to which direction vehicles are initially travelling
   * when they enter the intersection - i.e. "X-bound" directions.  In
   * {@link ReportBaseFlowDirectional.getRoadDirections}, we convert the output of
   * {@link GeometryUtils.getDirectionCandidatesFrom} to the same "X-bound" directions.
   *
   * @param {Array<CardinalDirection>} roadDirections - directions for segments of a road
   * at the intersection
   * @param {Object} data - normalized count data
   * @returns {number} total vehicle volume entering on legs listed in `roadDirections`
   */
  static getRoadVolume(roadDirections, data) {
    return ArrayStats.sum(
      roadDirections.map(
        ({ short: dir }) => data[`${dir}_VEHICLE_TOTAL`],
      ),
    );
  }

  static getDirectionalStats(study, { countData: rawData, intersection, segments }) {
    const countData = ReportBaseFlowDirectional.computeAllMovementAndVehicleTotals(rawData);

    /*
     * As per OTM Book 12, p. 77:

     * "The main road should be the road that carries the greater hourly vehicular traffic volume
     * over the period of study. As this main road may not, however, carry the greater volume
     * during each of the hours studied, it is possible to refine the definition of main road to
     * incorporate analysis on an hour-by-hour basis..."
     *
     * This hourly refinement is consistent with OTM guidelines, and it allows for analysis that
     * reflects actual road usage.  As such, MOVE Reporter incorporates this refinement here.
     */
    const hourlyData = ReportBaseFlowDirectional.sumHourly(countData);
    const roadDirections = ReportBaseFlowDirectional.getRoadDirections(intersection, segments);
    const hourlyRoadVolumes = hourlyData.map(
      hourData => roadDirections.map(
        directions => ReportBaseFlowDirectional.getRoadVolume(directions, hourData),
      ),
    );

    /*
     * From here, we use the hourly road volumes to identify major and minor directions.
     */
    const hourlyRoadMajorIndex = hourlyRoadVolumes.map(
      hourRoadVolumes => ArrayUtils.getMaxIndexBy(hourRoadVolumes, identity),
    );
    const hourlyMajorDirections = hourlyRoadMajorIndex.map(
      indexMajor => roadDirections[indexMajor],
    );
    const hourlyMinorDirections = hourlyRoadMajorIndex.map(
      indexMajor => Array.prototype.concat.apply(
        [],
        roadDirections.filter((_, i) => i !== indexMajor),
      ),
    );

    return {
      countData,
      hourlyData,
      hourlyMajorDirections,
      hourlyMinorDirections,
      intersection,
      segments,
    };
  }

  async fetchRawData(study) {
    const { countLocation, counts, studyData } = await super.fetchRawData(study);
    if (counts.length === 0) {
      return null;
    }
    const [count] = counts;
    const { id } = count;
    const countData = studyData.get(id);

    /*
     * Directional reports rely on distinguishing major / minor roads (or, as per OTM,
     * main / side roads.)
     *
     * We start by identifying the segments incident on the intersection under study.
     */
    const { centrelineId, centrelineType } = study;

    /*
     * It is possible to have TMCs along midblocks, but we can't rely on centreline geometry
     * to infer road directions in that case.  As such, to avoid errors from
     * `GeometryUtils.getDirectionCandidatesFrom`, we default to the empty list of incident
     * segments here.
     */
    let segments = [];
    if (centrelineType === CentrelineType.INTERSECTION) {
      segments = await CentrelineDAO.featuresIncidentTo(centrelineType, centrelineId);
    }

    return {
      count,
      countData,
      intersection: countLocation,
      segments,
    };
  }
}

export default ReportBaseFlowDirectional;
