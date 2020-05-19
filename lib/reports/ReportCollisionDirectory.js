/* eslint-disable class-methods-use-this */
import { ReportType } from '@/lib/Constants';
import ReportBaseCrash from '@/lib/reports/ReportBaseCrash';

class ReportCollisionDirectory extends ReportBaseCrash {
  type() {
    return ReportType.COLLISION_DIRECTORY;
  }

  transformData(location, rawData) {
    return rawData;
  }

  generateCsv(/* location, { collisions } */) {
    // TODO: implement this
  }

  generateLayoutContent(location, { collisionSummary }) {
    const collisionSummaryBlock = ReportBaseCrash.getCollisionsSummaryBlock(collisionSummary);
    return [
      collisionSummaryBlock,
    ];
  }
}

export default ReportCollisionDirectory;
