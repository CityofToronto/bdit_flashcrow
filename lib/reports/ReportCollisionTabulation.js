/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType, SortDirection } from '@/lib/Constants';
import ArrayStats from '@/lib/math/ArrayStats';
import ReportBaseCrash from '@/lib/reports/ReportBaseCrash';
import TimeFormatters from '@/lib/time/TimeFormatters';

class CollisionDimension {
  constructor({
    description,
    entries,
    event,
    fn,
    nullEntry = [null, 'Unknown'],
  }) {
    this.description = description;
    this.entries = entries;
    this.event = event;
    this.fn = fn;
    const [nullValue, nullDescription] = nullEntry;
    this.nullValue = nullValue;
    if (!this.entries.has(this.nullValue)) {
      this.entries.set(this.nullValue, { description: nullDescription });
    }
  }
}

class CrossTabulation {
  constructor(dimX, dimY) {
    this.dimX = dimX;
    this.dimY = dimY;
    this.table = new Map();
    this.total = 0;
    this.dimY.entries.forEach((valueY, y) => {
      const values = new Map();
      this.dimX.entries.forEach((valueX, x) => {
        values.set(x, 0);
      });
      this.table.set(y, { total: 0, values });
    });
  }

  incr(x0, y0) {
    let y = y0;
    if (y === null || !this.table.has(y)) {
      y = this.dimY.nullValue;
    }
    const tableY = this.table.get(y);

    let x = x0;
    if (x === null || !tableY.values.has(x)) {
      x = this.dimX.nullValue;
    }
    const valueX = tableY.values.get(x);
    this.total += 1;
    tableY.total += 1;
    tableY.values.set(x, valueX + 1);
  }

  getOrderX() {
    return ArrayUtils.sortBy(
      Array.from(this.dimX.entries.keys()),
      (x) => {
        if (x === this.dimX.nullValue) {
          // show null value at right
          return Infinity;
        }
        return x;
      },
    );
  }

  getOrderY(sortY) {
    const keyY = sortY ? y => this.table.get(y).total : y => y;
    const dirY = sortY ? SortDirection.DESC : SortDirection.ASC;
    return ArrayUtils.sortBy(
      Array.from(this.dimY.entries.keys()),
      keyY,
      dirY,
    );
  }
}

class EventCrossTabulation extends CrossTabulation {
  constructor(dimX, dimY) {
    super(dimX, dimY);
    if (!dimX.event || !dimY.event) {
      throw new Error('expected event-level dimensions!');
    }
  }

  tabulate(collisions) {
    collisions.forEach((event) => {
      const x = this.dimX.fn(event);
      const y = this.dimY.fn(event);
      this.incr(x, y);
    });
  }
}

class InvolvedCrossTabulation extends CrossTabulation {
  constructor(dimX, dimY) {
    super(dimX, dimY);
    if (dimX.event || dimY.event) {
      throw new Error('expected involved-level dimensions!');
    }
  }

  tabulate(collisions) {
    collisions.forEach(({ involved, ...event }) => {
      involved.forEach((person) => {
        const x = this.dimX.fn(event, person);
        const y = this.dimY.fn(event, person);
        this.incr(x, y);
      });
    });
  }
}

class ReportCollisionTabulation extends ReportBaseCrash {
  constructor() {
    super();
    // TODO: proper initialization system for report modules
    this.initedDims = false;
  }

  type() {
    return ReportType.COLLISION_TABULATION;
  }

