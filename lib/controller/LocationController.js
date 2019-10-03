import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import rp from 'request-promise-native';

import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { CentrelineType } from '@/lib/Constants';

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
    if (!response.result || !response.result.rows) {
      return Boom.notFound('invalid response from geocoder API');
    }
    if (response.result.rows.length === 0) {
      return Boom.notFound(`could not locate key string: ${keyString}`);
    }
    const { INT_GEO_ID: centrelineId } = response.result.rows[0];
    const feature = CentrelineDAO.byIdAndType(centrelineId, CentrelineType.INTERSECTION);
    if (feature === null) {
      return Boom.notFound(`could not locate intersection with ID: ${centrelineId}`);
    }
    return feature;
  },
});

LocationController.push({
  method: 'GET',
  path: '/location/centreline',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        centrelineId: Joi.array().single().items(
          Joi.number().integer().positive().required(),
        ).required(),
        centrelineType: Joi
          .array()
          .single()
          .items(
            Joi.number().valid(
              CentrelineType.SEGMENT,
              CentrelineType.INTERSECTION,
            ),
          )
          .length(Joi.ref('centrelineId.length'))
          .required(),
      },
    },
  },
  handler: async (request) => {
    const {
      centrelineId,
      centrelineType,
    } = request.query;
    const n = centrelineId.length;
    const centrelineIdsAndTypes = new Array(n)
      .fill()
      .map((_, i) => ({
        centrelineId: centrelineId[i],
        centrelineType: centrelineType[i],
      }));
    return CentrelineDAO.byIdsAndTypes(centrelineIdsAndTypes);
  },
});

export default LocationController;
