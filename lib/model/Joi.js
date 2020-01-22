import Joi from '@hapi/joi';

import DateTime from '@/lib/time/DateTime';

/* eslint-disable-next-line no-unused-vars */
const EXTENDED_JOI = Joi.extend(joi => ({
  type: 'dateTime',
  messages: {
    'dateTime.coerce': 'needs to be a DateTime or equivalent string',
    'dateTime.invalid': 'needs to represent a valid DateTime',
  },
  coerce(value, helpers) {
    if (value === undefined) {
      return { value };
    }
    let dt = null;
    if (typeof value === 'string') {
      dt = DateTime.fromSQL(value);
    } else if (value instanceof DateTime) {
      dt = value;
    }
    if (dt === null) {
      const error = helpers.error('dateTime.coerce');
      return { errors: [error] };
    }
    if (!dt.isValid) {
      const error = helpers.error('dateTime.invalid');
      return { errors: [error] };
    }
    return { value: dt };
  },
}));

export default EXTENDED_JOI;
