import Joi from '@hapi/joi';

import { Enum } from '@/lib/ClassUtils';
import { EnumValueError } from '@/lib/error/MoveErrors';
import DateTime from '@/lib/time/DateTime';

/* eslint-disable-next-line no-unused-vars */
const EXTENDED_JOI = Joi.extend({
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
}, {
  type: 'enum',
  messages: {
    'enum.classMismatch': 'Enum value does not match ofType() Enum class',
    'enum.classMissing': 'need to provide ofType() rule with Enum class to convert Strings',
    'enum.invalidClass': '{{#enumClass}} is not a valid Enum class',
    'enum.invalidValue': 'Enum class {{#enumClass}} has no such value',
  },
  coerce(value, helpers) {
    if (value === undefined) {
      return { value };
    }
    if (value instanceof Enum) {
      return { value };
    }
    if (!helpers.schema.$_getRule('ofType')) {
      const error = helpers.error('enum.classMissing');
      return { errors: [error] };
    }
    return { value };
  },
  rules: {
    ofType: {
      method(enumClass) {
        return this.$_addRule({ name: 'ofType', args: { enumClass } });
      },
      args: [
        'enumClass',
      ],
      validate(value, helpers, args) {
        const { enumClass } = args;
        if (!Enum.isEnumClass(enumClass)) {
          return helpers.error('enum.invalidClass', { enumClass });
        }
        if (value instanceof Enum) {
          if (!(value instanceof enumClass)) {
            return helpers.error('enum.invalidValue', { enumClass });
          }
          return value;
        }
        try {
          return enumClass.enumValueOf(value);
        } catch (err) {
          if (err instanceof EnumValueError) {
            return helpers.error('enum.invalidValue', { enumClass });
          }
          throw err;
        }
      },
    },
  },
});

export default EXTENDED_JOI;
