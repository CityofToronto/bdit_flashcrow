import ArrayUtils from '@/lib/ArrayUtils';
import { SortDirection } from '@/lib/Constants';

/**
 * @typedef {Object} CollisionDimensionOptions
 * @property {string} description - human-readable description of the dimension
 * @property {Map<number, CollisionFactorEntry>} entries - values for the dimension
 * @property {boolean} event - `true` if this is a dimension of collision events, `false`
 * if it's a dimension of persons involved in a collision
 * @property {Function} fn - function that takes a collision event (and, if `!event`, a person
 * involved in that collision), and returns the value of this dimension
 * @property {number?} nullValue - value to be interpreted as the `null` (i.e. missing) value
 * here; useful for events or involved persons with missing field values, as well as for
 * fields that have an explicit numeric value for "unknown"
 * @property {Function} otherDescriptionFn - function that takes an array of "other" values,
 * and returns a human-readable description for that array of values
 *
 */

/**
 * @typedef {Object} CrossTabulationOptions
 * @property {boolean} hideNull - whether to hide the `nullValue`
 * @property {boolean} hideOther - whether to hide other values at end (e.g. for months of year
 * and other dimensions where all values are shown)
 * @property {number} limit - maximum number of entries in `dimY` ordering
 * @property {boolean} sortByTotal - whether to sort `dimY` ordering by `dimY` totals
 * @property {number} sortDirection - either 1 or -1, for ascending or descending order
 */

/**
 * Represents a dimension on which collisions or persons involved in them can be measured.
 * For instance, injury severity and age are measures related to persons involved in
 * collisions, while road surface condition is a measure of the collision event as a whole.
 *
 * These are used in pairs to form cross-tabulations.
 *
 * @param {CollisionDimensionOptions} options - dimension options
 */
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

/**
 * Represents the cross-tabulation of two {@link CollisionDimension} dimensions.
 * A cross-tabulation is essentially a two-dimensional histogram: each of `dimX`,
 * `dimY` has a number of possible values, and each `(x, y)` bucket contains a
 * count of items for which the `dimX` value is `x` and the `dimY` value is `y`.
 *
 * @param {CollisionDimension} dimX - horizontal dimension in table (first row)
 * @param {CollisionDimension} dimY - vertical dimension in table (first column)
 */
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

  /**
   * Increment the `(x0, y0)` bucket by 1.  This also increments the overall
   * total, as well as the corresponding `dimY` total.
   *
   * @param {number?} x0 - value of `dimX`
   * @param {number?} y0 - value of `dimY`
   */
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

  /**
   * @returns {Array<number?>} array of possible `dimX` values, including the `nullValue`
   */
  getOrderX() {
    const { entries, nullValue } = this.dimX;
    const keys = Array.from(entries.keys());
    const keysNoNull = keys.filter(x => x !== nullValue);
    const orderX = ArrayUtils.sortBy(keysNoNull, x => x);
    orderX.push(nullValue);
    return orderX;
  }

  /**
   *
   * @param {CrossTabulationOptions} options - cross tabulation options
   * @returns {Array<number?|Array<number?>>} array of possible `dimY` values; includes
   * `nullValue` if `!options.hideNull`; includes other values if `!options.hideOther`; sorted by
   * `dimY` total if `options.sortByTotal`, with direction depending on `options.sortDirection`
   */
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

  /**
   *
   * @param {Array<number?>} orderX - ordering of `dimX` values
   * @param {Array<number?|Array<number?>>} orderY - ordering of `dimY` values
   * @returns {Array<Array<number>>} tabular counts of buckets, where row `i` and
   * column `j` contains the count for `(orderX[j], orderY[i])`, and with totals
   * appended to each row
   */
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

/**
 * Subclass of {@link CrossTabulation} for cross-tabulations on collision events.
 */
class EventCrossTabulation extends CrossTabulation {
  constructor(dimX, dimY) {
    super(dimX, dimY);
    if (!dimX.event || !dimY.event) {
      throw new Error('expected event-level dimensions!');
    }
  }

  /**
   * Tabulates the given collision events.
   *
   * @param {Array<Object>} collisions - collisions to tabulate
   */
  tabulate(collisions) {
    collisions.forEach((event) => {
      const x = this.dimX.fn(event);
      const y = this.dimY.fn(event);
      this.incr(x, y);
    });
  }
}

/**
 * Subclass of {@link CrossTabulation} for cross-tabulations on persons involved in collisions.
 */
class InvolvedCrossTabulation extends CrossTabulation {
  constructor(dimX, dimY) {
    super(dimX, dimY);
    if (dimX.event || dimY.event) {
      throw new Error('expected involved-level dimensions!');
    }
  }

  /**
   * Tabulates the persons involved in the given collision events.
   *
   * @param {Array<Object>} collisions - collisions to tabulate
   */
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

/**
 * @namespace
 */
const CollisionTabulation = {
  CollisionDimension,
  CrossTabulation,
  EventCrossTabulation,
  InvolvedCrossTabulation,
};

export {
  CollisionTabulation as default,
  CollisionDimension,
  CrossTabulation,
  EventCrossTabulation,
  InvolvedCrossTabulation,
};
