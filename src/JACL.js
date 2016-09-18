'use strict'

const Rule = require('./Rule')

class JACL {

  constructor (rules) {
    this.rules = {}
    this.attributes = {}
    Object.keys(rules).forEach(key => {
      this.register(key, rules[key])
    })
  }

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

  enforce (name, sub, obj, env) {
    if (this.rules[name]) {
      let rule = this.rules[name]
      return rule.validate(sub, obj, env)
    }
    return false // Fail quietly
  }

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

}

module.exports = JACL