/* eslint-disable class-methods-use-this */
import {
  ReportBlock,
  ReportType,
} from '@/lib/Constants';
import NumberFormatters from '@/lib/i18n/NumberFormatters';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseFlowDirectional from '@/lib/reports/ReportBaseFlowDirectional';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import ReportIntersectionSummary from '@/lib/reports/ReportIntersectionSummary';
import TimeFormatters from '@/lib/time/TimeFormatters';

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
   * @param {Object} options - extra report-specific options parsed from
   * {@link ReportController#getReport}
   * @returns thresholds for warrant sections 1A, 1B, 2A, 2B
   */
  static getThresholds(options) {
    /*
     * As per the City of Toronto Road Classification System p.9, all major arterials and
     * expressways are guaranteed to have at least 4 lanes.
     *
     * Minor arterial roads can have more than 2 lanes, but for simplicity we use the
     * feature codes here.  (This also makes intuitive sense, in that the goal of the
     * Road Classification System is to distinguish road types by intended use.)
     *
     * For purposes of this report, we consider a "T" intersection to be any intersection
     * incident to fewer than 4 road segments.  Everything else is an "X" intersection.
     *
     * Note that, as per Ontario Traffic Manual Book 12 4.2, the actual information needed
     * here is "Intersection Configuration" as the number of approaches to the intersection.
     * This strongly suggests that this road segment counting approach is appropriate here.
     */
    const { isTwoLane, isXIntersection } = options;

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
      isTwoLane,
      isXIntersection,
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
   */
  static evaluateCollisionHazardWarrant(options, threshold3A) {
    const {
      adequateTrial: compliance3B,
      preventablesByYear: annual3A,
      startDate,
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

    const compliance = compliance3B ? compliance3A : 0;

    return {
      a: {
        annual: annual3A,
        compliance: compliance3A,
        startDate,
        threshold: threshold3A,
        value: value3A,
      },
      b: compliance3B,
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
     * Note that the combination warrant passes if sections 1 and 2 both have 80% or better
     * compliance.  Section-wide compliance is determined by averaging across the study
     * period.
     *
     * Previously, this applied a stricter requirement: sections 1A, 1B, 2A, and 2B all had
     * to meet the 80% threshold in every hour.  Users remarked that they had been using
     * an average-based process, hence the change here.
     */
    const met1 = minVolume.compliance >= ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL;
    const met2 = delayToCross.compliance >= ReportWarrantTrafficSignalControl.COMPLIANCE_PARTIAL;
    return met1 && met2;
  }

  /**
   *
   * @see https://www.toronto.ca/wp-content/uploads/2018/01/950a-Road-Classification_Summary-Document.pdf
   * @see https://www.library.mto.gov.on.ca/SydneyPLUS/Sydney/Portal/default.aspx?component=AAAAIY&record=59cabe78-8aaf-4347-95ab-d6c066099015
   */
  transformData(study, {
    count,
    countData: rawData,
    intersection,
    segments,
  }, options) {
    const {
      hourlyData,
      hourlyMajorDirections,
      hourlyMinorDirections,
    } = ReportBaseFlowDirectional.getDirectionalStats(study, {
      countData: rawData,
      intersection,
      segments,
    });

    /*
     * First, we establish thresholds as per warrant criteria.
     */
    const {
      isTwoLane,
      isXIntersection,
      threshold1A,
      threshold1B,
      threshold2A,
      threshold2B,
      threshold3A,
    } = ReportWarrantTrafficSignalControl.getThresholds(options);

    /*
     * Traffic Control Signal warrants depend on hourly values computed as part of the
     * Intersection Summary Report.  As such, we can reuse that logic here!
     */
    const hourlyTotals = hourlyData.map(
      (hourData, i) => ReportIntersectionSummary.computeHourlyTotals(
        hourData,
        hourlyMajorDirections[i],
        hourlyMinorDirections[i],
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

    const { date, hours } = count;
    const px = ReportCountSummaryTurningMovement.getTrafficSignalId(count);
    return {
      date,
      minVolume,
      delayToCross,
      collisionHazard,
      combination,
      hours,
      isTwoLane,
      isXIntersection,
      px,
    };
  }

  // PDF GENERATION

  static getSummaryTableOptions(reportData) {
    return {
      title: 'Warrant Summary',
      columnStyles: [
        { c: 0 },
        { c: 1, style: { width: '4xl' } },
      ],
      header: [
        [
          { value: 'Warrant', rowspan: 2 },
          { value: 'Description', rowspan: 2 },
          { value: 'Minimum Required', rowspan: 2 },
          { value: 'Compliance', colspan: 2 },
        ],
        [
          { value: 'Section %' },
          { value: 'Entire %' },
        ],
      ],
      body: [
        [
          {
            value: '1 \u2013 Minimum Vehicular Volume',
            header: true,
            rowspan: 2,
            style: { br: true },
          },
          {
            value: `A. Total vehicular volume
            entering intersection from
            all approaches for each of
            any 8 hours`,
            header: true,
          },
          {
            value: reportData.minVolume.a.threshold.full,
          },
          {
            value: reportData.minVolume.a.compliance.avg,
            style: { bl: true },
          },
          {
            value: reportData.minVolume.compliance,
            rowspan: 2,
            style: { bold: true, fontSize: 'l' },
          },
        ],
        [
          {
            value: `B. Total vehicular volume
            entering intersection on
            minor road(s) for each of
            the same 8 hours`,
            header: true,
            style: { shade: true },
          },
          {
            value: reportData.minVolume.b.threshold.full,
            style: { shade: true },
          },
          {
            value: reportData.minVolume.b.compliance.avg,
            style: { bl: true, shade: true },
          },
        ],
        [
          {
            value: '2 \u2013 Delay to Cross Traffic',
            header: true,
            rowspan: 2,
            style: { br: true, bt: true },
          },
          {
            value: `A. Total vehicular volume along
            major street for each of
            any 8 hours`,
            header: true,
            style: { bt: true },
          },
          {
            value: reportData.delayToCross.a.threshold.full,
            style: { bt: true },
          },
          {
            value: reportData.delayToCross.a.compliance.avg,
            style: { bl: true, bt: true },
          },
          {
            value: reportData.delayToCross.compliance,
            rowspan: 2,
            style: { bold: true, bt: true, fontSize: 'l' },
          },
        ],
        [
          {
            value: `B. Combined vehicular pedestrian
            volumes crossing major road
            for each of the same 8 hours
            (critical volume)`,
            header: true,
            style: { shade: true },
          },
          {
            value: reportData.delayToCross.b.threshold.full,
            style: { shade: true },
          },
          {
            value: reportData.delayToCross.b.compliance.avg,
            style: { bl: true, shade: true },
          },
        ],
        [
          {
            value: '3 \u2013 Collision Hazard',
            header: true,
            rowspan: 2,
            style: { br: true, bt: true },
          },
          {
            value: `A. Number of reported
            preventable collisions per
            year averaged over
            preceding 36 months`,
            header: true,
            style: { bt: true },
          },
          {
            value: reportData.collisionHazard.a.threshold,
            style: { bt: true },
          },
          {
            value: reportData.collisionHazard.a.compliance,
            style: { bl: true, bt: true },
          },
          {
            value: reportData.collisionHazard.compliance,
            rowspan: 2,
            style: { bold: true, bt: true, fontSize: 'l' },
          },
        ],
        [
          {
            value: `B. Has adequate trial of
            remedies less restrictive
            than signalization failed to
            reduce frequency of collisions?`,
            header: true,
            style: { shade: true },
          },
          {
            value: reportData.collisionHazard.b,
            style: { fontSize: 'l', shade: true },
          },
          {
            value: reportData.collisionHazard.b ? 100 : 0,
            style: { bl: true, shade: true },
          },
        ],
        [
          {
            value: '4 \u2013 Combination',
            header: true,
            style: { br: true, bt: true },
          },
          {
            value: `Have both of warrants #1, #2
            been 80% satisfied on average over
            the study period?`,
            header: true,
            style: { bt: true, shade: true },
          },
          {
            value: reportData.combination,
            style: { bt: true, fontSize: 'l', shade: true },
          },
          {
            value: null,
            style: { bl: true, bt: true, shade: true },
          },
          {
            value: reportData.combination ? 100 : 0,
            style: { bold: true, bt: true, fontSize: 'l' },
          },
        ],
      ],
    };
  }

  static getSectionTableOptions(title, caption, sectionData) {
    const { COMPLIANCE_FULL, COMPLIANCE_PARTIAL } = ReportWarrantTrafficSignalControl;
    return {
      title,
      caption,
      dontBreakTable: true,
      columnStyles: sectionData.hourly.map((_, i) => ({
        c: i + 1,
      })),
      header: [
        [
          {
            value: null,
            style: { br: true },
          },
          ...sectionData.hourly.map((_, i) => ({
            value: `Hour ${i + 1}`,
          })),
          {
            value: 'Total',
            style: { bl: true },
          },
        ],
      ],
      body: [
        [
          {
            value: 'Value',
            header: true,
            style: { br: true },
          },
          ...sectionData.hourly.map(({ value }) => ({
            value,
          })),
          {
            value: null,
            style: { bl: true },
          },
        ],
        [
          {
            value: `${COMPLIANCE_FULL}% fulfilled (${sectionData.threshold.full})`,
            header: true,
            style: { br: true },
          },
          ...sectionData.hourly.map(({ compliance }) => ({
            value: compliance === COMPLIANCE_FULL ? true : null,
          })),
          {
            value: sectionData.compliance.full,
            style: { bl: true },
          },
        ],
        [
          {
            value: `${COMPLIANCE_PARTIAL}% fulfilled (${sectionData.threshold.partial})`,
            header: true,
            style: { br: true },
          },
          ...sectionData.hourly.map(({ compliance }) => ({
            value: compliance === COMPLIANCE_PARTIAL ? true : null,
          })),
          {
            value: sectionData.compliance.partial,
            style: { bl: true },
          },
        ],
        [
          {
            value: 'Actual % (if <80%)',
            header: true,
            style: { br: true },
          },
          ...sectionData.hourly.map(({ compliance }) => ({
            value: compliance < COMPLIANCE_PARTIAL ? compliance : null,
          })),
          {
            value: sectionData.compliance.rest,
            style: { bl: true },
          },
        ],
      ],
      footer: [
        [
          {
            value: 'Total',
            header: true,
            style: { bb: true, bt: true },
          },
          {
            value: null,
            colspan: sectionData.hourly.length,
            style: { bb: true, bt: true },
          },
          {
            value: sectionData.compliance.total,
            style: { bb: true, bt: true },
          },
        ],
        [
          {
            value: 'Section %',
            header: true,
          },
          {
            value: null,
            colspan: sectionData.hourly.length,
          },
          {
            value: sectionData.compliance.avg,
            style: { bold: true, fontSize: 'l' },
          },
        ],
      ],
    };
  }

  static getPreventableCollisionsTableOptions(sectionData) {
    const { startDate } = sectionData;

    const startDateRanges = new Array(3);
    for (let i = 0; i < 3; i++) {
      const start = startDate.plus({ years: i });
      const end = startDate.plus({ days: -1, years: i + 1 });
      const dateRangeStr = TimeFormatters.formatRangeDate({ start, end });
      startDateRanges[i] = `Year ${i + 1}: ${dateRangeStr}`;
    }

    return {
      title: 'Warrant 3 \u2013 Collision Hazard',
      caption: '3A. Preventable Collisions Per Year',
      header: [
        [
          { value: startDateRanges[0] },
          { value: startDateRanges[1] },
          {
            value: startDateRanges[2],
            style: { br: true },
          },
          { value: 'Total' },
          {
            value: 'Average',
            style: { bl: true },
          },
          { value: 'Minimum Required' },
          {
            value: 'Section %',
            style: { bl: true },
          },
        ],
      ],
      body: [
        [
          { value: sectionData.annual[0] },
          { value: sectionData.annual[1] },
          {
            value: sectionData.annual[2],
            style: { br: true },
          },
          { value: sectionData.value.total },
          {
            value: NumberFormatters.formatDecimal(sectionData.value.avg, 2),
            style: { bl: true },
          },
          { value: sectionData.threshold },
          {
            value: sectionData.compliance,
            style: { bold: true, bl: true, fontSize: 'l' },
          },
        ],
      ],
    };
  }

  static getBooleanTableOptions(title, name, value) {
    return {
      autoWidthTable: true,
      title,
      body: [
        [
          { value: name },
          { value, style: { fontSize: 'm' } },
        ],
      ],
    };
  }

  static getCountMetadataOptions({
    date,
    hours,
    isTwoLane,
    isXIntersection,
    px,
  }) {
    const dateStr = TimeFormatters.formatDefault(date);
    const dayOfWeekStr = TimeFormatters.formatDayOfWeek(date);
    const fullDateStr = `${dateStr} (${dayOfWeekStr})`;
    const hoursStr = hours === null ? null : hours.description;
    const pxStr = px === null ? null : px.toString();
    const intersectionTypeStr = isXIntersection ? 'X (4-way)' : 'T (3-way)';
    const lanesStr = isTwoLane ? '1-2 lanes' : '3+ lanes';
    const entries = [
      { cols: 3, name: 'Date', value: fullDateStr },
      { cols: 3, name: 'Study Hours', value: hoursStr },
      { cols: 6, name: 'Traffic Signal Number', value: pxStr },
      { cols: 3, name: 'Intersection Type', value: intersectionTypeStr },
      { cols: 3, name: 'Road Width', value: lanesStr },
    ];
    return { entries };
  }

  generateLayoutContent(count, reportData) {
    if (reportData === null) {
      return [];
    }

    const { COMPLIANCE_PARTIAL } = ReportWarrantTrafficSignalControl;

    const countMetadataOptions = ReportWarrantTrafficSignalControl.getCountMetadataOptions(
      reportData,
    );
    const summaryTableOptions = ReportWarrantTrafficSignalControl.getSummaryTableOptions(
      reportData,
    );
    const section1ATableOptions = ReportWarrantTrafficSignalControl.getSectionTableOptions(
      'Warrant 1 \u2013 Minimum Vehicular Volume',
      '1A. All Approaches',
      reportData.minVolume.a,
    );
    const section1BTableOptions = ReportWarrantTrafficSignalControl.getSectionTableOptions(
      null,
      '1B. Minor Street Both Approaches',
      reportData.minVolume.b,
    );
    const section2ATableOptions = ReportWarrantTrafficSignalControl.getSectionTableOptions(
      'Warrant 2 \u2013 Delay To Cross Traffic',
      '2A. Major Road Both Approaches',
      reportData.delayToCross.a,
    );
    const section2BTableOptions = ReportWarrantTrafficSignalControl.getSectionTableOptions(
      null,
      '2B. Cross Street (Critical Volume)',
      reportData.delayToCross.b,
    );
    const section3ATableOptions = ReportWarrantTrafficSignalControl
      .getPreventableCollisionsTableOptions(reportData.collisionHazard.a);
    const section3BTableOptions = ReportWarrantTrafficSignalControl.getBooleanTableOptions(
      null,
      '3B. Adequate Trial of Less Restrictive Remedies?',
      reportData.collisionHazard.b,
    );
    const section4TableOptions = ReportWarrantTrafficSignalControl.getBooleanTableOptions(
      'Warrant 4 \u2013 Combination Hazard',
      `4. Both warrant 1 and 2 at least ${COMPLIANCE_PARTIAL}% met for every hour?`,
      reportData.combination,
    );

    return [
      { type: ReportBlock.METADATA, options: countMetadataOptions },
      { type: ReportBlock.TABLE, options: summaryTableOptions },
      { type: ReportBlock.TABLE, options: section1ATableOptions },
      { type: ReportBlock.TABLE, options: section1BTableOptions },
      { type: ReportBlock.TABLE, options: section2ATableOptions },
      { type: ReportBlock.TABLE, options: section2BTableOptions },
      { type: ReportBlock.TABLE, options: section3ATableOptions },
      { type: ReportBlock.TABLE, options: section3BTableOptions },
      { type: ReportBlock.TABLE, options: section4TableOptions },
    ];
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
