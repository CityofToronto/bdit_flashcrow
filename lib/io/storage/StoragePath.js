import crypto from 'crypto';

import ObjectUtils from '@/lib/ObjectUtils';

/**
 * @typedef {Object} StoragePathResponse
 * @property {string} namespace
 * @property {string} key
 */

/**
 * Used to build `namespace` and `key` identifiers for use with {@link StorageStrategyBase}
 * methods.
 */
class StoragePath {
  // TODO: add MVCR here

  /**
   *
   * @param {Object} report
   * @returns {StoragePathResponse} storage path for given report
   */
  static async forReport(report) {
    let {
      type,
      id,
      format,
      ...options
    } = report;
    type = type.name;
    id = id.replace('/', '_');
    format = format.extension;
    if (ObjectUtils.isEmpty(options)) {
      options = '';
    } else {
      const hashBuilder = crypto.createHash('md5');
      hashBuilder.update(JSON.stringify(options));
      const hash = hashBuilder.digest('hex');
      options = `_${hash}`;
    }

    const key = `${type}_${id}${options}.${format}`;
    return { namespace: StoragePath.NAMESPACE_REPORTS, key };
  }

  /**
   *
   * @param {Array<Object>} reports
   * @returns {StoragePathResponse} storage path for given report ZIP archive
   */
  static async forReportZip(reports) {
    const hashBuilder = crypto.createHash('md5');
    const n = reports.length;
    for (let i = 0; i < n; i++) {
      const report = reports[i];
      /* eslint-disable-next-line no-await-in-loop */
      const { key: reportKey } = await StoragePath.forReport(report);
      hashBuilder.update(reportKey, 'utf8');
    }
    const hash = hashBuilder.digest('hex');
    const key = `${hash}.zip`;
    return { namespace: StoragePath.NAMESPACE_REPORTS, key };
  }
}
/**
 * @type {string}
 */
StoragePath.NAMESPACE_REPORTS = 'reports';

export default StoragePath;
