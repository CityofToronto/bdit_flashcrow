import yargs from 'yargs';

import ReporterServer from '@/reporter/ReporterServer';

const args = yargs
  .option('p', {
    alias: 'port',
    demandOption: true,
    describe: 'port to run MOVE Reporter on',
    type: 'number',
  })
  .argv;

const reporterServer = new ReporterServer(args);
reporterServer.start();
