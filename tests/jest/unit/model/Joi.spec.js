import Joi from '@/lib/model/Joi';
import DateTime from '@/lib/time/DateTime';

test('Joi.dateTime', () => {
  let dt = DateTime.local();
  let result = Joi.dateTime().validate(dt);
  expect(result.error).toBeNull();
  expect(result.value).toEqual(dt);

  result = Joi.dateTime().validate(dt.toSQL());
  expect(result.error).toBeNull();
  expect(result.value).toEqual(dt);

  dt = DateTime.invalid('because i say so');
  result = Joi.dateTime().validate(dt);
  expect(result.error).not.toBeNull();

  dt = 'blarghlflarghl';
  result = Joi.dateTime().validate(dt);
  expect(result.error).not.toBeNull();
});

test('Joi.dateTime [optional / required]', () => {
  let result = Joi.dateTime().validate(undefined);
  expect(result.error).toBeNull();

  result = Joi.dateTime().optional().validate(undefined);
  expect(result.error).toBeNull();

  result = Joi.dateTime().required().validate(undefined);
  expect(result.error).not.toBeNull();
});
