import Joi from 'joi/dist/joi-browser.min';

import { Enum } from '@/lib/ClassUtils';
import { EnumValueError, InvalidCompositeIdError } from '@/lib/error/MoveErrors';
import CompositeId from '@/lib/io/CompositeId';
import DateTime from '@/lib/time/DateTime';
import DateTimeZone from '@/lib/time/DateTimeZone';

function coerceUndefinedOrValid(value, helpers) {
  if (value === undefined) {
    return value;
  }
  const { _valids: valids } = helpers.schema;
  if (valids !== null) {
    const { _values: values } = valids;
    if (values.has(value)) {
      return { value };
    }
  }
  return null;
}

const EXTENDED_JOI = Joi.extend({
  type: 'compositeId',
  messages: {
    'compositeId.invalidValue':
      'could not decode {{#value}} as a composite ID of type {{#prefix}}',
    'compositeId.prefixMissing': 'need to provide ofType() rule with type prefix',
  },
  coerce(value, helpers) {
    const result = coerceUndefinedOrValid(value, helpers);
    if (result !== null) {
      return result;
    }
    if (!helpers.schema.$_getRule('ofType')) {
      const error = helpers.error('compositeId.prefixMissing');
      return { errors: [error] };
    }
    return { value };
  },
  rules: {
    ofType: {
      method(prefix) {
        return this.$_addRule({ name: 'ofType', args: { prefix } });
      },
      args: [
        'prefix',
      ],
      validate(value, helpers, args) {
        const { prefix } = args;
        if (typeof value !== 'string') {
          return helpers.error('compositeId.invalidValue', { prefix, value });
        }
        try {
          CompositeId.decode(value);
          return value;
        } catch (err) {
          if (err instanceof InvalidCompositeIdError) {
            return helpers.error('compositeId.invalidValue', { prefix, value });
          }
          throw err;
        }
      },
    },
  },
}, {
  type: 'dateTime',
  messages: {
    'dateTime.coerce': 'needs to be a DateTime or equivalent string, got {{#value}}',
    'dateTime.invalid': 'needs to represent a valid DateTime',
  },
  coerce(value, helpers) {
    const result = coerceUndefinedOrValid(value, helpers);
    if (result !== null) {
      return result;
    }
    let dt = null;
    if (typeof value === 'string') {
      dt = DateTime.fromSQL(value);
    } else if (value instanceof DateTime) {
      dt = value;
    }
    if (dt === null) {
      const error = helpers.error('dateTime.coerce', { value });
      return { errors: [error] };
    }
    if (!dt.isValid) {
      const error = helpers.error('dateTime.invalid');
      return { errors: [error] };
    }
    return { value: dt };
  },
}, {
  type: 'dateTimeZone',
  messages: {
    'dateTimeZone.coerce': 'needs to be a DateTimeZone or equivalent string, got {{#value}}',
    'dateTimeZone.invalid': 'needs to represent a valid DateTimeZone',
  },
  coerce(value, helpers) {
    const result = coerceUndefinedOrValid(value, helpers);
    if (result !== null) {
      return result;
    }
    let dtz = null;
    if (typeof value === 'string') {
      dtz = DateTimeZone.fromSQL(value);
    } else if (value instanceof DateTimeZone) {
      dtz = value;
    }
    if (dtz === null) {
      const error = helpers.error('dateTimeZone.coerce', { value });
      return { errors: [error] };
    }
    if (!dtz.isValid) {
      const error = helpers.error('dateTimeZone.invalid');
      return { errors: [error] };
    }
    return { value: dtz };
  },
}, {
  type: 'enum',
  messages: {
    'enum.classMismatch': 'Enum value does not match ofType() Enum class',
    'enum.classMissing': 'need to provide ofType() rule with Enum class to convert Strings',
    'enum.invalidClass': '{{#enumClass}} is not a valid Enum class',
    'enum.invalidValue': 'Enum class {{#enumClass}} has no such value {{#value}}',
  },
  coerce(value, helpers) {
    const result = coerceUndefinedOrValid(value, helpers);
    if (result !== null) {
      return result;
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
            return helpers.error('enum.invalidValue', { enumClass, value });
          }
          return value;
        }
        try {
          return enumClass.enumValueOf(value);
        } catch (err) {
          if (err instanceof EnumValueError) {
            return helpers.error('enum.invalidValue', { enumClass, value });
          }
          throw err;
        }
      },
    },
  },
});

export default EXTENDED_JOI;
