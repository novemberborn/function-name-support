# function-name-support

Feature detection for function names. See [*The names of functions in
ES6*](http://2ality.com/2015/09/function-names-es6.html) for background.
Provides the [same results as
`node-compat-table`][node-compat-table].

## Installation

```console
$ npm install --save function-name-support
```

## Usage

```js
const functionNameSupport = require('function-name-support')
```

### `support`

A frozen object with boolean values. Compare with
[`node-compat-table`][node-compat-table]:

* *function statements*: `functionStatements`
* *function expressions*: `functionExpressions`
* *new Function*: `newFunction`
* *bound functions*: `boundFunctions`
* *variables (function)*: `functionVariables`
* *object methods (function)*: `functionObjectMethods`
* *accessor properties*: `accessorProperties`
* *shorthand methods*: `shorthandMethods`
* *symbol-keyed methods*: `symbolKeyedMethods`
* *class statements*: `classStatements`
* *class expressions*: `classExpressions`
* *variables (class)*: `classVariables`
* *object methods (class)*: `classObjectMethods`
* *class prototype methods*: `classPrototypeMethods`
* *class static methods*: `classStaticMethods`

### `bitFlags`

An integer that stores a serialization of the `support` object. Useful when
storing a function name (or lack thereof) for later comparisons along with
details on whether the function name was inferable at all.

### `isSubset(set: number, subset: number): boolean`

Helper method for comparing `bitFlags`. Returns `true` if `subset` is a subset
of `set`.

### `isSuperset(set: number, superset: number): boolean`

Helper method for comparing `bitFlags`. Returns `true` if `superset` is a
superset of `set`.

[node-compat-table]: http://node.green/#ES2015-built-in-extensions-function--name--property
