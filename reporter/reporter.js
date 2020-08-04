import ReporterServer from '@/reporter/ReporterServer';

// TODO: put this in MoveConfig
const PORT_REPORTER = 8082;

const reporterServer = new ReporterServer({ port: PORT_REPORTER });
reporterServer.start();
