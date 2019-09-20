import { InvalidReportTypeError } from '@/../lib/error/MoveErrors';
import ReportGraphical24hCountSummary from './ReportGraphical24hCountSummary';

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

ReportFactory.registerInstance(new ReportGraphical24hCountSummary());

export default ReportFactory;
