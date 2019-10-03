import Joi from '@hapi/joi';

import SignalDAO from '@/lib/db/SignalDAO';

const SignalType = {
  NORMAL: 1,
  PEDCROSS: 2,
};

const SignalSuggestionController = [];

SignalSuggestionController.push({
  method: 'GET',
  path: '/px/suggest',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        px: Joi.number().integer().min(0).required(),
        signalType: Joi.number().valid(
          SignalType.NORMAL,
          SignalType.PEDCROSS,
        ).required(),
      },
    },
  },
  handler: async (request) => {
    const { px, signalType } = request.query;
    return SignalDAO.signalsByPX(px, signalType, 6);
  },
});

export default SignalSuggestionController;
