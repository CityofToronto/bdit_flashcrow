import crypto from 'crypto';

class StoragePath {
  // TODO: add MVCR here

  static forReport(report) {
    let { type, id, format } = report;
    type = type.name;
    id = id.replace('/', '_');
    format = format.extension;
    const key = `${type}_${id}.${format}`;
    return { namespace: StoragePath.NAMESPACE_REPORTS, key };
  }

  static forReportZip(reports) {
    const hashBuilder = crypto.createHash('md5');
    reports.forEach((report) => {
      const { key: reportKey } = StoragePath.forReport(report);
      hashBuilder.update(reportKey, 'utf8');
    });
    const hash = hashBuilder.digest('hex');
    const key = `${hash}.zip`;
    return { namespace: StoragePath.NAMESPACE_REPORTS, key };
  }
}
StoragePath.NAMESPACE_REPORTS = 'reports';

export default StoragePath;
