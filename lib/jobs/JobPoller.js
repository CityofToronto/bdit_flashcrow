import { getJob } from '@/lib/api/WebApi';
import DateTimeZone from '@/lib/time/DateTimeZone';

const INTERVAL_TICK = 1000;
const INTERVAL_GET_JOB = 3000;

class JobPoller extends EventTarget {
  constructor(job) {
    super();
    this.intervalGetJob = null;
    this.intervalTick = null;
    this.job = job;
    this.progressCurrentPrev = 0;
    this.timeRemaining = null;

    if (!this.jobIsFinished()) {
      this.setIntervals();
    }
  }

  clearIntervals() {
    if (this.intervalGetJob !== null) {
      window.clearInterval(this.intervalGetJob);
      this.intervalGetJob = null;
    }
    if (this.intervalTick !== null) {
      window.clearInterval(this.intervalTick);
      this.intervalTick = null;
    }
  }

  jobIsFinished() {
    const { state } = this.job;
    return state !== 'created' && state !== 'active';
  }

  setIntervals() {
    this.intervalGetJob = window.setInterval(
      this.updateGetJob.bind(this),
      INTERVAL_GET_JOB,
    );
    this.intervalTick = window.setInterval(
      this.updateTick.bind(this),
      INTERVAL_TICK,
    );
  }

  get textStatus() {
    const { progressCurrent, progressTotal, state } = this.job;
    if (state === 'created') {
      return 'Generating reports';
    }
    if (state === 'active') {
      if (progressCurrent === progressTotal) {
        return `Archiving reports (${progressTotal} reports)`;
      }
      if (progressCurrent === 0 || this.textTimeRemaining === null) {
        return `Generating reports (${progressCurrent} of ${progressTotal})`;
      }
      return `Generating reports (${progressCurrent} of ${progressTotal}, ${this.textTimeRemaining})`;
    }
    if (state === 'completed') {
      return `Reports ready (${progressTotal} reports)`;
    }
    if (state === 'failed') {
      return 'Reports failed';
    }
    return null;
  }

  get textTimeRemaining() {
    if (this.timeRemaining === null) {
      return null;
    }

    let s = Math.floor(this.timeRemaining / 1000);
    let m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    m %= 60;
    s %= 60;

    if (h > 1) {
      return 'a while';
    }
    if (h === 1) {
      return `1 hour ${m} minutes`;
    }
    if (m > 1) {
      return `${m} minutes`;
    }
    if (m === 1) {
      return `1 minute ${s} seconds`;
    }
    if (s > 1) {
      return `${s} seconds`;
    }
    if (s === 1) {
      return '1 second';
    }
    return 'now';
  }

  async updateGetJob() {
    const job = await getJob(this.job.jobId);
    this.job = job;

    if (this.jobIsFinished()) {
      this.clearIntervals();
      this.timeRemaining = null;
    } else {
      this.updateTimeRemaining();
    }
    this.dispatchEvent(new Event(JobPoller.EVENT_UPDATE_JOB_STATUS));
  }

  updateTick() {
    if (this.timeRemaining === null) {
      return;
    }
    if (this.timeRemaining <= INTERVAL_TICK) {
      this.timeRemaining = 0;
    } else {
      this.timeRemaining -= INTERVAL_TICK;
    }
    this.dispatchEvent(new Event(JobPoller.EVENT_UPDATE_JOB_STATUS));
  }

  updateTimeRemaining() {
    const { progressCurrent, progressTotal, startedAt } = this.job;
    if (progressCurrent === this.progressCurrentPrev) {
      return;
    }
    if (progressCurrent === progressTotal) {
      this.timeRemaining = null;
      return;
    }

    const now = DateTimeZone.utc();
    let elapsed = now.valueOf() - startedAt.valueOf();
    if (elapsed < INTERVAL_GET_JOB) {
      elapsed = INTERVAL_GET_JOB;
    }
    const f = progressCurrent / progressTotal;
    const timeRemaining = Math.round(elapsed * (1 - f) / f);

    this.timeRemaining = timeRemaining;
    this.progressCurrentPrev = progressCurrent;
  }
}
JobPoller.EVENT_UPDATE_JOB_STATUS = 'updateJobStatus';

export default JobPoller;
