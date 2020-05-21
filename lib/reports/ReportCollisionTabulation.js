/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType, SortDirection } from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseCrash from '@/lib/reports/ReportBaseCrash';
import TimeFormatters from '@/lib/time/TimeFormatters';

class ReportCollisionTabulation extends ReportBaseCrash {
  type() {
    return ReportType.COLLISION_TABULATION;
  }

  initDims() {
    this.dimAccdateMonth = {
      description: 'Month of Collision',
      entries: new Map(
        TimeFormatters.MONTHS_OF_YEAR.map(
          (month, i) => [i + 1, { description: month }],
        ),
      ),
      fn: ({ accdate }) => accdate.month,
    };

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
    this.dimInjuryEvent = {
      description: 'Severity of Injury',
      entries: injuryEntries,
      fn: ({ involved }) => Math.max(
        ...involved.map(({ injury }) => injury),
      ),
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

  static getEmptyCrossTabulation(dimX, dimY) {
    const table = new Map();
    dimY.entries.forEach((valueY, y) => {
      const values = new Map();
      dimX.entries.forEach((valueX, x) => {
        values.set(x, 0);
      });
      values.set(null, 0);
      table.set(y, { total: 0, values });
    });
    return table;
  }

  static incrCrossTabulation(table, x, y) {
    // TODO: handle null values
    if (y === null) {
      return;
    }
    const tableY = table.get(y);
    tableY.total += 1;

    if (x === null) {
      return;
    }
    const valueX = tableY.values.get(x);
    tableY.values.set(x, valueX + 1);
  }

  static getDimOrders(table, dimX, dimY, options) {
    const {
      sortY = true,
    } = options;
    const orderX = ArrayUtils.sortBy(
      Array.from(dimX.entries.keys()),
      x => x,
    );
    const keyY = sortY ? y => table.get(y).total : y => y;
    const dirY = sortY ? SortDirection.DESC : SortDirection.ASC;
    const orderY = ArrayUtils.sortBy(
      Array.from(dimY.entries.keys()),
      keyY,
      dirY,
    );
    return { orderX, orderY };
  }

  getEventCrossTabulation(collisions, dimX, dimY, options) {
    const table = ReportCollisionTabulation.getEmptyCrossTabulation(dimX, dimY);
    collisions.forEach((event) => {
      const x = dimX.fn(event);
      const y = dimY.fn(event);
      ReportCollisionTabulation.incrCrossTabulation(table, x, y);
    });
    const { orderX, orderY } = ReportCollisionTabulation.getDimOrders(table, dimX, dimY, options);
    return { orderX, orderY, table };
  }

  getInvolvedCrossTabulation(collisions, dimX, dimY, options) {
    const table = ReportCollisionTabulation.getEmptyCrossTabulation(dimX, dimY);
    collisions.forEach(({ involved, ...event }) => {
      involved.forEach((person) => {
        const x = dimX.fn(event, person);
        const y = dimY.fn(event, person);
        ReportCollisionTabulation.incrCrossTabulation(table, x, y);
      });
    });
    const { orderX, orderY } = ReportCollisionTabulation.getDimOrders(table, dimX, dimY, options);
    return { orderX, orderY, table };
  }

  getTableOptions(crossTabulation, dimX, dimY, options) {
    const {
      limit = 10,
    } = options;

    const { orderX, orderY, table } = crossTabulation;
    const orderYLimit = limit === null ? orderY : orderY.slice(0, limit);
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

  getEventTableOptions(collisions, dimX, dimY, options = {}) {
    const crossTabulation = this.getEventCrossTabulation(collisions, dimX, dimY, options);
    return this.getTableOptions(crossTabulation, dimX, dimY, options);
  }

  getInvolvedTableOptions(collisions, dimX, dimY, options = {}) {
    const crossTabulation = this.getInvolvedCrossTabulation(collisions, dimX, dimY, options);
    return this.getTableOptions(crossTabulation, dimX, dimY, options);
  }

  static getDimAccdateEntries(collisions) {
    if (collisions.length === 0) {
      return new Map();
    }
    let yearMin = Infinity;
    let yearMax = -Infinity;
    collisions.forEach(({ accdate }) => {
      const { year } = accdate;
      if (year < yearMin) {
        yearMin = year;
      }
      if (year > yearMax) {
        yearMax = year;
      }
    });
    const years = ArrayUtils.range(yearMin, yearMax + 1);
    return new Map(
      years.map(y => [y, { description: y }]),
    );
  }

  getDayOfWeekBarChartOptions(collisions) {
    const data = [];
    for (let i = 0; i < 7; i++) {
      const tick = TimeFormatters.DAYS_OF_WEEK[i];
      data.push({ tick, value: 0 });
    }
    collisions.forEach(({ accdate }) => {
      const i = accdate.weekday % 7;
      data[i].value += 1;
    });
    return {
      data,
      title: 'Collisions By Day of Week',
    };
  }

  getHourOfDayBarChartOptions(collisions) {
    const data = [];
    for (let i = 0; i < 24; i++) {
      data.push({ tick: i, value: 0 });
    }
    collisions.forEach(({ accdate }) => {
      const i = accdate.hour;
      data[i].value += 1;
    });
    return {
      data,
      title: 'Collisions By Hour of Day',
    };
  }

  static getDimAccdateYear(collisions) {
    const entries = ReportCollisionTabulation.getDimAccdateEntries(collisions);
    return {
      description: 'Year of Collision',
      entries,
      fn: ({ accdate }) => accdate.year,
    };
  }

  generateLayoutContent(location, { collisions, collisionSummary }) {
    const collisionSummaryBlock = ReportBaseCrash.getCollisionsSummaryBlock(collisionSummary);
    const dimAccdateYear = ReportCollisionTabulation.getDimAccdateYear(collisions);
    return [
      collisionSummaryBlock,
      [
        {
          type: ReportBlock.TABLE,
          options: this.getInvolvedTableOptions(
            collisions,
            this.dimInjury,
            this.dimInvtype,
          ),
        },
        {
          type: ReportBlock.TABLE,
          options: this.getInvolvedTableOptions(
            collisions,
            this.dimAge,
            this.dimInvtype,
          ),
        },
      ],
      [
        {
          type: ReportBlock.TABLE,
          options: this.getInvolvedTableOptions(
            collisions,
            this.dimInitdir,
            this.dimManoeuver,
          ),
        },
        {
          type: ReportBlock.TABLE,
          options: this.getInvolvedTableOptions(
            collisions,
            this.dimInitdir,
            this.dimImpactype,
          ),
        },
      ],
      { type: ReportBlock.PAGE_BREAK, options: {} },
      [
        {
          type: ReportBlock.TABLE,
          options: this.getInvolvedTableOptions(
            collisions,
            this.dimInjury,
            this.dimDrivcond,
          ),
        },
        {
          type: ReportBlock.TABLE,
          options: this.getInvolvedTableOptions(
            collisions,
            this.dimInjury,
            this.dimDrivact,
          ),
        },
      ],
      [
        {
          type: ReportBlock.TABLE,
          options: this.getEventTableOptions(
            collisions,
            this.dimInjuryEvent,
            dimAccdateYear,
            { limit: null, sortY: false },
          ),
        },
        {
          type: ReportBlock.TABLE,
          options: this.getEventTableOptions(
            collisions,
            this.dimInjuryEvent,
            this.dimAccdateMonth,
            { limit: 12, sortY: false },
          ),
        },
      ],
      { type: ReportBlock.PAGE_BREAK, options: {} },
      [
        {
          type: ReportBlock.BAR_CHART,
          options: this.getDayOfWeekBarChartOptions(collisions),
        },
        {
          type: ReportBlock.BAR_CHART,
          options: this.getHourOfDayBarChartOptions(collisions),
        },
      ],
    ];
  }
}

export default ReportCollisionTabulation;
