/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { ReportBlock, ReportType, SortDirection } from '@/lib/Constants';
import ReportBaseCrash from '@/lib/reports/ReportBaseCrash';
import TimeFormatters from '@/lib/time/TimeFormatters';

class CollisionDimension {
  constructor({
    description,
    entries,
    event,
    fn,
    nullValue = null,
    otherDescriptionFn = values => `${values.length} other values`,
  }) {
    this.description = description;
    this.entries = entries;
    this.event = event;
    this.fn = fn;
    this.nullValue = nullValue;
    if (!this.entries.has(this.nullValue)) {
      this.entries.set(this.nullValue, { description: 'Unknown' });
    }
    this.otherDescriptionFn = otherDescriptionFn;
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
    const { entries, nullValue } = this.dimX;
    const keys = Array.from(entries.keys());
    const keysNoNull = keys.filter(x => x !== nullValue);
    const orderX = ArrayUtils.sortBy(keysNoNull, x => x);
    orderX.push(nullValue);
    return orderX;
  }

  getOrderY({
    hideNull = false,
    hideOther = false,
    limit = 10,
    sortByTotal = true,
    sortDirection = SortDirection.DESC,
  }) {
    const { entries, nullValue } = this.dimY;
    const keys = Array.from(entries.keys());
    const keysNoNull = keys.filter(y => y !== nullValue);
    let sortKey;
    if (sortByTotal) {
      sortKey = y => this.table.get(y).total;
    } else {
      sortKey = y => y;
    }
    const orderY = ArrayUtils.sortBy(keysNoNull, sortKey, sortDirection);
    const n = hideNull ? keysNoNull.length : keys.length;
    if (n <= limit) {
      if (!hideNull) {
        orderY.push(nullValue);
      }
      return orderY;
    }
    const hasNull = this.table.get(nullValue).total > 0;
    if (!hideNull && hasNull) {
      const orderYRest = orderY.slice(limit - 2);
      const orderYLimit = orderY.slice(0, limit - 2);
      orderYLimit.push(nullValue);
      if (!hideOther) {
        orderYLimit.push(orderYRest);
      }
      return orderYLimit;
    }
    const orderYRest = orderY.slice(limit - 1);
    const orderYLimit = orderY.slice(0, limit - 1);
    if (!hideOther) {
      orderYLimit.push(orderYRest);
    }
    return orderYLimit;
  }

