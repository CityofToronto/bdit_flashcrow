import crypto from 'crypto';

const NAMESPACE_REPORTS = 'reports';

class StoragePath {
  // TODO: add MVCR here

  static forReport(report) {
    let { type, id, format } = report;
    type = type.name;
    id = id.replace('/', '_');
    format = format.name;
    const key = `${type}_${id}.${format}`;
    return { namespace: NAMESPACE_REPORTS, key };
  }

  static forReportZip(reports) {
    const hashBuilder = crypto.createHash('md5');
    reports.forEach((report) => {
      const reportPath = StoragePath.forReport(report);
      hashBuilder.update(reportPath, 'utf8');
    });
    const hash = hashBuilder.digest('hex');
    const key = `${hash}.zip`;
    return { namespace: NAMESPACE_REPORTS, key };
  }
}

export default StoragePath;
