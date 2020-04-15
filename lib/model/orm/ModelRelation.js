/**
 * @param {Model} model - model to associate via a relation
 * @param {ModelRelationType} relationType - type of relation (either to-one or to-many)
 * @param {boolean} required - whether the relation must have associated object(s)
 */
class ModelRelation {
  constructor(model, relationType, required) {
    this.model = model;
    this.relationType = relationType;
    this.required = required;
  }
}

export default ModelRelation;
