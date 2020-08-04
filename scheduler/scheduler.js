import yargs from 'yargs';

import SchedulerServer from '@/scheduler/SchedulerServer';

const args = yargs
  .option('p', {
    alias: 'port',
    demandOption: true,
    describe: 'port to run MOVE Scheduler on',
    type: 'number',
  })
  .argv;

const schedulerServer = new SchedulerServer(args);
schedulerServer.start();
