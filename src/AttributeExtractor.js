'use strict'

/**
 * AttributeExtractor
 *
 * @class
 * AttributeExtractor extracts a list of attributes that are required in the
 * rule evaluation process from a rule schema.
 */
class AttributeExtractor {

  /**
   * Constructor
   * 
   * @param  {Object} schema - Rule schema
   */
  constructor (schema) {
    this.schema = schema
    this.sub = []
    this.obj = []
    this.env = []
    this.parse(schema)
  }

  /**
   * Subject
   *
   * @description
   * List of JSON Pointer strings of required subject attributes
   * for rule evaluation.
   */
  get subject () {
    return this.sub
  }

  /**
   * Object
   *
   * @description
   * List of JSON Pointer strings of required resource attributes
   * for rule evaluation.
   */
  get object () {
    return this.obj
  }

  /**
   * Environment
   *
   * @description
   * List of JSON Pointer strings of required environment attributes
   * for rule evaluation.
   */
  get environment () {
    return this.env
  }

  /**
   * All
   *
   * @description
   * List of JSON Pointer strings of all required attributes
   * for rule evaluation.
   */
  get all () {
    return this.sub.concat(this.obj).concat(this.env)
  }

  /**
   * Parse
   *
   * @description
   * Parses the specified rule schema and extracts the names of the attributes
   * required for rule evaluation in JSON Pointer string format.
   */
  parse () {
    let schema = this.schema
    let attributes = []

    function parser (schema, chain) {
      let {properties} = schema

      if (!properties) return

      Object.keys(properties).forEach(key => {
        let refchain = chain.concat([key])
        let descriptor = properties[key]

        // Contains further nesting
        if (descriptor.properties) {
          parser(descriptor, refchain)
        } else if (descriptor.anyOf) {
          descriptor.anyOf.forEach(item => {
            parser(item, refchain)
          })
        } else if (descriptor.allOf) {
          descriptor.allOf.forEach(item => {
            parser(item, refchain)
          })
        } else if (descriptor.oneOf) {
          descriptor.oneOf.forEach(item => {
            parser(item, refchain)
          })
        } else if (descriptor.not) {
          descriptor.not.forEach(item => {
            parser(item, refchain)
          })
        } else {
          let ref = '/' + refchain.join('/')
          if (attributes.indexOf(ref) > -1) {
            return
          }
          attributes.push(ref)
        }
      })
    }

    parser(schema, [])
    
    attributes.forEach(attribute => {
      if (attribute.includes('subject')) {
        this.sub.push(attribute)
      } else if (attribute.includes('object')) {
        this.obj.push(attribute)
      } else if (attribute.includes('environment')) {
        this.env.push(attribute)
      }
    })
  }
}

/**
 * Exports
 */
module.exports = AttributeExtractor