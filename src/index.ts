type str = string
type num = number
type bol = boolean


export const debug = false

function stringify( obj: any ): str
{
	return JSON.stringify( obj ).replace( /"([^"]+)":/g, '$1:' )
}

function err( str: str ): Error
{
	let error = new Error( str )
	if( !Error.captureStackTrace ) return error

	Error.captureStackTrace( error, err )
	let stack = error.stack?.split( '\n' )
	if( stack && stack.length > 4 && !debug )
	{
		const msgs = stack.filter( line => !line.includes( __filename ) ) // remove current file stack
		error.stack = msgs.join( '\n' )
	}
	return error
}

function inspect( obj: any, options: { depth?: num, showHidden?: bol } = {} ): str
{
	const { depth = 2, showHidden = false } = options
	const seen = new WeakSet<object>()

	function formatValue( value: any, currentDepth: num ): str
	{
		if( value === null ) return 'null'
		if( typeof value === 'undefined' ) return 'undefined'
		if( typeof value === 'string' ) return `'${ value }'`
		if( typeof value === 'number' || typeof value === 'boolean' ) return String( value )
		if( typeof value === 'function' ) return `'function ${ value.name || 'anonymous' }()'`
		if( typeof value === 'symbol' ) return value.toString()
		if( seen.has( value ) ) return `'[Circular]'`

		if( typeof value === 'object' ) {
			seen.add( value )
			if( Array.isArray( value ) ) {
				if( currentDepth > depth ) return `'[Array]'`
				return `[${ value.map( v => formatValue( v, currentDepth + 1 ) ).join( ', ' ) }]`
			}
			else {
				if( currentDepth > depth ) return `'[Object]'`
				const keys = showHidden ? Reflect.ownKeys( value ) : Object.keys( value )
				const entries = keys.map( key => `${ String( key ) }: ${ formatValue( ( value as any )[ key ], currentDepth + 1 ) }` )
				return `{ ${ entries.join( ', ' ) } }`
			}
		}

		return String( value )
	}

	return formatValue( obj, 0 )
}


export const msgs =
{
	equal: 'expect {0} to {1}equal {2}',
	above: 'expect {0} to {1}be above {2}',
	aboveOrEq: 'expect {0} to {1}be above or equal to {2}',
	below: 'expect {0} to {1}be below {2}',
	belowOrEq: 'expect {0} to {1}be below or equal to {2}',
	deepEqual: 'expect {0} to {1}deeply equal {2}',
	length: 'expect {0} to {1}have length {2}, but got {3}',
	function: 'expect {0} to be a function',
	notThrow: 'expect function to not throw the specified error',
	instanceOf: 'expect error to be instance of {0}',
	errorMessage: 'expect error message to be [{0}], but got [{1}]',
	throwError: 'expect to throw an error from function: {0}',
	type: 'expect {0} to {1}be a {2}',
	array: 'expect {0} to {1}be an array',
	object: 'expect {0} to {1}be an object',
	null: 'expect {0} to {1}be null',
	nullOrUndef: 'expect {0} to {1}be null or undefined',
	undefined: 'expect {0} to {1}be undefined',
	nan: 'expect {0} to {1}be NaN',
	true: 'expect {0} to {1}be true',
	false: 'expect {0} to {1}be false',
	instance: 'expect {0} to {1}be instance of {2}',
	property: 'expect {0} to {1}have property {2}',
	include: 'expect {0} to {1}include {2}',
	key: 'expect {0} to {1}have key {2}',
	within: `expect {0} to {1}be within {2}..{3}`,
	approximately: `expect {0} to {1}be approximately {2} ±{3}`
}

function fmt( ab:AssertBase, template: str, ...args: any[] ) : str
{
	const notStr = ab['no'] ? 'not ' : ''
	return template.replace( /\{(\d+)}/g, ( _match, index ) =>
	{
		switch( Number( index ) )
		{
			case 0:
				return `[${ inspect( ab['v'] ) }](${ typeof ab['v'] })`
			case 1:
				return notStr
			default:
				return args[ Number( index ) - 2 ]
		}
	} )
}

class AssertBase
{
	protected v: any
	protected no: bol

	constructor( v: any, no = false )
	{
		this.v = v
		this.no = no
	}

	protected chk( cond: bol, msg: str ): AssertEnd
	{
		if( this.no ? cond : !cond ) throw err( msg )
		return new AssertEnd( this.v )
	}
}

class AssertEnd extends AssertBase
{
	get and() { return new AssertBy( this.v ) }
}


class AssertTo extends AssertBase
{
	get not() { return new AssertTo( this.v, true ) }

	length( n: num, msg?: str )  { return this.chk( this.v.length === n, msg ? msg : fmt( this, msgs.length, n, this.v.length ) ) }

	eq( expect: any, msg?: str ) { return this.equal( expect, msg ) }
	equal( expect:any, msg?: str ) { return this.chk( this.v === expect, msg ? msg : fmt( this, msgs.equal, expect ) ) }

	ab( expect: num, msg?: str ) { return this.above( expect, msg ) }
	above( expect: num, msg?: str ) { return this.chk( this.v > expect, msg ? msg : fmt( this, msgs.above, expect ) ) }

	abe( expect: num, msg?: str ) { return this.aboveOrEq( expect, msg ) }
	aboveOrEq( expect: num, msg?: str ) { return this.chk( this.v >= expect, msg ? msg : fmt( this, msgs.aboveOrEq, expect ) ) }

	bl( expect: num, msg?: str ) { return this.below( expect, msg ) }
	below( expect: num, msg?: str ) { return this.chk( this.v < expect, msg ? msg : fmt( this, msgs.below, expect ) ) }

