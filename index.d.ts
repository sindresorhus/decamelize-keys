import type {DelimiterCase, Includes} from 'type-fest';

// eslint-disable-next-line @typescript-eslint/ban-types
type EmptyTuple = [];

// TODO: Replace this with https://github.com/sindresorhus/type-fest/blob/main/source/includes.d.ts
// Note: `Includes` is deliberately not used here, even though it is equivalent. `exclude` is checked once per key, and swapping it in measurably slows down type-checking of large objects.
/**
Check if an element is included in a tuple.
*/
type IsInclude<List extends readonly unknown[], Target> = List extends undefined
	? false
	: List extends Readonly<EmptyTuple>
		? false
		: List extends readonly [infer First, ...infer Rest]
			? First extends Target
				? true
				: IsInclude<Rest, Target>
			: boolean;

/**
Append a key to a dot-notation path.
*/
type AppendPath<Path extends string, Key extends string> = Path extends ''
	? Key
	: `${Path}.${Key}`;

type DecamelizeKeysArrayElement<
	Element,
	Separator extends string,
	Exclude extends readonly unknown[],
	Deep extends boolean,
	StopPaths extends readonly string[],
	Path extends string,
> = Element extends Record<string, any> | readonly any[]
	// eslint-disable-next-line @typescript-eslint/ban-types
	? {} extends DecamelizeKeys<Element, Separator>
		? Element
		: DecamelizeKeys<Element, Separator, Exclude, Deep, StopPaths, Path>
	: Element;

type DecamelizeKeysValue<
	Value,
	Key extends string,
	Separator extends string,
	Exclude extends readonly unknown[],
	Deep extends boolean,
	StopPaths extends readonly string[],
	Path extends string,
> = Value extends Record<string, any> | readonly any[]
	? Includes<StopPaths, AppendPath<Path, Key>> extends true
		? Value
		: Record<string, unknown> extends DecamelizeKeys<Value, Separator>
			? Value
			: Deep extends true
				? DecamelizeKeys<Value, Separator, Exclude, Deep, StopPaths, AppendPath<Path, Key>>
				: Value
	: Value;

/**
Convert the keys of an object from camel case.
*/
export type DecamelizeKeys<
	T extends Record<string, any> | readonly any[],
	Separator extends string = '_',
	Exclude extends readonly unknown[] = EmptyTuple,
	Deep extends boolean = false,
	StopPaths extends readonly string[] = EmptyTuple,
	Path extends string = '',
> = T extends Date | Error | RegExp
	? T
	: T extends readonly any[]
	// Handle arrays or tuples.
		? {
			[P in keyof T]: DecamelizeKeysArrayElement<T[P], Separator, Exclude, Deep, StopPaths, Path>;
		}
		: T extends Record<string, any>
		// Handle objects.
			? {
				[
				P in keyof T as [IsInclude<Exclude, P>] extends [true]
					? P
					: DelimiterCase<P, Separator>
				]: DecamelizeKeysValue<T[P], P & string, Separator, Exclude, Deep, StopPaths, Path>;
			}
		// Return anything else as-is.
			: T;

type Options<
	Separator extends string,
	Exclude extends ReadonlyArray<string | RegExp>,
	Deep extends boolean,
	StopPaths extends readonly string[],
> = {
	/**
	The character or string used to separate words.

	Important: You must use `as const` on the value.

	@default '_'

	@example
	```
	import decamelizeKeys from 'decamelize-keys';

	decamelizeKeys({fooBar: true});
	//=> {foo_bar: true}

	decamelizeKeys({fooBar: true}, {separator: '-' as const});
	//=> {'foo-bar': true}
	```
	*/
	readonly separator?: Separator;

	/**
	Exclude keys from being decamelized.

	If this option can be statically determined, it's recommended to add `as const` to it.

	@default []
	*/
	readonly exclude?: Exclude;

	/**
	Recurse nested objects and objects in arrays.

	@default false

	@example
	```
	import decamelizeKeys from 'decamelize-keys';

	decamelizeKeys({fooBar: true, nested: {unicornRainbow: true}}, {deep: true});
	//=> {foo_bar: true, nested: {unicorn_rainbow: true}}
	```
	*/
	readonly deep?: Deep;

	/**
	Exclude children at the given object paths in dot-notation from being decamelized.

	This option only has an effect together with the `deep` option.

	The paths use the input key casing, so for example, with an object like `{aB: {cD: '🦄'}}`, the object path to reach the unicorn is `'aB.cD'`.

	The key at a stopped path is still decamelized. Only its children are left alone.

	When an object is inside an array, the path is specified without array indices. A `stopPath` applies to all items in the array.

	Important: You must use `as const` on the value.

	@default []

	@example
	```
	import decamelizeKeys from 'decamelize-keys';

	decamelizeKeys({aB: 1, aC: {cD: 1, cE: {eF: 1}}}, {deep: true, stopPaths: ['aC.cE'] as const});
	//=> {a_b: 1, a_c: {c_d: 1, c_e: {eF: 1}}}
	```

	@example
	```
	import decamelizeKeys from 'decamelize-keys';

	decamelizeKeys({fooBar: [{barBaz: {quxQuux: 1}}]}, {deep: true, stopPaths: ['fooBar.barBaz'] as const});
	//=> {foo_bar: [{bar_baz: {quxQuux: 1}}]}
	```
	*/
	readonly stopPaths?: StopPaths;
};

/**
Convert object keys from camel case using [`decamelize`](https://github.com/sindresorhus/decamelize).

@param input - Object or array of objects to decamelize.

@example
```
import decamelizeKeys from 'decamelize-keys';

// Convert an object
decamelizeKeys({fooBar: true});
//=> {foo_bar: true}

// Convert an array of objects
decamelizeKeys([{fooBar: true}, {barFoo: false}]);
//=> [{foo_bar: true}, {bar_foo: false}]
```
*/
export default function decamelizeKeys<
	T extends Record<string, any> | readonly any[],
	Separator extends string = '_',
	Exclude extends ReadonlyArray<string | RegExp> = EmptyTuple,
	Deep extends boolean = false,
	StopPaths extends readonly string[] = EmptyTuple,
>(
	input: T,
	options?: Options<Separator, Exclude, Deep, StopPaths>
): DecamelizeKeys<
T,
Separator,
Exclude,
Deep,
StopPaths
>;
