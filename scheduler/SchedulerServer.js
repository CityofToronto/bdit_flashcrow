import JobController from '@/lib/controller/JobController';
import JobManager from '@/lib/jobs/JobManager';
import MoveServer from '@/lib/server/MoveServer';

class SchedulerServer extends MoveServer {
  constructor(args) {
    super('scheduler', args);

    this
      .addInitModule(JobManager)
      .addController(JobController)
      .addCleanupModule(JobManager)
      .enableAuth();
  }
}

export default SchedulerServer;
