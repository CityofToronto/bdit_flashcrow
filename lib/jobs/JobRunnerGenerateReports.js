/* eslint-disable class-methods-use-this */
import archiver from 'archiver';
import stream from 'stream';

import { asyncDelay } from '@/lib/FunctionUtils';
import Random from '@/lib/Random';
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
const reporterClient = new AxiosBackendClient(config.reporter, reporterClientOptions);

/*
 * To prevent any one bulk report generation job from overwhelming `reporter`, we force all
 * such jobs to wait between report requests.
 *
 * Furthermore, since regularly spaced delays can lead to load spikes, we impose a random
 * delay each time.  Under heavier load, this should result in more uniform request rates.
 *
 * Finally: if we're ever in a situation where `reporter` cannot handle load, but we also
 * cannot quickly add more `reporter` instances, we can tweak these values and restart
 * `scheduler`.
 */
const DELAY_MIN = 2000;
const DELAY_MAX = 4000;

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
      return false;
    }
    const valueStream = await JobRunnerGenerateReports.fetchReportStream(report);
    const writableStream = await storageStrategy.putStream(namespace, key, valueStream);
    await writableStreamFinish(writableStream);
    return true;
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
      const savedNew = await this.saveReport(report);

      if (savedNew) {
        // Random delay strategy; see `DELAY_MIN` / `DELAY_MAX` above.
        const wait = Random.range(DELAY_MIN, DELAY_MAX);
        /* eslint-disable-next-line no-await-in-loop */
        await asyncDelay(wait);
      }

      /*
       * We increment progress after the random delay so that `JobPoller` is less likely to
       * underestimate remaining time.  (From a user psychology perspective, it's better to
       * overestimate than underestimate here!)
       */
      /* eslint-disable-next-line no-await-in-loop */
      await this.incrProgressCurrent();
    }
    return this.zipReports(reports);
  }
}

export default JobRunnerGenerateReports;
