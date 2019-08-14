const Joi = require('@hapi/joi');

const SignalDAO = require('../db/SignalDAO');

/*
const SignalType = {
  NORMAL: 1,
  PEDCROSS: 2,
};
*/

const SignalSuggestionController = [];

SignalSuggestionController.push({
  method: 'GET',
  path: '/px/suggest',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        px: Joi.number().integer().min(0).required(),
        /*
        signalType: Joi
          .array()
          .single()
          .items(
            Joi.number().valid(
              SignalType.NORMAL,
              SignalType.PEDCROSS,
            ),
          )
          .length(Joi.ref('px.length'))
          .required(),
          */
      },
    },
  },
  handler: async (request) => {
    const { px } = request.query;
    return SignalDAO.signalsByPX(px, 6);
  },
});

module.exports = SignalSuggestionController;
