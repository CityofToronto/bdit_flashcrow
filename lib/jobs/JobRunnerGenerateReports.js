/* eslint-disable class-methods-use-this */
import archiver from 'archiver';
import stream from 'stream';

import AxiosBackendClient from '@/lib/api/AxiosBackendClient';
import httpsAgentLocal from '@/lib/api/httpsAgentLocal';
import config from '@/lib/config/MoveConfig';
import JobRunnerBase from '@/lib/jobs/JobRunnerBase';
import StoragePath from '@/lib/io/storage/StoragePath';
import storageStrategy from '@/lib/io/storage/StorageStrategy';
import { writableStreamFinish } from '../io/StreamUtils';

const reporterClientOptions = {};
if (config.https !== null) {
  reporterClientOptions.httpsAgent = httpsAgentLocal;
}
const reporterClient = new AxiosBackendClient('https://localhost:8200', reporterClientOptions);

class JobRunnerGenerateReports extends JobRunnerBase {
  static async fetchReportStream(report) {
    const options = {
      method: 'GET',
      data: report,
      responseType: 'stream',
    };
    return reporterClient.fetch('/reports', options);
  }

  async saveReport(report) {
    const { namespace, key } = StoragePath.forReport(report);
    const reportExists = await storageStrategy.has(namespace, key);
    if (reportExists) {
      return;
    }
    const valueStream = await JobRunnerGenerateReports.fetchReportStream(report);
    const writableStream = await storageStrategy.putStream(namespace, key, valueStream);
    await writableStreamFinish(writableStream);
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
