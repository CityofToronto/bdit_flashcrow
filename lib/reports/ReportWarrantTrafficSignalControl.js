import {
  FeatureCode,
  ReportType,
} from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import ReportIntersectionSummary from '@/lib/reports/ReportIntersectionSummary';

/**
 * Full and partial thresholds for compliance, as used in warrant sections 1A, 1B, 2A, and 2B.
 *
 * @typedef {Object} WarrantSectionThresholds
 * @property {number} full - threshold for full compliance
 * @property {number} partial - threshold for partial compliance
 */

/**
 * Subclass of {@link ReportBaseFlow} for Traffic Control Signal warrants.
 *
 * This was the first report type implemented that requires user input.
 *
 * @see https://www.notion.so/bditto/Warrant-for-Installation-of-Traffic-Control-Signal-Report-0cdf7ff9198b40f788f62a2df8736e33
 */
class ReportWarrantTrafficSignalControl extends ReportBaseFlowDirectional {
  /* eslint-disable class-methods-use-this */

  type() {
    return ReportType.WARRANT_TRAFFIC_SIGNAL_CONTROL;
  }

  /**
   * Given the full compliance threshold, returns both full and partial
   * thresholds.
   *
   * @param {number} full - threshold for full compliance
   * @returns {WarrantSectionThresholds} full and partial thresholds for compliance
   */
  static getFullAndPartialThresholds(full) {
    const partial = Math.round(
      ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL * full
      / ReportWarrantTrafficSignalControl.COMPLIANCE_FULL,
    );
    return { full, partial };
  }

  /**
   *
   * @param {FeatureCode} minFeatureCode - minimum feature code, as computed by
   * {@link ReportBaseFlowDirectional}
   * @param {Array<Object>} segments - segments incident to intersection under
   * study, as computed by {@link ReportBaseFlowDirectional}
   * @returns thresholds for warrant sections 1A, 1B, 2A, 2B, and 3C
   */
  static getThresholds(minFeatureCode, segments) {
    /*
     * As per the City of Toronto Road Classification System p.9, all major arterials and
     * expressways are guaranteed to have at least 4 lanes.
     *
     * Minor arterial roads can have more than 2 lanes, but for simplicity we use the
     * feature codes here.  (This also makes intuitive sense, in that the goal of the
     * Road Classification System is to distinguish road types by intended use.)
     */
    const isTwoLane = minFeatureCode >= FeatureCode.MINOR_ARTERIAL;

    /*
     * For purposes of this report, we consider a "T" intersection to be any intersection
     * incident to fewer than 4 road segments.  Everything else is an "X" intersection.
     *
     * Note that, as per Ontario Traffic Manual Book 12 4.2, the actual information needed
     * here is "Intersection Configuration" as the number of approaches to the intersection.
     * This strongly suggests that this road segment counting approach is appropriate here.
     */
    const isXIntersection = segments.length >= 4;

    /*
     * For 1A (total approaches), the threshold depends on whether the road has two
     * lanes or more than two lanes.
     */
    const threshold1AFull = isTwoLane
      ? ReportWarrantTrafficSignalControl.THRESHOLD_1A_TWO_LANE
      : ReportWarrantTrafficSignalControl.THRESHOLD_1A_MORE_LANES;
    const threshold1A = ReportWarrantTrafficSignalControl.getFullAndPartialThresholds(
      threshold1AFull,
    );

    /*
     * For 1B (minor street approaches), the threshold depends on the intersection configuration.
     */
    const threshold1BFull = isXIntersection
      ? ReportWarrantTrafficSignalControl.THRESHOLD_1B_X_INTERSECTION
      : ReportWarrantTrafficSignalControl.THRESHOLD_1B_T_INTERSECTION;
    const threshold1B = ReportWarrantTrafficSignalControl.getFullAndPartialThresholds(
      threshold1BFull,
    );

    /*
     * For 2A (major road approaches), the threshold depends on whether the road has two
     * lanes or more than two lanes.
     */
    const threshold2AFull = isTwoLane
      ? ReportWarrantTrafficSignalControl.THRESHOLD_2A_TWO_LANE
      : ReportWarrantTrafficSignalControl.THRESHOLD_2A_MORE_LANES;
    const threshold2A = ReportWarrantTrafficSignalControl.getFullAndPartialThresholds(
      threshold2AFull,
    );

    /*
     * For 2B (total major crossings), the threshold is independent of road geometry.
     */
    const threshold2BFull = ReportWarrantTrafficSignalControl.THRESHOLD_2B;
    const threshold2B = ReportWarrantTrafficSignalControl.getFullAndPartialThresholds(
      threshold2BFull,
    );

    return {
      threshold1A,
      threshold1B,
      threshold2A,
      threshold2B,
      /*
       * For 3A (preventable collisions), the threshold is independent of road geometry.
       */
      threshold3A: ReportWarrantTrafficSignalControl.THRESHOLD_3A,
    };
  }