	ble( expect: num, msg?: str ) { return this.belowOrEq( expect, msg ) }
	belowOrEq( expect: num, msg?: str ) { return this.chk( this.v <= expect, msg ? msg : fmt( this, msgs.belowOrEq, expect ) ) }

	withIn( start: num, end: num, msg?: str ) { return this.chk( this.v >= start && this.v <= end, msg ? msg : fmt( this, msgs.within, start, end ) ) }

	approximately( expect: num, delta: num, msg?: str ) { return this.chk( Math.abs( this.v - expect ) <= delta, msg ? msg : fmt( this, msgs.approximately, expect, delta ) ) }

	deepEq( expect: any, msg?: str )
	{
		const vStr = JSON.stringify( this.v ), expectStr = JSON.stringify( expect )
		return this.chk( vStr === expectStr, msg ? msg : fmt( this, msgs.deepEqual, expectStr ) )
	}

	throw( msg: str ) : AssertEnd
	throw<T extends Function>( type: T ) : AssertEnd
	throw<T extends Function>( type?: T, msg?: str ) : AssertEnd
	throw( type:Function|string, msg?: str )
	{
		if( typeof type === 'string' ) msg = type

		if( typeof this.v !== 'function' ) throw err( msgs.function.replace( '{0}', this.v ) )
		try { this.v() }
		catch( error )
		{
			if( this.no )
			{
				if( ( !type || typeof type === 'function' && error instanceof type ) && ( !msg || error.message == msg ) ) throw err( msgs.notThrow )
			}
			else
			{
				if( type && typeof type === 'function' && !( error instanceof type ) ) throw err( msgs.instanceOf.replace( '{0}', type.name ) )
				if( msg && !error.message.includes( msg ) ) throw err( msgs.errorMessage.replace( '{0}', msg ).replace( '{1}', error.message ) )
				return this.chk( true, `should not happen..` )
			}
		}
		if( !this.no ) throw err( msgs.throwError.replace( '{0}', this.v ) )
		return new AssertEnd( this.v )
	}
}

class AssertIsBase extends AssertTo
{
	private checkType( expectType: str, msg?: str ) { return this.chk( typeof this.v === expectType, msg ? msg : fmt( this, msgs.type, expectType ) ) }

	get has() { return new AssertHas( this.v, this.no ) }

	get array() { return this.chk( Array.isArray( this.v ), msgs.array ) }

	get obj() { return this.object }
	get object() { return this.chk( typeof this.v === 'object' && this.v !== null && !Array.isArray( this.v ), msgs.object ) }

	get func() { return this.function }
	get function() { return this.checkType( 'function' ) }

	get str() { return this.string }
	get string() { return this.checkType( 'string' ) }

	get num() { return this.number }
	get number() { return this.checkType( 'number' ) }
	get bool() { return this.checkType( 'boolean' ) }
	get symbol() { return this.checkType( 'symbol' ) }
	get null() { return this.chk( this.v === null, msgs.null ) }
	get undefined() { return this.chk( this.v === undefined, msgs.undefined ) }
	get nullOrUndef() { return this.chk( this.v === null || this.v === undefined, msgs.nullOrUndef ) }
	get nan() { return this.chk( isNaN( this.v ), msgs.nan ) }
	get true() { return this.chk( this.v === true, msgs.true ) }
	get false() { return this.chk( this.v === false, msgs.false ) }

	instanceOf( expect: Function, msg?: str ) { return this.chk( this.v instanceof expect, msg ? msg : fmt( this, msgs.instance, expect.name ) ) }
}

class AssertIs extends AssertIsBase
{
	get not() { return new AssertIsBase( this.v, true ) }
}


class AssertHas extends AssertBase
{
	private checkProp( name: str, condition: bol, value?: any, msg?: str )
	{
		this.chk( condition, msg ? msg : fmt( this, msgs.property, name ) )
		if( value !== undefined ) this.chk( this.v[ name ] === value, msg ? msg : fmt( this, msgs.property, name, value ) )

		return new AssertEnd( this.v )
	}

	prop( name: str, value?: any, msg?: str ){ return this.property( name, value, msg ) }
	property( name: str, value?: any, msg?: str )
	{
		return this.checkProp( name, name in this.v, value, msg )
	}

	incl( expect: any, msg?: str ) { this.include( expect, msg ) }
	include( expect: any, msg?: str )
	{
		if( this.v && typeof this.v.includes === 'function' ) return this.chk( this.v.includes( expect ), msg ? msg : fmt( this, msgs.include, expect ) )
		else if( typeof this.v === 'object' && this.v !== null )
		{
			for( let key in expect )
			{
				let ok = this.chk( key in this.v && this.v[ key ] === expect[ key ], msg ? msg : fmt( this, msgs.include, stringify( expect ) ) )
				if( ok ) return ok
			}
		}
		throw err( `no support the include assertion failed for expect[${ stringify( expect ) }] in type["${ typeof this.v }"] ${ stringify( this.v ) }` )
	}

	key( key: str, msg?: str ) { return this.chk( key in this.v, msg ? msg : fmt( this, msgs.key, key ) ) }

	keys( keys: str[], msg?: str )
	{
		keys.forEach( key => this.key( key, msg ) )
		return new AssertEnd( this.v )
	}
}

class AssertBy
{
	protected v: any
	constructor( v: any ) { this.v = v }

	get to() { return new AssertTo( this.v ) }
	get is() { return new AssertIs( this.v ) }
	get has() { return new AssertHas( this.v ) }
	get not() { return new AssertIsBase( this.v, true ) }
}

export function makeByAssert( v: any )
{
	return new AssertBy( v )
}


makeByAssert.fail = function( message: str ){ throw new Error( message ) }

export { makeByAssert as by }
