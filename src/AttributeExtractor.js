'use strict'

class AttributeExtractor {
  constructor (schema) {
    this.schema = schema
    this.sub = []
    this.obj = []
    this.env = []
    this.parse(schema)
  }

  get subject () {
    return this.sub
  }

  get object () {
    return this.obj
  }

  get environment () {
    return this.env
  }

  get all () {
    return this.sub.concat(this.obj).concat(this.env)
  }

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

module.exports = AttributeExtractor