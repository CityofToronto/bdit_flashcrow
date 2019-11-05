import Joi from '@hapi/joi';

import DateTime from '@/lib/time/DateTime';

/* eslint-disable-next-line no-unused-vars */
const EXTENDED_JOI = Joi.extend(joi => ({
  name: 'dateTime',
  language: {
    coerce: 'needs to be a DateTime or equivalent string',
    invalid: 'needs to represent a valid DateTime',
  },
  coerce(value, state, options) {
    if (value === undefined) {
      return value;
    }
    const typeOfValue = typeof value;
    let dt = null;
    if (typeOfValue === 'string') {
      dt = DateTime.fromSQL(value);
    } else if (value instanceof DateTime) {
      dt = value;
    }
    if (dt === null) {
      return this.createError('dateTime.coerce', { v: value }, state, options);
    }
    if (!dt.isValid) {
      return this.createError('dateTime.invalid', { v: value }, state, options);
    }
    return dt;
  },
}));

export default EXTENDED_JOI;
