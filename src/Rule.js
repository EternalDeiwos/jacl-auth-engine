'use strict'

/**
 * Module dependencies
 * @ignore
 */
const AttributeExtractor = require('./AttributeExtractor')

/**
 * External Dependencies
 * @ignore
 */
const {JSONSchema} = require('json-document')

/**
 * Metaschema for ABAC Rules
 * 
 * @type {JSONSchema}
 * @ignore
 */
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

/**
 * Rule
 *
 * @class
 * Rule defines a set of functionality for and wraps an individual rule for use
 * in the higher level 'JACL Engine' class.
 */
class Rule {
  
  /**
   * Constructor
   * 
   * @param  {Object} rule - Rule schema
   */
  constructor (rule) {
    if (!rule || typeof rule !== 'object') {
      throw new Error('Invalid Rule')
    }
    this.rule = RuleSchema.extend(rule)
    this.attributesList = new AttributeExtractor(rule)
  }

  /**
   * Validate
   *
   * @description
   * Evaluates the rule against a set of subject, resource and environment
   * attributes.
   * 
   * @param  {Object} subject - Subject attributes
   * @param  {Object} object - Object attributes
   * @param  {Object} environment - Environment attributes
   * @return {boolean} Rule enforcement decision (true/false) => (allow/deny)
   */
  validate (subject, object, environment) {
    let raw = {}
    if (subject) { raw.subject = subject }
    if (object) { raw.object = object }
    if (environment) { raw.environment = environment }      

    this.rule.initialize(this, raw)
    let result = this.rule.validate(this)
    return result.valid
  }

  /**
   * Attributes List
   * 
   * @description
   * List of JSON Pointer strings of required attributes
   * for rule evaluation.
   */
  get attributes () {
    return this.attributesList
  }

}

/**
 * Exports
 */
module.exports = Rule