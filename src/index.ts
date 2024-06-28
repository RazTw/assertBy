export const debug = false

function stringify( obj: any ): string
{
	return JSON.stringify( obj ).replace( /"([^"]+)":/g, '$1:' )
}

function err( str: string ): Error
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

function inspect( obj: any, options: { depth?: number, showHidden?: boolean } = {} ): string
{
	const { depth = 2, showHidden = false } = options
	const seen = new WeakSet<object>()

	function formatValue( value: any, currentDepth: number ): string
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


class AssertBase
{
	protected v: any
	protected no: boolean

	constructor( v: any, no = false )
	{
		this.v = v
		this.no = no
	}

	protected chk( cond: boolean, template: string, ...args: any[] ): AssertEnd
	{
		const notStr = this.no ? 'not ' : ''
		const msg = template.replace( /\{(\d+)}/g, ( _match, index ) =>
		{
			switch( Number( index ) )
			{
				case 0:
					return inspect( this.v )
				case 1:
					return notStr
				default:
					return args[ Number( index ) - 2 ]
			}
		} )
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
	length( n: number )  { return this.chk( this.v.length === n, msgs.length, n, this.v.length ) }

	eq( expect: any ) { return this.chk( this.v === expect, msgs.equal, expect ) }

	above( expect: number ) { return this.chk( this.v > expect, msgs.above, expect ) }
	aboveOrEq( expect: number ) { return this.chk( this.v >= expect, msgs.aboveOrEq, expect ) }
	below( expect: number ) { return this.chk( this.v < expect, msgs.below, expect ) }
	belowOrEq( expect: number ) { return this.chk( this.v <= expect, msgs.belowOrEq, expect ) }

	within( start: number, end: number ) { return this.chk( this.v >= start && this.v <= end, msgs.within, start, end ) }

	approximately( expect: number, delta: number ) { return this.chk( Math.abs( this.v - expect ) <= delta, msgs.approximately, expect, delta ) }

	deepEq( expect: any )
	{
		const vStr = JSON.stringify( this.v ), expectStr = JSON.stringify( expect )
		return this.chk( vStr === expectStr, msgs.deepEqual, expectStr )
	}

	throw( msg: string ) : AssertEnd
	throw<T extends Function>( type: T ) : AssertEnd
	throw<T extends Function>( type?: T, msg?: string ) : AssertEnd
	throw( type:Function|string, msg?: string )
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
				if( msg && typeof msg === 'string' && !error.message.includes( msg ) ) throw err( msgs.errorMessage.replace( '{0}', msg ).replace( '{1}', error.message ) )
				return this.chk( true, '', this.v )
			}
		}
		if( !this.no ) throw err( msgs.throwError.replace( '{0}', this.v ) )
		return new AssertEnd( this.v )
	}
}

class AssertIsBase extends AssertTo
{
	private checkType( expectType: string ) { return this.chk( typeof this.v === expectType, msgs.type, expectType ) }

	get has() { return new AssertHas( this.v, this.no ) }

	get array() { return this.chk( Array.isArray( this.v ), msgs.array ) }
	get object() { return this.chk( typeof this.v === 'object' && this.v !== null && !Array.isArray( this.v ), msgs.object ) }
	get function() { return this.checkType( 'function' ) }
	get string() { return this.checkType( 'string' ) }
	get number() { return this.checkType( 'number' ) }
	get bool() { return this.checkType( 'boolean' ) }
	get symbol() { return this.checkType( 'symbol' ) }
	get null() { return this.chk( this.v === null, msgs.null ) }
	get undefined() { return this.chk( this.v === undefined, msgs.undefined ) }
	get nan() { return this.chk( isNaN( this.v ), msgs.nan ) }
	get true() { return this.chk( this.v === true, msgs.true ) }
	get false() { return this.chk( this.v === false, msgs.false ) }

	instanceOf( expect: Function ) { return this.chk( this.v instanceof expect, msgs.instance, expect.name ) }
}

class AssertIs extends AssertIsBase
{
	get not() { return new AssertIsBase( this.v, true ) }
}


class AssertHas extends AssertBase
{
	private checkProp( name: string, condition: boolean, value?: any )
	{
		this.chk( condition, msgs.property, name )
		if( value !== undefined ) this.chk( this.v[ name ] === value, msgs.property, name, value )

		return new AssertEnd( this.v )
	}

	property( name: string, value?: any )
	{
		return this.checkProp( name, name in this.v, value )
	}

	include( expect: any )
	{
		if( this.v && typeof this.v.includes === 'function' ) return this.chk( this.v.includes( expect ), msgs.include, expect )
		else if( typeof this.v === 'object' && this.v !== null )
		{
			for( let key in expect )
			{
				let ok = this.chk( key in this.v && this.v[ key ] === expect[ key ], msgs.include, stringify( expect ) )
				if( ok ) return ok
			}
		}
		throw err( `no support the include assertion failed for expect[${ stringify( expect ) }] in type["${ typeof this.v }"] ${ stringify( this.v ) }` )
	}

	key( key: string ) { return this.chk( key in this.v, msgs.key, key ) }

	keys( ...keys: string[] )
	{
		keys.forEach( key => this.key( key ) )
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

export { makeByAssert as by }

export function setAssertByGlobally()
{
	let g = global || window

	if( g.by ) throw new Error( `the global already have variable 'by': ${ g.by }` )
	g.by = makeByAssert
}

declare global
{
	// noinspection ES6ConvertVarToLetConst
	var by: typeof makeByAssert
}
