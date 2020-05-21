/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType, SortDirection } from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseCrash from '@/lib/reports/ReportBaseCrash';

class ReportCollisionTabulation extends ReportBaseCrash {
  type() {
    return ReportType.COLLISION_TABULATION;
  }

  initDims() {
    this.dimAge = {
      description: 'Age Group',
      entries: new Map([
        [0, { description: 'School Child' }],
        [1, { description: 'Adult' }],
        [2, { description: 'Older Adult' }],
      ]),
      fn: (event, { olderAdult, schoolChild }) => {
        if (olderAdult) {
          return 2;
        }
        if (schoolChild) {
          return 0;
        }
        return 1;
      },
    };

    const drivactEntries = this.getCollisionFactorEntries('drivact');
    this.dimDrivact = {
      description: 'Driver Action',
      entries: drivactEntries,
      fn: (event, { drivact, invtype }) => {
        if (invtype === 1 || invtype === 6 || invtype === 18) {
          return drivact;
        }
        return null;
      },
    };

    const drivcondEntries = this.getCollisionFactorEntries('drivcond');
    this.dimDrivcond = {
      description: 'Driver Condition',
      entries: drivcondEntries,
      fn: (event, { drivcond, invtype }) => {
        if (invtype === 1 || invtype === 6 || invtype === 18) {
          return drivcond;
        }
        return null;
      },
    };

    const impactypeEntries = this.getCollisionFactorEntries('impactype');
    this.dimImpactype = {
      description: 'Initial Impact Type',
      entries: impactypeEntries,
      fn: ({ impactype }) => impactype,
    };

    const initdirEntries = this.getCollisionFactorEntries('initdir');
    this.dimInitdir = {
      description: 'Initial Direction of Driver',
      entries: initdirEntries,
      fn: (event, { initdir, invtype }) => {
        if (invtype === 1 || invtype === 6 || invtype === 18) {
          return initdir;
        }
        return null;
      },
    };

    const injuryEntries = this.getCollisionFactorEntries('injury');
    this.dimInjury = {
      description: 'Severity of Injury',
      entries: injuryEntries,
      fn: (event, { injury }) => injury,
    };

    const invtypeEntries = this.getCollisionFactorEntries('invtype');
    this.dimInvtype = {
      description: 'Category of Person',
      entries: invtypeEntries,
      fn: (event, { invtype }) => invtype,
    };

    const manoeuverEntries = this.getCollisionFactorEntries('manoeuver');
    this.dimManoeuver = {
      description: 'Manoeuver',
      entries: manoeuverEntries,
      fn: (event, { invtype, manoeuver }) => {
        if (invtype === 1 || invtype === 6 || invtype === 18) {
          return manoeuver;
        }
        return null;
      },
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

        const x = dimX.fn(event, person);
        if (x === null) {
          return;
        }
        const valueX = tableY.values.get(x);
        tableY.values.set(x, valueX + 1);
        tableY.total += 1;
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

  getCrossTabulationTableOptions(collisions, dimX, dimY, limit = 10) {
    const { orderX, orderY, table } = this.getCrossTabulation(collisions, dimX, dimY);
    const orderYLimit = orderY.slice(0, limit);
    const nx = orderX.length;

    const orderXTotals = orderX.map(
      x => ArrayStats.sum(
        orderY.map(y => table.get(y).values.get(x)),
      ),
    );
    const orderYTotal = ArrayStats.sum(
      orderY.map(y => table.get(y).total),
    );

    return {
      columnStyles: [
        { c: 0 },
      ],
      header: [
        [
          { value: dimY.description, rowspan: 2, style: { br: true } },
          { value: dimX.description, colspan: nx },
          { value: 'Total', rowspan: 2, style: { bl: true } },
        ],
        orderX.map(x => ({
          value: dimX.entries.get(x).description,
        })),
      ],
      body: [
        ...orderYLimit.map((y, i) => {
          const { description } = dimY.entries.get(y);
          const { total, values } = table.get(y);
          const shade = i % 2 === 1;
          return [
            { value: description, style: { br: true, shade } },
            ...orderX.map(x => ({ value: values.get(x), style: { shade } })),
            { value: total, style: { bl: true, shade } },
          ];
        }),
        [
          { value: 'Total', style: { bold: true, br: true, bt: true } },
          ...orderXTotals.map(value => ({ value, style: { bold: true, bt: true } })),
          { value: orderYTotal, style: { bold: true, bl: true, bt: true } },
        ],
      ],
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
            this.dimAge,
            this.dimInvtype,
          ),
        },
      ],
      [
        {
          type: ReportBlock.TABLE,
          options: this.getCrossTabulationTableOptions(
            collisions,
            this.dimInitdir,
            this.dimManoeuver,
          ),
        },
        {
          type: ReportBlock.TABLE,
          options: this.getCrossTabulationTableOptions(
            collisions,
            this.dimInitdir,
            this.dimImpactype,
          ),
        },
      ],
      [
        {
          type: ReportBlock.TABLE,
          options: this.getCrossTabulationTableOptions(
            collisions,
            this.dimInjury,
            this.dimDrivcond,
          ),
        },
        {
          type: ReportBlock.TABLE,
          options: this.getCrossTabulationTableOptions(
            collisions,
            this.dimInjury,
            this.dimDrivact,
          ),
        },
      ],
    ];
  }
}

export default ReportCollisionTabulation;
