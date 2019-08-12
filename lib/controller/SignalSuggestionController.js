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
        px: Joi.array().single().items(
          Joi.number().integer().positive().required(),
        ).required(),
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
    const {
      px,
      // signalType,
    } = request.query;
    const n = px.length;
    /*
    const signalPXAndTypes = new Array(n)
      .fill()
      .map((_, i) => ({
        px: px[i],
        signalType: signalType[i],
      }));
    */
    const signalPXs = new Array(n)
      .fill()
      .map((_, i) => ({
        px: px[i],
      }));
    return SignalDAO.signalsByPX(signalPXs);
  },
});

module.exports = SignalSuggestionController;
