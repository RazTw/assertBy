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
		by( 'hello' ).to.length( 5 )
		by( 123 ).is.number
		by( true ).is.bool
		by( null ).is.null
		by( undefined ).is.undefined
		by( NaN ).is.nan
		by( true ).is.true
		by( false ).is.false
		by( symb ).is.symbol.and.is.not.string
	})

	it( 'numbers', () =>
	{
		let num = 5
		by( num ).to.equal( 5 ).and.is.number
		by( num ).not.equal( 10 ).and.is.not.bool
		by( num ).to.above( 3 ).and.is.not.function
		by( num ).to.below( 10 )
		by( num ).to.belowOrEq( 6 )
		by( num ).is.above( 3 )
		by( num ).is.aboveOrEq( 4 )

		// shorter
		by( num ).is.ab( 4 ).and.is.bl( 6 ).and.is.eq( 5 )

		by( num ).is.withIn( 3, 6 )
		by( num ).is.not.withIn( 6, 10 )

		by( 5.005 ).is.approximately( 5, 0.01 )
		by( 5.005 ).is.not.approximately( 5, 0.001 )
	})

	it( 'Array and Object', () =>
	{
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
	})

	it( 'Object deep cases', () =>
	{
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
