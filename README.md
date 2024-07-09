
<h1 align=center>
    <img alt="assertBy" src="icon.jpg">
</h1>

<p align=center>
  <b>assertBy</b> is a assertion library for validating data and conditions in tests. It provides various methods to check data types, values, and structures, suitable for various testing scenarios.
</p>

## Features

- **Simple and Intuitive API**: Makes assertion statements more readable.
- **Rich Assertion Methods**: Offers various data checking methods, including equality checks, range checks, type checks, and more.
- **Supports Chaining**: Allows multiple assertions to be chained together to build complex validation logic.
- **Works with Various Data Types**: Supports checking numbers, strings, arrays, objects, functions, and more.

## Installation

Install using npm:

```sh
npm install assertBy
```

## Usage

`assertBy` provides a simple and intuitive API to help you write test assertions easily.   
Here are some common usage examples:

### Asserting Numbers

```javascript
import { by } from 'assertBy'

let num = 5
by(num).to.equal(5).and.is.number
by(num).not.equal(10).and.is.not.bool
by(num).to.above(3).and.is.not.function
by(num).to.below(10)
by(num).to.belowOrEq(6)
by(num).is.above(3)
by(num).is.aboveOrEq(4)

// shorter
by(num).is.ab(4).and.is.bl(6).and.is.eq(5)

by(num).is.withIn(3, 6)
by(num).is.not.withIn(6, 10)

by(5.005).is.approximately(5, 0.01)
by(5.005).is.not.approximately(5, 0.001)
```

### Asserting Objects and Arrays

```javascript
let arr = [ 1, 2, 3 ]
by( arr ).to.length( 3 )


let obj = { a: 1, b: 2 }
by( obj ).to.deepEq( { a: 1, b: 2 } ).and.is.object

by( obj ).has.property( 'a' )
by( obj ).has.property( 'a', 1 ).and.has.property( 'b', 2 )
by( obj ).has.include( { a: 1 } )
by( obj ).has.key( 'a' )
by( obj ).has.keys( [ 'a', 'b' ] )
by( obj ).not.has.property( 'c' )
by( obj ).not.has.include( { c: 3 } )
by( obj ).not.has.key( 'c' )
by( obj ).not.has.keys( [ 'c', 'd' ] )
```

### Objects deep cases

```javascript
let obj = { a: 1, b: 2, c: { c1:10, c2:20, c3:{ d:'aa', e:'bb' } } }

by( obj ).has.deep.include( { b:2 } )
by( obj ).has.deep.include( { c:{ c2:20 } } )
by( obj ).has.deep.include( { c:{ c3:{ e:'bb' } } } )

by(()=>
{
    by( obj ).not.has.deep.include( { c:{ c4:'' } })
})
.to.throw( 'to not include key c' )

by( obj ).not.has.deep.include( { z:'' })
```


### Asserting Functions and Errors

```javascript
by(() => {}).not.throw()
const fnEx = () => { throw new Error(`i'm error message`) }
by(fnEx).to.throw(Error)
by(fnEx).to.throw(`i'm error message`)
by(fnEx).to.throw(Error, `i'm error message`)
by(() => {
    let num = 123
    by(num).to.eq(456)
}).is.function.and.is.throw(Error)
```

### Custom Message

```javascript
by(() => {
    by(123).to.eq(456, 'Custom-Message')
}).to.throw('Custom-Message')

by(() => {
    throw new Error('get the custom message')
}).to.throw('get the custom message')
```

## API Documentation

### `by(value)`

Initialize an assertion chain. `value` is the value to be checked.

- **`by.fail( 'message' )`**: Make a Error with message

### `to`

Further specify assertion conditions.

- **`.eq(expected)`**: Assert `value` is equal to `expected`
- **`.equal(expected)`**: Same as `.eq(expected)`
- **`.above(expected)`**: Assert `value` is greater than `expected`
- **`.ab(expected)`**: Same as `.above(expected)`
- **`.aboveOrEq(expected)`**: Assert `value` is greater than or equal to `expected`
- **`.abe(expected)`**: Same as `.aboveOrEq(expected)`
- **`.below(expected)`**: Assert `value` is less than `expected`
- **`.bl(expected)`**: Same as `.below(expected)`
- **`.belowOrEq(expected)`**: Assert `value` is less than or equal to `expected`
- **`.ble(expected)`**: Same as `.belowOrEq(expected)`
- **`.withIn(start, end)`**: Assert `value` is between `start` and `end`
- **`.approximately(expected, delta)`**: Assert `value` is approximately `expected`, allowing for `delta`
- **`.deepEq(expected)`**: Assert `value` is deeply equal to `expected`
- **`.throw([type], [message])`**: Assert function `value` throws an error of the specified type or message

### `is`

Check the type or state of `value`.

- **`.number`**: Assert `value` is a number
- **`.num`**: Same as `.number`
- **`.bool`**: Assert `value` is a boolean
- **`.function`**: Assert `value` is a function
- **`.func`**: Same as `.function`
- **`.string`**: Assert `value` is a string
- **`.str`**: Same as `.string`
- **`.object`**: Assert `value` is an object
- **`.obj`**: Same as `.object`
- **`.array`**: Assert `value` is an array
- **`.symbol`**: Assert `value` is a symbol
- **`.null`**: Assert `value` is null
- **`.undefined`**: Assert `value` is undefined
- **`.nullOrUndef`**: Assert `value` is null or undefined
- **`.nan`**: Assert `value` is NaN
- **`.true`**: Assert `value` is true
- **`.false`**: Assert `value` is false
- **`.instanceOf(constructor)`**: Assert `value` is an instance of the specified constructor

### `has`

Check properties and keys of an object or array.


- **`.property(name, [value])`**: Assert the object `value` has a property with the specified name, optionally equal to `value`
- **`.include(expected)`**: Assert the object or array `value` includes `expected`
- **`.key(name)`**: Assert the object `value` has a key with the specified name
- **`.keys(...names)`**: Assert the object `value` has a set of keys with the specified names
- **`.deep.include(expected)`**: Assert deep inclusion of `expected` in `value`

### `and`

Allows chaining of multiple assertions.

- **`.and`**: Chain multiple assertions


### `not`

Negate the assertion conditions.

- **`.eq(expected)`**: Assert `value` is not equal to `expected`
- **`.equal(expected)`**: Same as `.eq(expected)`
- **`.above(expected)`**: Assert `value` is not greater than `expected`
- **`.ab(expected)`**: Same as `.above(expected)`
- **`.aboveOrEq(expected)`**: Assert `value` is not greater than or equal to `expected`
- **`.abe(expected)`**: Same as `.aboveOrEq(expected)`
- **`.below(expected)`**: Assert `value` is not less than `expected`
- **`.bl(expected)`**: Same as `.below(expected)`
- **`.belowOrEq(expected)`**: Assert `value` is not less than or equal to `expected`
- **`.ble(expected)`**: Same as `.belowOrEq(expected)`
- **`.within(start, end)`**: Assert `value` is not between `start` and `end`
- **`.withIn(start, end)`**: Same as `.within(start, end)`
- **`.approximately(expected, delta)`**: Assert `value` is not approximately `expected`
- **`.deepEq(expected)`**: Assert `value` is not deeply equal to `expected`
- **`.throw([type], [message])`**: Assert function `value` does not throw an error of the specified type or message
