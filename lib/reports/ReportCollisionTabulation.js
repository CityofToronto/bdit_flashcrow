/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType, SortDirection } from '@/lib/Constants';
import ReportBaseCrash from '@/lib/reports/ReportBaseCrash';

class ReportCollisionTabulation extends ReportBaseCrash {
  type() {
    return ReportType.COLLISION_TABULATION;
  }

  initDims() {
    const injuryEntries = this.getCollisionFactorEntries('injury');
    this.dimInjury = {
      description: 'Severity of Injury',
      entries: injuryEntries,
      fn: (event, { injury }) => injury,
      involved: true,
    };

    const invtypeEntries = this.getCollisionFactorEntries('invtype');
    this.dimInvtype = {
      description: 'Category of Person',
      entries: invtypeEntries,
      fn: (event, { invtype }) => invtype,
      involved: true,
    };
  }

  async fetchRawData(location, filters) {
    const rawData = await super.fetchRawData(location, filters);
    this.initDims();
    return rawData;
  }

  transformData(location, rawData) {
    return rawData;
  }

  getCrossTabulation(collisions, dimX, dimY) {
    const table = new Map();
    dimY.entries.forEach((valueY, y) => {
      const values = new Map();
      dimX.entries.forEach((valueX, x) => {
        values.set(x, 0);
      });
      table.set(y, { total: 0, values });
    });
    collisions.forEach(({ involved, ...event }) => {
      involved.forEach((person) => {
        const y = dimY.fn(event, person);
        if (y === null) {
          return;
        }
        const tableY = table.get(y);
        tableY.total += 1;

        const x = dimX.fn(event, person);
        if (x === null) {
          return;
        }
        const valueX = tableY.values.get(x);
        tableY.values.set(x, valueX + 1);
      });
    });
    const orderX = ArrayUtils.sortBy(
      Array.from(dimX.entries.keys()),
      x => x,
    );
    const orderY = ArrayUtils.sortBy(
      Array.from(dimY.entries.keys()),
      y => table.get(y).total,
      SortDirection.DESC,
    );
    return {
      orderX,
      orderY,
      table,
    };
  }

  getCrossTabulationTableOptions(collisions, dimX, dimY) {
    const { orderX, orderY, table } = this.getCrossTabulation(collisions, dimX, dimY);
    return {
      columnStyles: [
        { c: 0 },
      ],
      header: [
        [
          { value: dimY.description, rowspan: 2 },
          { value: dimX.description, colspan: orderX.length },
          { value: 'Total', rowspan: 2 },
        ],
        orderX.map(x => dimX.entries.get(x).description),
      ],
      body: orderY.map((y) => {
        const { description } = dimY.entries.get(y);
        const { total, values } = table.get(y);
        return [
          { value: description },
          ...orderX.map(x => ({ value: values.get(x) })),
          { value: total },
        ];
      }),
    };
  }

  generateLayoutContent(location, { collisions, collisionSummary }) {
    const collisionSummaryBlock = ReportBaseCrash.getCollisionsSummaryBlock(collisionSummary);
    return [
      collisionSummaryBlock,
      [
        {
          type: ReportBlock.TABLE,
          options: this.getCrossTabulationTableOptions(
            collisions,
            this.dimInjury,
            this.dimInvtype,
          ),
        },
        {
          type: ReportBlock.TABLE,
          options: this.getCrossTabulationTableOptions(
            collisions,
            this.dimInjury,
            this.dimInvtype,
          ),
        },
      ],
    ];
  }
}

export default ReportCollisionTabulation;
