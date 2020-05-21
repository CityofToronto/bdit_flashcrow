/* eslint-disable class-methods-use-this */
import { ReportBlock, ReportType } from '@/lib/Constants';
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

    const barChartOptions1 = {
      data: [1, 2, 3, 4, 5],
      labelAxisX: 'to the Right',
      labelAxisY: 'Up and',
      title: 'Chart 1',
    };
    const barChartOptions2 = {
      data: [5, 4, 3, 2, 1],
      labelAxisX: 'to the Right',
      labelAxisY: 'Down and',
      title: 'Chart 1',
    };
    return [
      collisionSummaryBlock,
      [
        { type: ReportBlock.BAR_CHART, options: barChartOptions1 },
        { type: ReportBlock.BAR_CHART, options: barChartOptions2 },
      ],
    ];
  }
}

export default ReportCollisionTabulation;
