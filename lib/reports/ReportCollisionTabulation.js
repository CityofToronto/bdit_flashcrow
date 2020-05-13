/* eslint-disable class-methods-use-this */
import { ReportType } from '@/lib/Constants';
import ReportBaseCrash from '@/lib/reports/ReportBaseCrash';

class ReportCollisionTabulation extends ReportBaseCrash {
  type() {
    return ReportType.COLLISION_TABULATION;
  }

  transformData(/* location, collisions, filters */) {
    // TODO: implement this
  }

  generateLayoutContent(/* location, filteredCollisions */) {
    // TODO: implement this
  }
}

export default ReportCollisionTabulation;
