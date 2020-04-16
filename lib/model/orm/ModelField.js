/**
 * @param {string} name - name of field (e.g. name of database column)
 * @param {Joi.Schema|ModelRelation} schema - either a Joi schema for field without
 * `.required()` or `.optional()` modifiers, or a {@link ModelRelation} instance
 * indicating a relation to another model
 */
class ModelField {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.persisted = false;
  }

  /**
   * Mark this column as persisted.
   */
  setPersisted() {
    this.persisted = true;
    return this;
  }

  /**
   * @param {Object<string, Joi.Schema>} objectSchema
   */
  static persisted(objectSchema) {
    return Object.entries(objectSchema).map(
      ([name, schema]) => new ModelField(name, schema).setPersisted(),
    );
  }

  /**
   * @param {Object<string, Joi.Schema|ModelRelation>} objectSchema
   */
  static transient(objectSchema) {
    return Object.entries(objectSchema).map(
      ([name, schema]) => new ModelField(name, schema),
    );
  }
}

export default ModelField;
