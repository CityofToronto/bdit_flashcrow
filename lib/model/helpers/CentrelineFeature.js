import { CentrelineType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';

/**
 * Centreline feature, used throughout MOVE to look up centreline locations (usually
 * with the help of {@link CentrelineDAO} or {@link LocationController}).
 *
 * A "feature" is essentially a key to a centreline location.  It consists of two fields:
 * a type (intersection or midblock segment) and an ID.  For intersections, this ID is equal to
 * the value of `gis.centreline_intersection.int_id` for the corresponding location.  For
 * midblocks, it is equal to the value of `gis.centreline.geo_id`.
 *
 * Features can be encoded into a {@link CompositeId}, which is then used to help build URLs
 * (either for frontend routes or REST API calls) that must look up information about one or
 * more locations at once.
 *
 * @typedef {Object} CentrelineFeature
 * @property {number} centrelineId - ID of corresponding location
 * @property {number} centrelineType - type of corresponding location
 */

export default {
  centrelineId: Joi.number().integer().positive().required(),
  centrelineType: Joi.number().valid(
    CentrelineType.SEGMENT,
    CentrelineType.INTERSECTION,
  ).required(),
};
