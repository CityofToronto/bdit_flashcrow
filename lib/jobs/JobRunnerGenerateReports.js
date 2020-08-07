/* eslint-disable class-methods-use-this */
import JobRunnerBase from '@/lib/jobs/JobRunnerBase';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class JobRunnerGenerateReports extends JobRunnerBase {
  async saveReport(i) {
    // TODO: generate report file
    const { type, id, format } = this.data[i];
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
      /* eslint-disable-next-line no-await-in-loop */
      await this.saveReport();
      /* eslint-disable-next-line no-await-in-loop */
      await this.incrProgressCurrent();
      console.log(this.jobMetadata);
    }
    await this.zipReports();
    await this.updateMetadata({ path: `/reports/zip/${this.job.id}.zip` });
  }
}

export default JobRunnerGenerateReports;
