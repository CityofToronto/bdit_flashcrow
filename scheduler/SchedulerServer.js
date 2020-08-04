import JobController from '@/lib/controller/JobController';
import MoveServer from '@/lib/server/MoveServer';

class SchedulerServer extends MoveServer {
  constructor(args) {
    super('scheduler', args);

    this
      .addController(JobController);
  }
}

export default SchedulerServer;
