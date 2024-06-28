import { by } from '../src/index'

describe( 'asserts', () =>
{
	it( 'should pass all checks', () =>
	{
		let num = 5
		by( num ).to.eq( 5 ).and.is.number
		by( num ).not.eq( 10 ).and.is.not.bool
		by( num ).to.above( 3 ).and.is.not.function
		by( num ).to.below( 10 )
		by( num ).to.belowOrEq(6)
		by( num ).is.above( 3 )
		by( num ).is.aboveOrEq( 4 )
		by( num ).not.length( 5 )

		by( num ).is.within( 3, 6 )
		by( num ).is.not.within( 6, 10 )

		by( 5.005 ).is.approximately( 5, 0.01 )
		by( 5.005 ).is.not.approximately( 5, 0.001 )

		let obj = { a: 1, b: 2 }
		by( obj ).to.deepEq( { a: 1, b: 2 } ).and.is.object

		let date = new Date()
		by( date ).is.instanceOf( Date )
		by( date ).not.instanceOf( Array )

		let arr = [ 1, 2, 3 ]
		let func = function() {}
		let str = 'hello'
		let bool = true
		let symb = Symbol('test')

		by( arr ).is.array
		by( obj ).is.object
		by( func ).is.function
		by( str ).is.string
		by( num ).is.number
		by( bool ).is.bool
		by( null ).is.null
		by( undefined ).is.undefined
		by( NaN ).is.nan
		by( true ).is.true
		by( false ).is.false
		by( symb ).is.symbol.and.is.not.string

		by( arr ).to.length( 3 )
		by( str ).to.length( 5 )

		by( obj ).has.property( 'a' )
		by( obj ).has.property( 'a', 1 ).and.has.property( 'b', 2 )
		by( obj ).has.include( { a: 1 } )
		by( obj ).has.key( 'a' )
		by( obj ).has.keys( 'a', 'b' )
		by( obj ).not.has.property( 'c' )
		by( obj ).not.has.include( { c: 3 } )
		by( obj ).not.has.key( 'c' )
		by( obj ).not.has.keys( 'c', 'd' )

		let objc = { a:1, b:2, includes(){return true} }
		by( objc ).is.object.and.has.include( 'b' )

		by( () => {} ).not.throw()
		const fnEx = () => { throw new Error( `i'm error message` ) }
		by( fnEx ).to.throw( Error )
		by( fnEx ).to.throw( `i'm error message` )
		by( fnEx ).to.throw( Error, `i'm error message` )
		by(() =>
		{
			num = 123
			by( num ).to.eq( 456 )
		})
		.is.function
		.and
		.is.throw( Error, 'expect 123 to equal 456' )

	} )
} )
