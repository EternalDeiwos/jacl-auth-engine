const {JSONSchema} = require('json-document')
const AttributeExtractor = require('./AttributeExtractor')

const RuleSchema = new JSONSchema({
  type: 'object',
  required: ['subject', 'object', 'environment'],
  properties: {
    subject: {
      type: 'object',
      default: {}
    },
    object: {
      type: 'object',
      default: {}
    },
    environment: {
      type: 'object',
      default: {}
    }
  }
})

class Rule {
  
  constructor (rule) {
    if (!rule || typeof rule !== 'object') {
      throw new Error('Invalid Rule')
    }
    this.rule = RuleSchema.extend(rule)
    this.attributesList = new AttributeExtractor(rule)
  }

  validate (subject, object, environment) {
    let raw = {}
    if (subject) { raw.subject = subject }
    if (object) { raw.object = object }
    if (environment) { raw.environment = environment }      

    this.rule.initialize(this, raw)
    let result = this.rule.validate(this)
    return result.valid
  }

  get attributes () {
    return this.attributesList
  }

}

module.exports = Rule