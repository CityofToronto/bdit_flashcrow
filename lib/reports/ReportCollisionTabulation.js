/* eslint-disable class-methods-use-this */
import { ReportType } from '@/lib/Constants';
import ReportBaseCrash from '@/lib/reports/ReportBaseCrash';

class ReportCollisionTabulation extends ReportBaseCrash {
  type() {
    return ReportType.COLLISION_TABULATION;
  }

  transformData(location, rawData) {
    return rawData;
  }

  generateLayoutContent(location, { collisionSummary }) {
    const collisionSummaryBlock = ReportBaseCrash.getCollisionsSummaryBlock(collisionSummary);
    return [
      collisionSummaryBlock,
    ];
  }
}

export default ReportCollisionTabulation;
