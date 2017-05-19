import vm from 'vm'
import test from 'ava'
import {createInstrumenter} from 'istanbul-lib-instrument'
import proxyquire from 'proxyquire'
import {support, bitFlags, hasFullSupport} from '.'

const FULL_SET = 32767
const LESSER_SET = 26255

// See <http://node.green/#ES2015-built-in-extensions-function--name--property>.
const expectations = {
  'v4.8.3': {
    support: {
      functionStatements: true,
      functionExpressions: true,
      newFunction: false,
      boundFunctions: true,
      functionVariables: false,
      functionObjectMethods: false,
      accessorProperties: false,
      shorthandMethods: true,
      symbolKeyedMethods: false,
      classStatements: true,
      classExpressions: true,
      classVariables: false,
      classObjectMethods: false,
      classPrototypeMethods: true,
      classStaticMethods: true
    },
    bitFlags: 26251,
    hasFullSupport: false
  },
  'v6.4.0': {
    support: {
      functionStatements: true,
      functionExpressions: true,
      newFunction: true,
      boundFunctions: true,
      functionVariables: false,
      functionObjectMethods: false,
      accessorProperties: false,
      shorthandMethods: true,
      symbolKeyedMethods: false,
      classStatements: true,
      classExpressions: true,
      classVariables: false,
      classObjectMethods: false,
      classPrototypeMethods: true,
      classStaticMethods: true
    },
    bitFlags: 26255,
    hasFullSupport: false
  }
}[process.version] || {
  support: {
    functionStatements: true,
    functionExpressions: true,
    newFunction: true,
    boundFunctions: true,
    functionVariables: true,
    functionObjectMethods: true,
    accessorProperties: true,
    shorthandMethods: true,
    symbolKeyedMethods: true,
    classStatements: true,
    classExpressions: true,
    classVariables: true,
    classObjectMethods: true,
    classPrototypeMethods: true,
    classStaticMethods: true
  },
  bitFlags: FULL_SET,
  hasFullSupport: true
}

test('detects the expected support', t => {
  t.deepEqual(support, expectations.support)
  t.is(bitFlags, expectations.bitFlags)
  t.is(hasFullSupport, expectations.hasFullSupport)
})

test('freezes the support object', t => {
  t.true(Object.isFrozen(support))
})

test('isSubsetOf()', t => {
  // Fake the support detection with one failure.
  let first = true
  const {isSubsetOf} = proxyquire('.', {
    vm: {
      runInContext (code, context) {
        if (first) {
          first = false
          return vm.runInContext('false', context)
        }

        return vm.runInContext('true', context)
      }
    }
  })

  t.true(isSubsetOf(FULL_SET))
  t.false(isSubsetOf(LESSER_SET))
})

test('isSupersetOf()', t => {
  // Fake-detect all.
  const {isSupersetOf} = proxyquire('.', {
    vm: {
      runInContext (code, context) {
        return vm.runInContext('true', context)
      }
    }
  })

  t.true(isSupersetOf(LESSER_SET))
  const evenFullerSet = (FULL_SET << 1) + 1
  t.false(isSupersetOf(evenFullerSet))
})

test('false if error', t => {
  const {support: actual} = proxyquire('./index', {
    vm: {
      runInContext (code, context) {
        throw new Error()
      }
    }
  })
  t.false(actual.functionStatements)
})

// Regression test for Istanbul itself
{
  const regression = expectations.support.classVariables
    ? test.failing
    : test
  regression('istanbul instrumentation does not affect name detection', t => {
    const instrumenter = createInstrumenter()

    const {support: actual} = proxyquire('./index', {
      vm: {
        runInContext (code, context) {
          return vm.runInContext(instrumenter.instrumentSync(code, 'test.js'), context)
        }
      }
    })
    t.deepEqual(actual, expectations.support)
  })
}
