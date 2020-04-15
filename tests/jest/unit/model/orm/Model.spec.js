import Joi from '@/lib/model/Joi';
import Model from '@/lib/model/orm/Model';
import ModelField from '@/lib/model/orm/ModelField';
import ModelRelation from '@/lib/model/orm/ModelRelation';
import ModelRelationType from '@/lib/model/orm/ModelRelationType';

const Baz = new Model([
  ...ModelField.persisted({
    id: Joi.number().integer().positive(),
  }),
  ...ModelField.transient({
    name: Joi.string(),
  }),
]);

const Bar = new Model([
  ...ModelField.persisted({
    id: Joi.number().integer().positive(),
  }),
  ...ModelField.transient({
    name: Joi.string(),
    bazRequired: new ModelRelation(Baz, ModelRelationType.TO_ONE, true),
    bazOptional: new ModelRelation(Baz, ModelRelationType.TO_ONE, false),
    bazesRequired: new ModelRelation(Baz, ModelRelationType.TO_MANY, true),
    bazesOptional: new ModelRelation(Baz, ModelRelationType.TO_MANY, false),
  }),
]);

const Foo = new Model([
  ...ModelField.persisted({
    id: Joi.number().integer().positive(),
  }),
  ...ModelField.transient({
    name: Joi.string(),
    bar: new ModelRelation(Bar, ModelRelationType.TO_ONE, true),
  }),
]);

test('persisted vs. transient', async () => {
  const baz = {
    name: 'Baz Bastien',
  };
  await expect(Baz.create.validateAsync(baz)).resolves.toEqual(baz);
  await expect(Baz.read.validateAsync(baz)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Baz.update.validateAsync(baz)).resolves.toEqual(baz);

  baz.id = 42;
  await expect(Baz.create.validateAsync(baz)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Baz.read.validateAsync(baz)).resolves.toEqual(baz);
  await expect(Baz.update.validateAsync(baz)).resolves.toEqual(baz);
});

test('relations [single-step]', async () => {
  const bar = {
    name: 'Noma Bar',
    bazRequired: null,
    bazOptional: null,
    bazesRequired: [],
    bazesOptional: [],
  };
  await expect(Bar.create.validateAsync(bar)).rejects.toBeInstanceOf(Joi.ValidationError);

  const baz1 = {
    name: 'Baz Bastien',
  };
  bar.bazRequired = baz1;
  bar.bazesRequired = [baz1];
  await expect(Bar.create.validateAsync(bar)).resolves.toEqual(bar);
  await expect(Bar.read.validateAsync(bar)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Bar.update.validateAsync(bar)).resolves.toEqual(bar);

  bar.id = 42;
  await expect(Bar.create.validateAsync(bar)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Bar.read.validateAsync(bar)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Bar.update.validateAsync(bar)).resolves.toEqual(bar);

  baz1.id = 1729;
  await expect(Bar.create.validateAsync(bar)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Bar.read.validateAsync(bar)).resolves.toEqual(bar);
  await expect(Bar.update.validateAsync(bar)).resolves.toEqual(bar);

  const baz2 = {
    name: 'Baz Moffat',
  };
  bar.bazOptional = baz2;
  bar.bazesOptional = [baz2];
  await expect(Bar.create.validateAsync(bar)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Bar.read.validateAsync(bar)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Bar.update.validateAsync(bar)).resolves.toEqual(bar);

  baz2.id = 73;
  await expect(Bar.create.validateAsync(bar)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Bar.read.validateAsync(bar)).resolves.toEqual(bar);
  await expect(Bar.update.validateAsync(bar)).resolves.toEqual(bar);
});

test('relations [transitive]', async () => {
  const baz1 = {
    name: 'Baz Bastien',
  };

  const baz2 = {
    name: 'Baz Moffat',
  };

  const bar = {
    name: 'Noma Bar',
    bazRequired: baz1,
    bazOptional: baz2,
    bazesRequired: [baz1],
    bazesOptional: [baz2],
  };

  const foo = {
    name: 'Foo Fighters',
    bar: null,
  };
  await expect(Foo.create.validateAsync(foo)).rejects.toBeInstanceOf(Joi.ValidationError);

  foo.bar = bar;
  await expect(Foo.create.validateAsync(foo)).resolves.toEqual(foo);
  await expect(Foo.read.validateAsync(foo)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Foo.update.validateAsync(foo)).resolves.toEqual(foo);

  foo.id = 17;
  await expect(Foo.create.validateAsync(foo)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Foo.read.validateAsync(foo)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Foo.update.validateAsync(foo)).resolves.toEqual(foo);

  bar.id = 42;
  await expect(Foo.create.validateAsync(foo)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Foo.read.validateAsync(foo)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Foo.update.validateAsync(foo)).resolves.toEqual(foo);

  baz1.id = 1729;
  await expect(Foo.create.validateAsync(foo)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Foo.read.validateAsync(foo)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Foo.update.validateAsync(foo)).resolves.toEqual(foo);

  baz2.id = 73;
  await expect(Foo.create.validateAsync(foo)).rejects.toBeInstanceOf(Joi.ValidationError);
  await expect(Foo.read.validateAsync(foo)).resolves.toEqual(foo);
  await expect(Foo.update.validateAsync(foo)).resolves.toEqual(foo);
});