  /**
   * Similar to {@link ReportWarrantTrafficSignalControl.getCompliance}, but this method
   * does not cap to partial compliance.
   *
   * This is primarily useful in signal warrant section 3A, which only specifies the full
   * threshold.
   *
   * @param {number} value - value to check compliance for
   * @param {number} full - threshold for full compliance
   * @returns percentage to which the compliance threshold is met, or 100 if it is exceeded
   */
  static getRawCompliance(value, full) {
    if (value >= full) {
      return ReportWarrantTrafficSignalControl.COMPLIANCE_FULL;
    }
    const compliance = ReportWarrantTrafficSignalControl.COMPLIANCE_FULL * value / full;
    return Math.round(compliance);
  }

  /**
   * Returns the compliance level of the given value against the given full and
   * partial compliance thresholds.
   *
   * In signal warrant sections 1A, 1B, 2A, and 2B, there are three possible levels
   * of compliance:
   *
   * - full (100%);
   * - partial (80%);
   * - less than partial (<80%).
   *
   * Any values greater than the full threshold are capped to full compliance (100%).
   *
   * Any values greater than the partial threshold but less than the full threshold are capped
   * to partial compliance (80%).
   *
   * @param {number} value - value to check compliance for
   * @param {WarrantSectionThresholds} threshold - thresholds for compliance
   * @returns compliance level (see above)
   */
  static getCompliance(value, { full, partial }) {
    if (value >= full) {
      return ReportWarrantTrafficSignalControl.COMPLIANCE_FULL;
    }
    if (value >= partial) {
      return ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL;
    }
    const compliance = ReportWarrantTrafficSignalControl.COMPLIANCE_FULL * value / full;
    return Math.round(compliance);
  }

  /**
   * Given hourly compliance values, computes summary statistics / totals for compliance
   * across all hours.
   *
   * @param {Array<Object>} hourlyCompliance - hourly compliance values
   * @returns compliance summary statistics / totals
   */
  static getComplianceTotals(hourlyCompliance) {
    let full = 0;
    let partial = 0;
    let rest = 0;
    let total = 0;
    hourlyCompliance.forEach(({ compliance }) => {
      if (compliance === ReportWarrantTrafficSignalControl.COMPLIANCE_FULL) {
        full += ReportWarrantTrafficSignalControl.COMPLIANCE_FULL;
      } else if (compliance === ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL) {
        partial += ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL;
      } else {
        rest += compliance;
      }
      total += compliance;
    });
    const avg = Math.round(total / hourlyCompliance.length);
    return {
      avg,
      full,
      partial,
      rest,
      total,
    };
  }

  /**
   *
   * @param {Array<Object>} hourlyTotals - hourly intersection summary totals
   * @param {WarrantSectionThresholds} threshold1A - threshold for section 1A
   * @param {WarrantSectionThresholds} threshold1B - threshold for section 1B
   */
  static evaluateMinVolumeWarrant(hourlyTotals, threshold1A, threshold1B) {
    const hourly1A = hourlyTotals.map(({ TOTAL }) => {
      const value = Math.round(TOTAL);
      const compliance = ReportWarrantTrafficSignalControl.getCompliance(value, threshold1A);
      return { value, compliance };
    });
    const compliance1A = ReportWarrantTrafficSignalControl.getComplianceTotals(hourly1A);

    const hourly1B = hourlyTotals.map(({ MINOR_APPROACHES }) => {
      const value = Math.round(MINOR_APPROACHES);
      const compliance = ReportWarrantTrafficSignalControl.getCompliance(value, threshold1B);
      return { value, compliance };
    });
    const compliance1B = ReportWarrantTrafficSignalControl.getComplianceTotals(hourly1B);

    const compliance = Math.min(compliance1A.avg, compliance1B.avg);

    return {
      a: {
        compliance: compliance1A,
        hourly: hourly1A,
        threshold: threshold1A,
      },
      b: {
        compliance: compliance1B,
        hourly: hourly1B,
        threshold: threshold1B,
      },
      compliance,
    };
  }

