/* eslint-disable class-methods-use-this */
import JobRunnerBase from '@/lib/jobs/JobRunnerBase';
// import storageStrategy from '@/lib/io/storage/StorageStrategy';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class JobRunnerGenerateReports extends JobRunnerBase {
  async saveReport(report) {
    // TODO: generate report file
    const { type, id, format } = report;
    await delay(Math.floor(100 + 100 * Math.random()));
    console.log('generated report: ', { type, id, format });
  }

  async zipReports() {
    // TODO: actually generate this
    await delay(Math.floor(100 + 100 * Math.random()));
    console.log('generated ZIP');
  }

  async run() {
    const { reports } = this.job.data;
    const n = reports.length;
    for (let i = 0; i < n; i++) {
      const report = reports[i];
      /* eslint-disable-next-line no-await-in-loop */
      await this.saveReport(report);
      /* eslint-disable-next-line no-await-in-loop */
      await this.incrProgressCurrent();
    }
    await this.zipReports();
    return { path: `/reports/zip/${this.job.id}.zip` };
  }
}

export default JobRunnerGenerateReports;
