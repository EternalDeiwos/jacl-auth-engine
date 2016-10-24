'use strict'

/**
 * Module dependencies
 * @ignore
 */
const Rule = require('./Rule')

/**
 * JACL
 *
 * @class
 * JACL is a high level interface for the 'JACL Authorization Engine'. Instances
 * of this class allow multiple rules to be registered and cached before
 * evaluation is required.
 */
class JACL {

  /**
   * Constructor
   *
   * @description
   * Creates a new instance of JACL Auth Engine. Optionally takes a dictionary
   * of rules and registers them. This is to be used for the case of
   * deserializing existing rules from a store.
   * 
   * @param  {Object} [rules=Empty Object] - 
   * Rules dictionary (k,v) => (rule name, rule schema)
   */
  constructor (rules={}) {
    this.rules = {}
    this.attributes = {}
    Object.keys(rules).forEach(key => {
      this.register(key, rules[key])
    })
  }

  /**
   * Register
   *
   * @description
   * Register a new named rule on the authorization engine.
   * 
   * @param  {string} name - Rule name
   * @param  {Object} rule - Rule schema
   */
  register (name, rule) {
    try {
      let r = new Rule(rule)
      this.attributes[name] = r.attributes
      this.rules[name] = r
    } catch (e) {
      console.error(e.stack)
      this.rules[name] = false
    }
  }

  /**
   * Enforce
   *
   * @description
   * Determine if an access request should be granted or denied from the
   * attributes of the subject, resource and environment.
   * 
   * @param  {string} name - Rule name
   * @param  {Object} sub - Subject attributes
   * @param  {Object} obj - Resource attributes
   * @param  {Object} env - Environment attributes
   * @return {boolean} Rule enforcement decision (true/false) => (allow/deny)
   */
  enforce (name, sub, obj, env) {
    if (this.rules[name]) {
      let rule = this.rules[name]
      return rule.validate(sub, obj, env)
    }
    return false // Fail quietly
  }

  /**
   * Attributes List
   *
   * @description
   * Get the list of attributes required for the evaluation of a named rule.
   * 
   * @param  {string} name - Rule name
   * @param  {string} [type='all'] - Attribute type
   * @return {Array} An array of JSON Pointer strings of required attributes
   * needed for evaluation of the named rule.
   */
  attributesList (name, type) {
    if (this.attributes[name]) {
      if (type === 'subject') {
        return this.attributes[name].subject
      } else if (type === 'object') {
        return this.attributes[name].object
      } else if (type === 'environment') {
        return this.attributes[name].environment
      } else {
        return this.attributes[name].all
      }
    }
    return [] // Fail quietly
  }

  /**
   * Rule
   *
   * @description 
   * Get a rule from the cache. Returns an array of rule names if name is not
   * specified
   * 
   * @param  {string} [name] - name of the rule to fetch
   * @return {*}
   */
  rule (name) {
    if (name) {
      return this.rules[name] || null
    } else {
      return Object.keys(this.rules)
    }
  }

}

/**
 * Exports
 */
module.exports = JACL