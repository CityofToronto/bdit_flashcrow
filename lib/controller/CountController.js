const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');

const CountDAO = require('../db/CountDAO');
const CountDataDAO = require('../db/CountDataDAO');

// TODO: DRY with Constants
const CentrelineType = {
  SEGMENT: 1,
  INTERSECTION: 2,
};

const CountController = [];

CountController.push({
  method: 'GET',
  path: '/counts/byBoundingBox',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        xmin: Joi.number().min(-180).max(180).required(),
        ymin: Joi.number().min(-90).max(90).required(),
        xmax: Joi.number().min(-180).max(180).greater(Joi.ref('xmin'))
          .required(),
        ymax: Joi.number().min(-90).max(90).greater(Joi.ref('ymin'))
          .required(),
      },
    },
  },
  handler: async (request) => {
    const {
      xmin,
      ymin,
      xmax,
      ymax,
    } = request.query;
    const counts = await CountDAO.byBoundingBox(xmin, ymin, xmax, ymax);
    // convert to GeoJSON FeatureCollection
    const features = counts.map((count) => {
      const { id } = count;
      const properties = Object.assign({}, count);
      delete properties.geom;
      return {
        type: 'Feature',
        geometry: count.geom,
        properties,
        id,
      };
    });
    return {
      type: 'FeatureCollection',
      features,
    };
  },
});

CountController.push({
  method: 'GET',
  path: '/counts/byCentreline',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        centrelineId: Joi.number().integer().positive().required(),
        centrelineType: Joi.number().valid(
          CentrelineType.SEGMENT,
          CentrelineType.INTERSECTION,
        ).required(),
        end: Joi.date().min(Joi.ref('start')).optional(),
        maxPerCategory: Joi
          .number()
          .integer()
          .positive()
          .max(100)
          .default(10),
        start: Joi.date().min('1-1-1985').optional(),
      },
    },
  },
  handler: async (request) => {
    const {
      centrelineId,
      centrelineType,
      end,
      maxPerCategory,
      start,
    } = request.query;
    let dateRange = null;
    if (start !== undefined && end !== undefined) {
      dateRange = { start, end };
    }
    const [counts, numPerCategory] = await Promise.all([
      CountDAO.byCentreline(
        centrelineId,
        centrelineType,
        dateRange,
        maxPerCategory,
      ),
      CountDAO.byCentrelineNumPerCategory(
        centrelineId,
        centrelineType,
        dateRange,
      ),
    ]);
    return { counts, numPerCategory };
  },
});

// COUNT DATA
CountController.push({
  method: 'GET',
  path: '/counts/data',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        countInfoId: Joi.number().integer().positive().required(),
        categoryId: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const { countInfoId, categoryId } = request.query;
    const count = await CountDAO.byIdAndCategory(countInfoId, categoryId);
    if (count === null) {
      return Boom.notFound(
        `no count found with ID ${countInfoId} and category ${categoryId}`,
      );
    }
    return CountDataDAO.byCount(count);
  },
});

module.exports = CountController;
