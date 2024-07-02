import { by } from '../src/index'

describe( 'asserts', () =>
{
	it( 'types', () =>
	{
		let date = new Date()
		by( date ).is.instanceOf( Date )
		by( date ).not.instanceOf( Array )

		let symb = Symbol( 'test' )

		by( [] ).is.array
		by( {} ).is.object
		by( ()=>{} ).is.function
		by( '' ).is.string
		by( 123 ).is.number
		by( true ).is.bool
		by( null ).is.null
		by( undefined ).is.undefined
		by( NaN ).is.nan
		by( true ).is.true
		by( false ).is.false
		by( symb ).is.symbol.and.is.not.string
	})

	it( 'Object and Arrays', () =>
	{
		let obj = { a: 1, b: 2 }
		by( obj ).to.deepEq( { a: 1, b: 2 } ).and.is.object

		let arr = [ 1, 2, 3 ]
		by( arr ).to.length( 3 )

		let str = 'hello'
		by( str ).to.length( 5 )

		by( obj ).has.property( 'a' )
		by( obj ).has.property( 'a', 1 ).and.has.property( 'b', 2 )
		by( obj ).has.include( { a: 1 } )
		by( obj ).has.key( 'a' )
		by( obj ).has.keys( [ 'a', 'b' ] )
		by( obj ).not.has.property( 'c' )
		by( obj ).not.has.include( { c: 3 } )
		by( obj ).not.has.key( 'c' )
		by( obj ).not.has.keys( [ 'c', 'd' ] )

		let objc = { a: 1, b: 2, includes() {return true} }
		by( objc ).is.object.and.has.include( 'b' )
	})

	it( 'Expect throw', () =>
	{
		const fnEx = () => { throw new Error( `i'm error message` ) }
		by( fnEx ).to.throw( Error )
		by( fnEx ).to.throw( `i'm error message` )
		by( fnEx ).to.throw( Error, `i'm error message` )

		by( () => {} ).not.throw()

		by( () =>
		{
			let num = 123
			by( num ).to.eq( 456 )
		} )
		.is.function.and.is.throw( Error )

	} )

	it( 'Custom Message', () =>
	{
		by( () =>
		{
			by( 123 ).to.eq( 456, 'Custom-Message' )
		})
		.to.throw( 'Custom-Message' )

		by( () =>
		{
			throw new Error( 'get the custom message' )
		})
		.to.throw( 'get the custom message' )
	} )
} )
