/* eslint-disable class-methods-use-this */
import archiver from 'archiver';
import stream from 'stream';

import JobRunnerBase from '@/lib/jobs/JobRunnerBase';
import StoragePath from '@/lib/io/storage/StoragePath';
import storageStrategy from '@/lib/io/storage/StorageStrategy';

class JobRunnerGenerateReports extends JobRunnerBase {
  static async fetchReport(report) {
    const storagePath = StoragePath.forReport(report);
    return Buffer.from(JSON.stringify(storagePath, null, 2));
  }

  async saveReport(report) {
    const { namespace, key } = StoragePath.forReport(report);
    const reportExists = await storageStrategy.has(namespace, key);
    if (reportExists) {
      return;
    }
    const value = await JobRunnerGenerateReports.fetchReport(report);
    await storageStrategy.put(namespace, key, value);
  }

  async zipReports(reports) {
    const { namespace, key } = StoragePath.forReportZip(reports);
    const reportZipExists = await storageStrategy.has(namespace, key);
    if (reportZipExists) {
      return { namespace, key };
    }

    return new Promise((resolve, reject) => {
      const archive = archiver('zip')
        .on('error', reject);

      const valueStream = stream.PassThrough()
        .on('error', reject)
        .on('end', () => resolve({ namespace, key }));
      archive.pipe(valueStream);

      reports.forEach((report) => {
        const { namespace: namespaceReport, key: keyReport } = StoragePath.forReport(report);
        const valueStreamReport = storageStrategy.getStream(namespaceReport, keyReport)
          .on('error', reject);
        archive.append(valueStreamReport, { name: keyReport });
      });
      archive.finalize();

      storageStrategy.putStream(namespace, key, valueStream);
    });
  }

  async runImpl({ reports }) {
    const n = reports.length;
    for (let i = 0; i < n; i++) {
      const report = reports[i];
      /* eslint-disable-next-line no-await-in-loop */
      await this.saveReport(report);
      /* eslint-disable-next-line no-await-in-loop */
      await this.incrProgressCurrent();
    }
    return this.zipReports(reports);
  }
}

export default JobRunnerGenerateReports;
