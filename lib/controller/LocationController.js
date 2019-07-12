const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');
const rp = require('request-promise-native');

const CentrelineDAO = require('../db/CentrelineDAO');

// TODO: DRY with Constants
const CentrelineType = {
  SEGMENT: 1,
  INTERSECTION: 2,
};

const LocationController = [];

LocationController.push({
  method: 'GET',
  path: '/cotgeocoder/suggest',
  options: {
    auth: { mode: 'try' },
  },
  handler: async (request) => {
    const searchString = request.query.q;
    const uri = 'https://map.toronto.ca/cotgeocoder/rest/geocoder/suggest';
    const qs = { searchString, f: 'json' };
    const response = await rp({
      json: true,
      uri,
      qs,
      rejectUnauthorized: false,
    });
    if (response.result && response.result.rows) {
      return response.result.rows;
    }
    return [];
  },
});

LocationController.push({
  method: 'GET',
  path: '/cotgeocoder/findAddressCandidates',
  options: {
    auth: { mode: 'try' },
  },
  handler: async (request) => {
    const { keyString } = request.query;
    const uri = 'https://map.toronto.ca/cotgeocoder/rest/geocoder/findAddressCandidates';
    const qs = { keyString, f: 'json' };
    const response = await rp({
      json: true,
      uri,
      qs,
      rejectUnauthorized: false,
    });
    if (response.result && response.result.rows && response.result.rows.length > 0) {
      const {
        INT_GEO_ID,
        KEY_DESC,
        LATITUDE,
        LONGITUDE,
      } = response.result.rows[0];
      return {
        centrelineId: INT_GEO_ID,
        centrelineType: CentrelineType.INTERSECTION,
        description: KEY_DESC,
        lat: LATITUDE,
        lng: LONGITUDE,
      };
    }
    return Boom.notFound(`could not locate key string: ${keyString}`);
  },
});

LocationController.push({
  method: 'GET',
  path: '/location/centreline',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        centrelineId: Joi.number().integer().positive().required(),
        centrelineType: Joi.number().valid(
          CentrelineType.SEGMENT,
          CentrelineType.INTERSECTION,
        ).required(),
      },
    },
  },
  handler: async (request) => {
    const {
      centrelineId,
      centrelineType,
    } = request.query;
    const location = await CentrelineDAO.byIdAndType(centrelineId, centrelineType);
    if (location === null) {
      return Boom.notFound(`could not locate centreline ID ${centrelineId}`);
    }
    return location;
  },
});

module.exports = LocationController;
