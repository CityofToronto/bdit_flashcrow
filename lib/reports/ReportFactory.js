import { InvalidReportTypeError } from '@/lib/error/MoveErrors';
import ReportCountSummary24h from '@/lib/reports/ReportCountSummary24h';
import ReportCountSummary24hDetailed from '@/lib/reports/ReportCountSummary24hDetailed';
import ReportCountSummary24hGraphical from '@/lib/reports/ReportCountSummary24hGraphical';
import ReportCountSummaryTurningMovement from '@/lib/reports/ReportCountSummaryTurningMovement';
import ReportCountSummaryTurningMovementDetailed
  from '@/lib/reports/ReportCountSummaryTurningMovementDetailed';
import ReportIntersectionSummary from '@/lib/reports/ReportIntersectionSummary';
import ReportSpeedPercentile from '@/lib/reports/ReportSpeedPercentile';
import ReportWarrantTrafficSignalControl from '@/lib/reports/ReportWarrantTrafficSignalControl';

/**
 * Factory class for report types.
 */
class ReportFactory {
  /**
   * Retrieve the instance of the given type.
   *
   * @param {ReportType} type - type of instance to get
   * @returns {ReportBase} instance of the given type, if such an instance has
   * been registered
   * @throws {InvalidReportTypeError} if no such instance has been registered
   */
  static getInstance(type) {
    if (!this.instances.has(type)) {
      throw new InvalidReportTypeError(type);
    }
    return this.instances.get(type);
  }

  /**
   * Registers the given instance, using `ReportBase#type` to determine what key to
   * register it under.
   *
   * @param {ReportBase} instance - instance of {@link ReportBase} to be registered
   */
  static registerInstance(instance) {
    const type = instance.type();
    this.instances.set(type, instance);
  }
}
/**
 * @type {Map<string, ReportBase>}
 */
ReportFactory.instances = new Map();

ReportFactory.registerInstance(new ReportCountSummary24h());
ReportFactory.registerInstance(new ReportCountSummary24hDetailed());
ReportFactory.registerInstance(new ReportCountSummary24hGraphical());
ReportFactory.registerInstance(new ReportCountSummaryTurningMovement());
ReportFactory.registerInstance(new ReportCountSummaryTurningMovementDetailed());
ReportFactory.registerInstance(new ReportIntersectionSummary());
ReportFactory.registerInstance(new ReportSpeedPercentile());
ReportFactory.registerInstance(new ReportWarrantTrafficSignalControl());

export default ReportFactory;
