'use strict'

/**
 * Test dependencies
 */
const cwd = process.cwd()
const path = require('path')
const chai = require('chai')

/**
 * Assertions
 */
chai.should()
let expect = chai.expect

/**
 * Code under test
 */
const JACL = require('../src/JACL')

/**
 *
 */
describe('JACL', () => {

  let rule = {
    properties: {
      subject: {
        properties: {
          staff: {
            enum: [true]
          },
          department: {
            enum: ['Computer Science', 'Information Systems']
          }
        }
      },
      environment: {
        properties: {
          time: {
            anyOf: [
              {
                properties: { 
                  hours: {
                    minimum: 7,
                    maximum: 17
                  },
                  minutes: {
                    minimum: 30
                  }
                }
              },
              {
                properties: {
                  hours: {
                    maximum: 17,
                    minimum: 8
                  }
                }
              }
            ]
          }
        }
      }
    }
  }

  let invalid_rule = {
    subject: {
      scum: true
    }
  }

  describe('authorization engine', () => {
    let validator, subject, environment, result

    describe('with incorrect attributes', () => {

      beforeEach(() => {
        validator = new JACL(rule)

        subject = {
          staff: false,
          department: 'Computer Science'
        }

        environment = {
          time: {
            hours: 7,
            minutes: 29
          }
        }

        result = validator.valid(subject, null, environment)
      })

      it('should reject the authorization request', () => {
        result.should.be.false
      })
    })

    describe('with correct attributes', () => {

      beforeEach(() => {
        validator = new JACL(rule)

        subject = {
          staff: true,
          department: 'Computer Science'
        }

        environment = {
          time: {
            hours: 7,
            minutes: 31
          }
        }

        result = validator.valid(subject, null, environment)
      })

      it('should allow the authorization request', () => {
        result.should.be.true
      })

    })

    describe('with invalid rule', () => {
      
      beforeEach(() => {
        validator = new JACL(invalid_rule)

        subject = {
          staff: true,
          department: 'Computer Science'
        }

        environment = {
          time: {
            hours: 7,
            minutes: 31
          }
        }

        result = validator.valid(subject, null, environment)
      })

      it('should reject the authorization request', () => {
        result.should.be.false
      })

    })
  })

  describe('attribute list', () => {
    let validator, subject, object, environment, all

    beforeEach(() => {
      validator = new JACL(rule)
      subject = validator.listAttributes('subject')
      object = validator.listAttributes('object')
      environment = validator.listAttributes('environment')
      all = validator.listAttributes()
    })

    it('subject should have two attributes', () => {
      subject.length.should.equal(2)
    })

    it('subject attribute list should have attributes relating to the subject', () => {
      subject.forEach(item => {
        item.startsWith('/subject/').should.be.true
      })
    })

    it('object attribute list should be empty', () => {
      object.length.should.equal(0)
    })

    it('environment should have two attributes', () => {
      environment.length.should.equal(2)
    })

    it('environment attribute list should have attributes relating to the environment', () => {
      environment.forEach(item => {
        item.startsWith('/environment/').should.be.true
      })
    })

    it('should have four attributes in total', () => {
      all.length.should.equal(4)
    })
  })
})