  initDims() {
    this.initedDims = true;

    this.dimAccdateMonth = new CollisionDimension({
      description: 'Month of Collision',
      entries: new Map(
        TimeFormatters.MONTHS_OF_YEAR.map(
          (month, i) => [i + 1, { description: month }],
        ),
      ),
      event: true,
      fn: ({ accdate }) => accdate.month,
    });

    this.dimAge = new CollisionDimension({
      description: 'Age Group',
      entries: new Map([
        [0, { description: 'School Child' }],
        [1, { description: 'Adult' }],
        [2, { description: 'Older Adult' }],
      ]),
      event: false,
      fn: (event, { olderAdult, schoolChild }) => {
        if (olderAdult) {
          return 2;
        }
        if (schoolChild) {
          return 0;
        }
        return 1;
      },
    });

    const drivactEntries = this.getCollisionFactorEntries('drivact');
    this.dimDrivact = new CollisionDimension({
      description: 'Driver Action',
      entries: drivactEntries,
      event: false,
      fn: (event, { drivact, invtype }) => {
        if (invtype === 1 || invtype === 6 || invtype === 18) {
          return drivact;
        }
        return null;
      },
    });

    const drivcondEntries = this.getCollisionFactorEntries('drivcond');
    this.dimDrivcond = new CollisionDimension({
      description: 'Driver Condition',
      entries: drivcondEntries,
      event: false,
      fn: (event, { drivcond, invtype }) => {
        if (invtype === 1 || invtype === 6 || invtype === 18) {
          return drivcond;
        }
        return null;
      },
    });

    const impactypeEntries = this.getCollisionFactorEntries('impactype');
    this.dimImpactype = new CollisionDimension({
      description: 'Initial Impact Type',
      entries: impactypeEntries,
      event: false,
      fn: ({ impactype }) => impactype,
    });

    const initdirEntries = this.getCollisionFactorEntries('initdir');
    this.dimInitdir = new CollisionDimension({
      description: 'Initial Direction of Driver',
      entries: initdirEntries,
      event: false,
      fn: (event, { initdir, invtype }) => {
        if (invtype === 1 || invtype === 6 || invtype === 18) {
          return initdir;
        }
        return null;
      },
    });

    const injuryEntries = this.getCollisionFactorEntries('injury');
    this.dimInjury = new CollisionDimension({
      description: 'Severity of Injury',
      entries: injuryEntries,
      event: false,
      fn: (event, { injury }) => injury,
    });
    this.dimInjuryEvent = new CollisionDimension({
      description: 'Severity of Injury',
      entries: injuryEntries,
      event: true,
      fn: ({ involved }) => Math.max(
        ...involved.map(({ injury }) => injury),
      ),
    });

    const invtypeEntries = this.getCollisionFactorEntries('invtype');
    this.dimInvtype = new CollisionDimension({
      description: 'Category of Person',
      entries: invtypeEntries,
      event: false,
      fn: (event, { invtype }) => invtype,
    });

    const manoeuverEntries = this.getCollisionFactorEntries('manoeuver');
    this.dimManoeuver = new CollisionDimension({
      description: 'Manoeuver',
      entries: manoeuverEntries,
      event: false,
      fn: (event, { invtype, manoeuver }) => {
        if (invtype === 1 || invtype === 6 || invtype === 18) {
          return manoeuver;
        }
        return null;
      },
    });
  }

  async fetchRawData(location, filters) {
    const rawData = await super.fetchRawData(location, filters);
    if (!this.initedDims) {
      this.initDims();
    }
    return rawData;
  }

  transformData(location, rawData) {
    return rawData;
  }

  getEventCrossTabulation(collisions, dimX, dimY) {
    const crossTabulation = new EventCrossTabulation(dimX, dimY);
    crossTabulation.tabulate(collisions);
    return crossTabulation;
  }

  getInvolvedCrossTabulation(collisions, dimX, dimY) {
    const crossTabulation = new InvolvedCrossTabulation(dimX, dimY);
    crossTabulation.tabulate(collisions);
    return crossTabulation;
  }

  getTableOptions(crossTabulation, dimX, dimY, options) {
    const {
      limit = 10,
      sortY = true,
    } = options;
    const orderX = crossTabulation.getOrderX();
    const orderY = crossTabulation.getOrderY(sortY);
    const { table } = crossTabulation;
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
    const crossTabulation = this.getEventCrossTabulation(collisions, dimX, dimY);
    return this.getTableOptions(crossTabulation, dimX, dimY, options);
  }

  getInvolvedTableOptions(collisions, dimX, dimY, options = {}) {
    const crossTabulation = this.getInvolvedCrossTabulation(collisions, dimX, dimY);
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
    return new CollisionDimension({
      description: 'Year of Collision',
      entries,
      event: true,
      fn: ({ accdate }) => accdate.year,
    });
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
