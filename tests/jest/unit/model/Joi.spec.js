import { Enum } from '@/lib/ClassUtils';
import Joi from '@/lib/model/Joi';
import DateTime from '@/lib/time/DateTime';

class Color extends Enum {}
const colorValues = ['RED', 'GREEN', 'BLUE'];
Color.init(colorValues);

class CssColor extends Enum {}
const cssColorValues = {
  RED: {
    hex: '#f00',
  },
  GREEN: {
    hex: '#0f0',
  },
  BLUE: {
    hex: '#00f',
  },
};
CssColor.init(cssColorValues);

class NotAnEnum {}

test('Joi.dateTime', () => {
  let dt = DateTime.local();
  let result = Joi.dateTime().validate(dt);
  expect(result.error).toBeUndefined();
  expect(result.value).toEqual(dt);

  result = Joi.dateTime().validate(dt.toSQL());
  expect(result.error).toBeUndefined();
  expect(result.value).toEqual(dt);

  dt = DateTime.invalid('because i say so');
  result = Joi.dateTime().validate(dt);
  expect(result.error).not.toBeUndefined();

  dt = 'blarghlflarghl';
  result = Joi.dateTime().validate(dt);
  expect(result.error).not.toBeUndefined();
});

test('Joi.dateTime [optional / required]', () => {
  let result = Joi.dateTime().validate(undefined);
  expect(result.error).toBeUndefined();

  result = Joi.dateTime().optional().validate(undefined);
  expect(result.error).toBeUndefined();

  result = Joi.dateTime().required().validate(undefined);
  expect(result.error).not.toBeUndefined();
});

test('Joi.enum', () => {
  let result = Joi.enum().validate(Color.RED);
  expect(result.error).toBeUndefined();
  expect(result.value).toEqual(Color.RED);

  result = Joi.enum().ofType(Color).validate(Color.RED);
  expect(result.error).toBeUndefined();
  expect(result.value).toEqual(Color.RED);

  result = Joi.enum().ofType(CssColor).validate(Color.RED);
  expect(result.error).not.toBeUndefined();

  result = Joi.enum().validate('RED');
  expect(result.error).not.toBeUndefined();

  result = Joi.enum().ofType(Color).validate('RED');
  expect(result.error).toBeUndefined();
  expect(result.value).toEqual(Color.RED);

  result = Joi.enum().ofType(CssColor).validate('RED');
  expect(result.error).toBeUndefined();
  expect(result.value).toEqual(CssColor.RED);

  colorValues.forEach((name) => {
    result = Joi.enum().ofType(Color).validate(name);
    expect(result.error).toBeUndefined();
    expect(result.value).toEqual(Color[name]);
  });
  Object.keys(cssColorValues).forEach((name) => {
    result = Joi.enum().ofType(CssColor).validate(name);
    expect(result.error).toBeUndefined();
    expect(result.value).toEqual(CssColor[name]);
  });

  result = Joi.enum().ofType(Color).validate('CHARTREUSE');
  expect(result.error).not.toBeUndefined();

  result = Joi.enum().ofType(Color).validate(new NotAnEnum());
  expect(result.error).not.toBeUndefined();

  result = Joi.enum().ofType(NotAnEnum).validate('WHATEVER');
  expect(result.error).not.toBeUndefined();
});

test('Joi.enum [optional / required]', () => {
  let result = Joi.enum().validate(undefined);
  expect(result.error).toBeUndefined();

  result = Joi.enum().optional().validate(undefined);
  expect(result.error).toBeUndefined();

  result = Joi.enum().required().validate(undefined);
  expect(result.error).not.toBeUndefined();

  result = Joi.enum().ofType(Color).optional().validate(undefined);
  expect(result.error).toBeUndefined();

  result = Joi.enum().ofType(Color).required().validate(undefined);
  expect(result.error).not.toBeUndefined();
});
