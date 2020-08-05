import ReportController from '@/lib/controller/ReportController';
import MovePdfGenerator from '@/lib/reports/format/MovePdfGenerator';
import MoveServer from '@/lib/server/MoveServer';

class ReporterServer extends MoveServer {
  constructor(args) {
    super('reporter', args);

    this
      .addInitModule(MovePdfGenerator)
      .addController(ReportController);
  }
}

export default ReporterServer;
