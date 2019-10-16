import ArrayUtils from '@/lib/ArrayUtils';
import {
  CardinalDirection,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
  TurningMovement,
} from '@/lib/Constants';
import { identity } from '@/lib/FunctionUtils';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { getDirectionCandidatesFrom } from '@/lib/geo/GeometryUtils';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlow from '@/lib/reports/ReportBaseFlow';

/**
 * Base class for FLOW-related reports that rely on a sense of directional approaches,
 * major vs. minor roads, or other geometric aspects of an intersection.
 *
 * TODO: rename to reflect that this relates specifically to intersections / TMCs
 */
class ReportBaseFlowDirectional extends ReportBaseFlow {
  /* eslint-disable class-methods-use-this */

  static computeMovementAndVehicleTotals(rawData) {
    const data = {};

    /*
     * Swap directions from `rawData`.
     *
     * Note that `rawData` understands directions a bit differently: `rawData.N_CARS_R`,
     * for instance, is "cars entering via the northbound leg, turning right" - these
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
   * @param {Object} intersection - intersection to get directions from
   * @param {Array} segments - segments incident to `intersection`
   */
  static getRoadDirections(roads, intersection, segments) {
    const centrelineIdToSegmentIndex = new Map();
    segments.forEach(({ centrelineId }, i) => {
      centrelineIdToSegmentIndex.set(centrelineId, i);
    });
    const roadsIndices = roads.map(
      roadSegments => roadSegments.map(
        ({ centrelineId }) => centrelineIdToSegmentIndex.get(centrelineId),
      ),
    );

    const segmentLineStrings = segments.map(({ geom: { coordinates } }) => coordinates);
    const intersectionPoint = intersection.geom.coordinates;
    const directionCandidates = getDirectionCandidatesFrom(segmentLineStrings, intersectionPoint);
    const indexToDirection = new Map();
    directionCandidates.forEach((i, dir) => {
      indexToDirection.set(i, dir);
    });
    return roadsIndices.map(
      roadIndices => roadIndices
        .filter(i => indexToDirection.has(i))
        .map(i => indexToDirection.get(i)),
    );
  }

  static getRoadVolume(roadDirections, data) {
    return ArrayStats.sum(
      roadDirections.map(
        ({ opposing: { short: dirOpposing } }) => data[`${dirOpposing}_VEHICLE_TOTAL`],
      ),
    );
  }

  async fetchRawData(count) {
    const rawData = await super.fetchRawData(count);
    const countData = ReportBaseFlowDirectional.computeAllMovementAndVehicleTotals(rawData);

    /*
     * Determine major and minor directions.  Ideally we would push this heavy lifting to the
     * backend or database layer, but that will take some work.
     */
    const { centrelineId, centrelineType } = count;
    const [intersection, segments] = await Promise.all([
      CentrelineDAO.byIdAndType(centrelineId, centrelineType),
      CentrelineDAO.featuresIncidentTo(centrelineType, centrelineId),
    ]);
    const roads = ArrayUtils.groupBy(segments, ({ roadId }) => roadId);

    const hourlyData = ReportBaseFlowDirectional.sumHourly(countData);
    const roadDirections = ReportBaseFlowDirectional.getRoadDirections(
      roads,
      intersection,
      segments,
    );
    const hourlyRoadVolumes = hourlyData.map(
      hourData => roads.map(
        (_, i) => ReportBaseFlowDirectional.getRoadVolume(roadDirections[i], hourData),
      ),
    );

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
    const minFeatureCode = Math.min(
      ...segments.map(({ featureCode }) => featureCode),
    );

    return {
      countData,
      hourlyData,
      hourlyMajorDirections,
      hourlyMinorDirections,
      intersection,
      minFeatureCode,
      segments,
    };
  }
}

export default ReportBaseFlowDirectional;
