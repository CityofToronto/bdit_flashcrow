import { InvalidReportTypeError } from '@/../lib/error/MoveErrors';
import ReportCountSummary24h from './ReportCountSummary24h';
import ReportCountSummary24hDetailed from './ReportCountSummary24hDetailed';
import ReportCountSummary24hGraphical from './ReportCountSummary24hGraphical';
import ReportCountSummaryTurningMovement from './ReportCountSummaryTurningMovement';
import ReportCountSummaryTurningMovementIllustrated from './ReportCountSummaryTurningMovementIllustrated';
import ReportIntersectionWarrantSummary from './ReportIntersectionWarrantSummary';
import ReportSpeedPercentile from './ReportSpeedPercentile';

/**
 * Factory class for report types.
 */
class ReportFactory {
  /**
   * Retrieve the instance of the given type.
   *
   * @param {string} type - type of instance to get
   * @returns {ReportBase} instance of the given type, if such an instance has
   * been registered
   * @throws {InvalidReportTypeError} if no such instance has been registered
   */
  static getInstance(type) {
    if (!Object.prototype.hasOwnProperty.call(this.instances, type)) {
      throw new InvalidReportTypeError(type);
    }
    return this.instances[type];
  }

  /**
   * Registers the given instance, using its `.type()` method to determine what key
   * to register it under.
   *
   * @param {ReportBase} instance - instance of {@link ReportBase} to be registered
   */
  static registerInstance(instance) {
    const type = instance.type();
    this.instances[type] = instance;
  }
}
/**
 * @type {object<string, ReportBase>}
 */
ReportFactory.instances = {};

ReportFactory.registerInstance(new ReportCountSummary24h());
ReportFactory.registerInstance(new ReportCountSummary24hDetailed());
ReportFactory.registerInstance(new ReportCountSummary24hGraphical());
ReportFactory.registerInstance(new ReportCountSummaryTurningMovement());
ReportFactory.registerInstance(new ReportCountSummaryTurningMovementIllustrated());
ReportFactory.registerInstance(new ReportIntersectionWarrantSummary());
ReportFactory.registerInstance(new ReportSpeedPercentile());

export default ReportFactory;