  /**
   *
   * @param {Array<Object>} hourlyTotals - hourly intersection summary totals
   * @param {WarrantSectionThresholds} threshold2A - threshold for section 2A
   * @param {WarrantSectionThresholds} threshold2B - threshold for section 2B
   */
  static evaluateDelayToCrossWarrant(hourlyTotals, threshold2A, threshold2B) {
    const hourly2A = hourlyTotals.map(({ MAJOR_APPROACHES }) => {
      const value = Math.round(MAJOR_APPROACHES);
      const compliance = ReportWarrantTrafficSignalControl.getCompliance(value, threshold2A);
      return { value, compliance };
    });
    const compliance2A = ReportWarrantTrafficSignalControl.getComplianceTotals(hourly2A);

    const hourly2B = hourlyTotals.map(({ MAJOR_CROSSING_TOTAL }) => {
      const value = Math.round(MAJOR_CROSSING_TOTAL);
      const compliance = ReportWarrantTrafficSignalControl.getCompliance(value, threshold2B);
      return { value, compliance };
    });
    const compliance2B = ReportWarrantTrafficSignalControl.getComplianceTotals(hourly2B);

    const compliance = Math.min(compliance2A.avg, compliance2B.avg);

    return {
      a: {
        compliance: compliance2A,
        hourly: hourly2A,
        threshold: threshold2A,
      },
      b: {
        compliance: compliance2B,
        hourly: hourly2B,
        threshold: threshold2B,
      },
      compliance,
    };
  }

  /**
   *
   * @param {Object} options - traffic signal control warrant options, as provided by the user
   * @param {WarrantSectionThresholds} threshold3A - threshold for section 3A
   * @param {Object} minVolume - evaluated stats for Warrant 1, as computed by
   * {@link ReportWarrantTrafficSignalControl.evaluateMinVolumeWarrant}
   * @param {Object} delayToCross - evaluated stats for Warrant 2, as computed by
   * {@link ReportWarrantTrafficSignalControl.evaluateDelayToCrossWarrant}
   */
  static evaluateCollisionHazardWarrant(options, threshold3A, minVolume, delayToCross) {
    const {
      adequateTrial: compliance3B,
      preventablesByYear: annual3A,
      startYear,
    } = options;

    const total3A = ArrayStats.sum(annual3A);
    const avg3A = total3A / annual3A.length;
    const value3A = {
      total: total3A,
      avg: avg3A,
    };
    const compliance3A = ReportWarrantTrafficSignalControl.getRawCompliance(
      value3A.avg,
      threshold3A,
    );

    const met1 = minVolume.compliance >= ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL;
    const met2 = delayToCross.compliance >= ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL;
    const compliance3C = met1 || met2;

    const compliance = compliance3B && compliance3C ? compliance3A : 0;

    return {
      a: {
        annual: annual3A,
        compliance: compliance3A,
        startYear,
        threshold: threshold3A,
        value: value3A,
      },
      b: compliance3B,
      c: compliance3C,
      compliance,
    };
  }

