import Joi from '@/lib/model/Joi';
import ModelRelation from '@/lib/model/orm/ModelRelation';
import ModelRelationType from '@/lib/model/orm/ModelRelationType';

/**
 * The entry point for our lightweight ORM.
 *
 * Models represent a type of object in database.  A model consists of several
 * fields, represented by {@link ModelField}.  These fields may be either
 * _persisted_, meaning that they are only populated once the object has been
 * created in database, or _transient_ otherwise.
 *
 * Each field may refer either to a `Joi` schema or to another model.  In the
 * latter case, this field represents a _relation_ to that model - this model
 * is expected to contain objects of that model.  Whether it contains one or
 * more objects is determined by the {@link ModelRelationType}.
 *
 * Models expose {@link Model#create}, {@link Model#read}, and {@link Model#update}
 * methods.  These build `Joi` schemas based on the field definitions, which you can
 * then use to validate request / response types in Hapi REST API endpoints.  You can
 * also use them directly via the usual `.validate()` / `.validateAsync()` methods;
 * for instance, {@link StudyRequestDAO} uses this to validate and normalize data
 * coming from database.
 *
 * Note that this ORM only takes care of building `Joi` schemas.  It does not build
 * SQL!  It is meant to be used alongside libraries like `pg-promise` that return
 * rows from database as plain JS objects, which can then be validated using model
 * `Joi` schemas.
 *
 * @param {Array<ModelField>} fields
 */
class Model {
  constructor(fields) {
    this.fields = fields;

    this.create = this.normalizeFields('create');
    this.read = this.normalizeFields('read');
    this.update = this.normalizeFields('update');
  }

  static normalizeSchema(schema, prop, persisted) {
    if (schema instanceof ModelRelation) {
      const { model, relationType, required } = schema;
      if (relationType === ModelRelationType.TO_ONE) {
        if (required) {
          /*
           * Here the object must always be associated with a valid instance of the
           * related model, so we require it.
           */
          return model[prop].required();
        }
        /*
         * Here the field may have the `null` value, which indicates that it is
         * not currently associated.
         */
        return model[prop].allow(null).required();
      }
      if (required) {
        /*
         * Here the object must always be associated with at least one instance of the
         * related model, so we require that the array contain items of that model's type.
         */
        return Joi.array().items(
          model[prop].required(),
        ).required();
      }
      /*
       * Here the object may have an empty array, which indicates that it is
       * not currently associated with any instances of the related model.
       */
      return Joi.array().items(model[prop]).required();
    }
    if (prop === 'read' || !persisted) {
      /*
       * Reading an object from database reads both transient and persisted fields, so
       * both are required.
       *
       * In addition, transient fields are *always* present in objects, regardless of
       * whether you're creating, reading, or updating them.
       */
      return schema.required();
    }
    if (prop === 'create') {
      /*
       * Persisted fields do not exist until the object has been stored in database.
       */
      return null;
    }
    /*
     * During updates, persisted fields are optional.
     */
    return schema.optional();
  }

  normalizeFields(prop) {
    const keys = {};
    this.fields.forEach(({ name, persisted, schema }) => {
      const schemaNormalized = Model.normalizeSchema(schema, prop, persisted);
      if (schemaNormalized !== null) {
        keys[name] = schemaNormalized;
      }
    });
    return Joi.object().keys(keys);
  }
}

export default Model;
