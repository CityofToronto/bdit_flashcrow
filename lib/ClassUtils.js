import {
  EnumInstantiationError,
  EnumValueError,
} from '@/lib/error/MoveErrors';

const INITIALIZED = '__initialized';

function pushEnumValue(enumClass, enumValue, name) {
  /* eslint-disable no-param-reassign */
  enumValue.name = name;
  enumValue.ordinal = enumClass.enumValues.length;
  /* eslint-enable no-param-reassign */
  Object.defineProperty(enumClass, name, {
    value: enumValue,
    configurable: false,
    writable: false,
    enumerable: true,
  });
  enumClass.enumValues.push(enumValue);
}

/**
 * Enum superclass.  Inspired by `enumify`, except that we don't use `Symbol`, and we
 * allow for JSON serialization.
 *
 * @see https://github.com/rauschma/enumify
 * @example
 * class MyEnum extends Enum {}
 * MyEnum.init(['FOO', 'BAR']);
 * const myEnumValue = MyEnum.FOO;
 */
class Enum {
  constructor(instanceProperties) {
    if ({}.hasOwnProperty.call(this.constructor, INITIALIZED)) {
      throw new EnumInstantiationError(this.constructor.name);
    }
    Object.getOwnPropertyNames(instanceProperties).forEach((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(instanceProperties, key);
      Object.defineProperty(this, key, descriptor);
    });
  }

  static init(values) {
    Object.defineProperty(this, 'enumValues', {
      value: [],
      configurable: false,
      writable: false,
      enumerable: true,
    });
    if (Array.isArray(values)) {
      values.forEach((key) => {
        pushEnumValue(this, new this({}), key);
      });
    } else {
      Object.entries(values).forEach(([key, value]) => {
        pushEnumValue(this, new this(value), key);
      });
    }
    Object.freeze(this.enumValues);
    this[INITIALIZED] = true;
    return this;
  }

  static enumValueOfSafe(value, key = 'name') {
    const enumValue = this.enumValues.find(x => x[key] === value);
    if (enumValue === undefined) {
      return null;
    }
    return enumValue;
  }

  static enumValueOf(value, key = 'name') {
    const enumValue = this.enumValueOfSafe(value, key);
    if (enumValue === null) {
      throw new EnumValueError(value);
    }
    return enumValue;
  }

  static isEnumClass(enumClass) {
    return enumClass.prototype instanceof Enum;
  }

  toPostgres() {
    return this.name;
  }

  toString() {
    return this.name;
  }

  toJSON() {
    return this.name;
  }
}

/**
 * @namespace
 */
const ClassUtils = { Enum };

export {
  ClassUtils as default,
  Enum,
};