  /**
   *
   * @param {Object} minVolume - evaluated stats for Warrant 1, as computed by
   * {@link ReportWarrantTrafficSignalControl.evaluateMinVolumeWarrant}
   * @param {Object} delayToCross - evaluated stats for Warrant 2, as computed by
   * {@link ReportWarrantTrafficSignalControl.evaluateDelayToCrossWarrant}
   */
  static evaluateCombinationWarrant(minVolume, delayToCross) {
    /*
     * Note that the combination warrant only passes if sections 1A, 1B, 2A, and 2B are met
     * *for every hour*.
     */
    const met1A = minVolume.a.hourly.every(
      ({ compliance }) => compliance >= ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL,
    );
    const met1B = minVolume.b.hourly.every(
      ({ compliance }) => compliance >= ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL,
    );
    const met2A = delayToCross.a.hourly.every(
      ({ compliance }) => compliance >= ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL,
    );
    const met2B = delayToCross.b.hourly.every(
      ({ compliance }) => compliance >= ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL,
    );
    return met1A && met1B && met2A && met2B;
  }

  /**
   *
   * @see https://www.toronto.ca/wp-content/uploads/2018/01/950a-Road-Classification_Summary-Document.pdf
   * @see https://www.library.mto.gov.on.ca/SydneyPLUS/Sydney/Portal/default.aspx?component=AAAAIY&record=59cabe78-8aaf-4347-95ab-d6c066099015
   */
  transformData({
    countData,
    majorDirections,
    minFeatureCode,
    minorDirections,
    segments,
  }) {
    // TODO: actual user-entered parameters here
    const options = {
      adequateTrial: true,
      collisionsTotal: 25,
      preparedBy: 'Foo Bar',
      preventablesByYear: [3, 5, 10],
      startYear: 2016,
    };

    /*
     * First, we establish thresholds as per warrant criteria.
     */
    const {
      threshold1A,
      threshold1B,
      threshold2A,
      threshold2B,
      threshold3A,
    } = ReportWarrantTrafficSignalControl.getThresholds(minFeatureCode, segments);

    /*
     * Traffic Signal Control warrants depend on hourly values computed as part of the
     * Intersection Summary Report.  As such, we can reuse that logic here!
     */
    const hourlyData = ReportIntersectionSummary.sumHourly(countData);
    const hourlyTotals = hourlyData.map(
      hourData => ReportIntersectionSummary.computeHourlyTotals(
        hourData,
        majorDirections,
        minorDirections,
      ),
    );

    const minVolume = ReportWarrantTrafficSignalControl.evaluateMinVolumeWarrant(
      hourlyTotals,
      threshold1A,
      threshold1B,
    );

    const delayToCross = ReportWarrantTrafficSignalControl.evaluateDelayToCrossWarrant(
      hourlyTotals,
      threshold2A,
      threshold2B,
    );

    const collisionHazard = ReportWarrantTrafficSignalControl.evaluateCollisionHazardWarrant(
      options,
      threshold3A,
      minVolume,
      delayToCross,
    );

    const combination = ReportWarrantTrafficSignalControl.evaluateCombinationWarrant(
      minVolume,
      delayToCross,
    );

    return {
      minVolume,
      delayToCross,
      collisionHazard,
      combination,
    };
  }
}

/**
 * @type {number}
 */
ReportWarrantTrafficSignalControl.COMPLIANCE_FULL = 100;

/**
 * @type {number}
 */
ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL = 80;

/**
 * @type {number}
 */
ReportWarrantTrafficSignalControl.THRESHOLD_1A_TWO_LANE = 720;

/**
 * @type {number}
 */
ReportWarrantTrafficSignalControl.THRESHOLD_1A_MORE_LANES = 900;

/**
 * @type {number}
 */
ReportWarrantTrafficSignalControl.THRESHOLD_1B_X_INTERSECTION = 170;

/**
 * @type {number}
 */
ReportWarrantTrafficSignalControl.THRESHOLD_1B_T_INTERSECTION = 255;

/**
 * @type {number}
 */
ReportWarrantTrafficSignalControl.THRESHOLD_2A_TWO_LANE = 720;

/**
 * @type {number}
 */
ReportWarrantTrafficSignalControl.THRESHOLD_2A_MORE_LANES = 900;

/**
 * @type {number}
 */
ReportWarrantTrafficSignalControl.THRESHOLD_2B = 75;

/**
 * @type {number}
 */
ReportWarrantTrafficSignalControl.THRESHOLD_3A = 5;

export default ReportWarrantTrafficSignalControl;