  getOrderedTable(orderX, orderY) {
    const nx = orderX.length;
    const ny = orderY.length;
    const orderedTable = orderY.map((y) => {
      const row = new Array(nx + 1).fill(0);
      const ys = Array.isArray(y) ? y : [y];
      ys.forEach((yy) => {
        const { total, values } = this.table.get(yy);
        orderX.forEach((x, j) => {
          row[j] += values.get(x);
        });
        row[nx] += total;
      });
      return row;
    });
    const rowTotals = new Array(nx + 1).fill(0);
    for (let i = 0; i < ny; i++) {
      for (let j = 0; j <= nx; j++) {
        rowTotals[j] += orderedTable[i][j];
      }
    }
    orderedTable.push(rowTotals);
    return orderedTable;
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
      otherDescriptionFn: values => `${values.length} other actions`,
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
      nullValue: 0,
      otherDescriptionFn: values => `${values.length} other conditions`,
    });

    const impactypeEntries = this.getCollisionFactorEntries('impactype');
    this.dimImpactype = new CollisionDimension({
      description: 'Initial Impact Type',
      entries: impactypeEntries,
      event: false,
      fn: ({ impactype }) => impactype,
      otherDescriptionFn: values => `${values.length} other impact types`,
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
      nullValue: 0,
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
      otherDescriptionFn: values => `${values.length} other categories`,
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
      nullValue: 0,
      otherDescriptionFn: values => `${values.length} other manoeuvers`,
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

  getCsvRows(crossTabulation, type, options) {
    const { dimX, dimY } = crossTabulation;
    const orderX = crossTabulation.getOrderX();
    const orderY = crossTabulation.getOrderY(options);
    const orderedTable = crossTabulation.getOrderedTable(orderX, orderY);
    const nx = orderX.length;

    const rows = [];
    orderY.forEach((y, i) => {
      let valueY;
      if (Array.isArray(y)) {
        valueY = dimY.otherDescriptionFn(y);
      } else {
        valueY = dimY.entries.get(y).description;
      }

      orderedTable[i].forEach((value, j) => {
        if (j >= nx) {
          return;
        }

        const x = orderX[j];
        const valueX = dimX.entries.get(x).description;

        const row = {
          dimX: dimX.description,
          x: valueX,
          dimY: dimY.description,
          y: valueY,
          type,
          value,
        };
        rows.push(row);
      });
    });
    return rows;
  }

  getEventCsvRows(collisions, dimX, dimY, options = {}) {
    const crossTabulation = this.getEventCrossTabulation(collisions, dimX, dimY);
    return this.getCsvRows(crossTabulation, 'EVENT', options);
  }

  getInvolvedCsvRows(collisions, dimX, dimY, options = {}) {
    const crossTabulation = this.getInvolvedCrossTabulation(collisions, dimX, dimY);
    return this.getCsvRows(crossTabulation, 'INVOLVED', options);
  }

  getDayOfWeekCsvRows(collisions) {
    const { data } = this.getDayOfWeekBarChartOptions(collisions);
    return data.map(({ value }, i) => ({
      dimX: 'Day of Week',
      x: TimeFormatters.DAYS_OF_WEEK[i],
      dimY: null,
      y: null,
      type: 'EVENT',
      value,
    }));
  }

  getHourOfDayCsvRows(collisions) {
    const { data } = this.getHourOfDayBarChartOptions(collisions);
    return data.map(({ value }, i) => ({
      dimX: 'Hour of Day',
      x: i,
      dimY: null,
      y: null,
      type: 'EVENT',
      value,
    }));
  }

  generateCsv(location, { collisions }) {
    const dimAccdateYear = ReportCollisionTabulation.getDimAccdateYear(collisions);
    const columns = [
      { key: 'dimX', label: 'Dim 1' },
      { key: 'x', label: 'Dim 1 Value' },
      { key: 'dimY', label: 'Dim 2' },
      { key: 'y', label: 'Dim 2 Value' },
      { key: 'type', label: 'Value Type' },
      { key: 'value', label: 'Value' },
    ];
    const rows = [
      ...this.getInvolvedCsvRows(collisions, this.dimInjury, this.dimInvtype),
      ...this.getInvolvedCsvRows(collisions, this.dimAge, this.dimInvtype),
      ...this.getInvolvedCsvRows(collisions, this.dimInitdir, this.dimManoeuver),
      ...this.getInvolvedCsvRows(collisions, this.dimInitdir, this.dimImpactype),
      ...this.getInvolvedCsvRows(collisions, this.dimInjury, this.dimDrivcond),
      ...this.getInvolvedCsvRows(collisions, this.dimInjury, this.dimDrivact),
      ...this.getEventCsvRows(
        collisions,
        this.dimInjuryEvent,
        dimAccdateYear,
        { limit: 11, sortByTotal: false },
      ),
      ...this.getEventCsvRows(
        collisions,
        this.dimInjuryEvent,
        this.dimAccdateMonth,
        {
          hideNull: true,
          hideOther: true,
          limit: 12,
          sortByTotal: false,
          sortDirection: SortDirection.ASC,
        },
      ),
      ...this.getDayOfWeekCsvRows(collisions),
      ...this.getHourOfDayCsvRows(collisions),
    ];
    return { columns, rows };
  }

  getTableOptions(crossTabulation, options) {
    const { dimX, dimY } = crossTabulation;
    const orderX = crossTabulation.getOrderX();
    const orderY = crossTabulation.getOrderY(options);
    const orderedTable = crossTabulation.getOrderedTable(orderX, orderY);
    const nx = orderX.length;
    const ny = orderY.length;

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
        ...orderY.map((y, i) => {
          let description;
          if (Array.isArray(y)) {
            description = dimY.otherDescriptionFn(y);
          } else {
            description = dimY.entries.get(y).description;
          }
          const shade = i % 2 === 1;
          return [
            { value: description, style: { br: true, shade } },
            ...orderedTable[i].map((value, j) => ({
              value,
              style: { bl: j === nx, shade },
            })),
          ];
        }),
        [
          { value: 'Total', style: { bold: true, br: true, bt: true } },
          ...orderedTable[ny].map((value, j) => ({
            value,
            style: { bold: true, bl: j === nx, bt: true },
          })),
        ],
      ],
    };
  }

  getEventTableOptions(collisions, dimX, dimY, options = {}) {
    const crossTabulation = this.getEventCrossTabulation(collisions, dimX, dimY);
    return this.getTableOptions(crossTabulation, options);
  }

  getInvolvedTableOptions(collisions, dimX, dimY, options = {}) {
    const crossTabulation = this.getInvolvedCrossTabulation(collisions, dimX, dimY);
    return this.getTableOptions(crossTabulation, options);
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
      years.map(y => [y, { description: y.toString() }]),
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
      otherDescriptionFn: (values) => {
        const [yearEnd] = values;
        return `${yearEnd} or earlier`;
      },
    });
  }

  generateLayoutContent(parsedId, { collisions, collisionSummary }) {
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
            { limit: 11, sortByTotal: false },
          ),
        },
        {
          type: ReportBlock.TABLE,
          options: this.getEventTableOptions(
            collisions,
            this.dimInjuryEvent,
            this.dimAccdateMonth,
            {
              hideNull: true,
              hideOther: true,
              limit: 12,
              sortByTotal: false,
              sortDirection: SortDirection.ASC,
            },
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
