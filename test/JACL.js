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
    type: 'object',
    required: ['subject', 'environment'],
    properties: {
      subject: {
        type: 'object',
        required: ['staff', 'department'],
        properties: {
          staff: {
            type: 'boolean',
            enum: [true]
          },
          department: {
            type: 'string',
            enum: ['Computer Science', 'Information Systems']
          }
        }
      },
      environment: {
        type: 'object',
        properties: {
          time: {
            type: 'object',
            required: ['hours', 'minutes'],
            anyOf: [
              {
                properties: { 
                  hours: {
                    type: 'number',
                    minimum: 7,
                    maximum: 17
                  },
                  minutes: {
                    type: 'number',
                    minimum: 30
                  }
                }
              },
              {
                properties: {
                  hours: {
                    type: 'number',
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

  let invalid_rule = 'invalid rule'

  let jacl = new JACL({valid: rule, invalid: invalid_rule})

  describe('authorization engine', () => {
    let subject, environment, result

    describe('with incorrect attributes', () => {

      beforeEach(() => {
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

        result = jacl.enforce('valid', subject, null, environment)
      })

      it('should reject the authorization request', () => {
        expect(result).to.be.false
      })
    })

    describe('with correct attributes', () => {

      beforeEach(() => {
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

        result = jacl.enforce('valid', subject, null, environment)
      })

      it('should allow the authorization request', () => {
        expect(result).to.be.true
      })

    })

    describe('with invalid rule', () => {
      
      beforeEach(() => {
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

        result = jacl.enforce('invalid', subject, null, environment)
      })

      it('should reject the authorization request', () => {
        expect(result).to.be.false
      })

    })
  })

  describe('attribute list', () => {
    let subject, object, environment, all

    beforeEach(() => {
      subject = jacl.attributesList('valid', 'subject')
      object = jacl.attributesList('valid', 'object')
      environment = jacl.attributesList('valid', 'environment')
      all = jacl.attributesList('valid')
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
