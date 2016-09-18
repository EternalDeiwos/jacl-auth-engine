'use strict'

const {JSONDocument, JSONSchema} = require('json-document')
const AttributeExtractor = require('./AttributeExtractor')

class JACL {
  constructor (schema) {
    class SchemaDocument extends JSONDocument {
      static get schema () {
        return new JSONSchema(schema)
      }
    }
    this.validator = (attributes) => {
      return new SchemaDocument(attributes)
    }
    this.attributes = new AttributeExtractor(schema)
  }

  listAttributes (type) {
    if (type === 'subject') {
      return this.attributes.subject
    } else if (type === 'object') {
      return this.attributes.object
    } else if (type === 'environment') {
      return this.attributes.environment
    } else {
      return this.attributes.all
    }
  }

  valid (sub, obj, env) {
    let validator, result
    try {
      validator = this.validator({
        subject: {} || sub,
        object: {} || obj,
        environment: {} || env
      })
      result = validator.validate()
    } catch (e) {
      return false
    }
    return false || result.valid
  }
}

module.exports = JACL