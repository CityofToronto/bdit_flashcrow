import Boom from '@hapi/boom';

import { CentrelineType } from '@/lib/Constants';
import CountDAO from '@/lib/db/CountDAO';
import CountDataDAO from '@/lib/db/CountDataDAO';
import Joi from '@/lib/model/Joi';

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
        end: Joi.dateTime().optional(),
        maxPerCategory: Joi
          .number()
          .integer()
          .positive()
          .max(100)
          .default(10),
        start: Joi.dateTime().optional(),
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

export default CountController;
