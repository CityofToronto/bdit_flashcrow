const Joi = require('@hapi/joi');

const GeoJson = require('./helpers/GeoJson');
const StudyRequestItem = require('./StudyRequestItem');

module.exports = {
  id: Joi.number().integer().positive().optional(),
  createdAt: Joi.date().max('now').optional(),
  serviceRequestId: Joi.string().allow(null).required(),
  priority: Joi.string().valid('STANDARD', 'URGENT').required(),
  dueDate: Joi.date().min('now').required(),
  estimatedDeliveryDate: Joi.date().min('now').required(),
  reasons: Joi.array().items(
    Joi.string().valid(
      // TODO: DRY with Constants.REASONS
      'TSC',
      'PXO',
      'EXPIRED',
      'PED_SAFETY',
      'SIGNAL_TIMING',
    ).required(),
  ).required(),
  ccEmails: Joi.array().items(
    Joi.string().email(),
  ).required(),
  centrelineId: Joi.number().integer().positive().required(),
  // TODO: DRY with Constants.CentrelineType
  centrelineType: Joi.number().valid(1, 2).required(),
  geom: GeoJson.Point,
  items: Joi.array().items(
    Joi.object(StudyRequestItem).required(),
  ).required(),
};
