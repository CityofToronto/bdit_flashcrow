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
import { ReportType } from '@/lib/Constants';
import { generateCollisionFilters, formatFilters, generateFilterFile } from '@/lib/filters/PrettyCollisionFilters';
import { writableStreamFinish } from '@/lib/io/StreamUtils';

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

/**
 * Job runner for report generation jobs.
 */
class JobRunnerGenerateReports extends JobRunnerBase {
  static async fetchReportStream(report) {
    const options = {
      method: 'GET',
      data: { ...report, singleFile: false },
      responseType: 'stream',
    };
    return reporterClient.fetch('/reports', options);
  }

  async getStoragePaths(reports) {
    const tasks = reports.map(StoragePath.forReport);
    return Promise.all(tasks);
  }

  async saveReport(report, { namespace, key }) {
    const reportExists = await storageStrategy.has(namespace, key);
    if (reportExists) {
      return false;
    }
    const valueStream = await JobRunnerGenerateReports.fetchReportStream(report);
    const writableStream = await storageStrategy.putStream(namespace, key, valueStream);
    await writableStreamFinish(writableStream);
    return true;
  }

  async zipReports(data, storagePaths) {
    const { s1, selectionType } = data;
    const {
      id, type, format, ...rest
    } = data.reports[0];

    let collisionFilters = [];
    let filterFileContent = [];
    if (format.extension === 'csv' && type === ReportType.COLLISION_DIRECTORY) {
      collisionFilters = await generateCollisionFilters(rest);
      if (collisionFilters.length > 1) {
        const filters = formatFilters(collisionFilters);
        filterFileContent = await generateFilterFile(filters, `${s1}/${selectionType.name}`);
      }
    }
    const { namespace, key } = await StoragePath.forReportZip(data, storagePaths);
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

      storagePaths.forEach(({ namespace: namespaceReport, key: keyReport }) => {
        const valueStreamReport = storageStrategy.getStream(namespaceReport, keyReport)
          .on('error', reject);
        archive.append(valueStreamReport, { name: keyReport });
      });
      if (format.extension === 'csv' && collisionFilters.length > 1 && type === ReportType.COLLISION_DIRECTORY) {
        archive.append(filterFileContent.join('\n'), { name: 'COLLISION_DATA_SUMMARY.txt' });
      }
      archive.finalize();

      storageStrategy.putStream(namespace, key, valueStream);
    });
  }

  /**
   * Generates the reports specified in `data`, storing each using the configured
   * `storageStrategy`.  Once all reports have been generated and stored, ZIPs those reports into
   * a single archive, and stores that ZIP as well.
   *
   * Resolves to the `{ namespace, key }` storage parameters for this ZIP archive.
   *
   * @param {Object} data - data provided during job creation
   * @returns {Promise<StoragePathResponse>} storage path of the final ZIP archive
   */
  async runImpl(data) {
    const { reports } = data;
    const storagePaths = await this.getStoragePaths(reports);

    const n = reports.length;
    for (let i = 0; i < n; i++) {
      const report = reports[i];
      const storagePath = storagePaths[i];
      /* eslint-disable-next-line no-await-in-loop */
      const savedNew = await this.saveReport(report, storagePath);

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
    return this.zipReports(data, storagePaths);
  }
}

export default JobRunnerGenerateReports;
