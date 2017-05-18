import vm from 'vm'
import test from 'ava'
import {createInstrumenter} from 'istanbul-lib-instrument'
import proxyquire from 'proxyquire'
import {support, bitFlags, isSubset, isSuperset} from '.'

// See <http://node.green/#ES2015-built-in-extensions-function--name--property>.
const expectations = {
  default: {
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
    bitFlags: 32767
  },
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
    bitFlags: 26251
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
    bitFlags: 26255
  }
}

test('detects the expected support', t => {
  t.deepEqual(support, (expectations[process.version] || expectations.default).support)
  t.is(bitFlags, (expectations[process.version] || expectations.default).bitFlags)
})

test('isSubset', t => {
  t.true(isSubset(0b0111, 0b0010))
  t.false(isSubset(0b0111, 0b1001))
})

test('isSuperset', t => {
  t.true(isSuperset(0b0010, 0b0111))
  t.false(isSuperset(0b1001, 0b0111))
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
  const regression = (expectations[process.version] || expectations.default).support.classVariables
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
    t.deepEqual(actual, (expectations[process.version] || expectations.default).support)
  })
}
