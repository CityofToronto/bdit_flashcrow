/* eslint-disable class-methods-use-this */
import { ReportType } from '@/lib/Constants';
import ReportBaseCrash from '@/lib/reports/ReportBaseCrash';

class ReportCollisionDirectory extends ReportBaseCrash {
  type() {
    return ReportType.COLLISION_DIRECTORY;
  }

  transformData(/* location, collisions, filters */) {
    // TODO: implement this
  }

  generateCsv(/* location, filteredCollisions */) {
    // TODO: implement this
  }

  generateLayoutContent(/* location, filteredCollisions */) {
    // TODO: implement this
  }
}

export default ReportCollisionDirectory;
