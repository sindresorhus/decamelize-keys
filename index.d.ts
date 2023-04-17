import type {DelimiterCase} from 'type-fest';

// eslint-disable-next-line @typescript-eslint/ban-types
type EmptyTuple = [];

/**
Return a default type if input type is nil.

@template T - Input type.
@template U - Default type.
*/
type WithDefault<T, U extends T> = T extends undefined | void | null ? U : T; // eslint-disable-line @typescript-eslint/ban-types

// TODO: Replace this with https://github.com/sindresorhus/type-fest/blob/main/source/includes.d.ts
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
Append a segment to dot-notation path.
*/
type AppendPath<S extends string, Last extends string> = S extends ''
	? Last
	: `${S}.${Last}`;

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
> = T extends readonly any[]
	// Handle arrays or tuples.
	? {
		[P in keyof T]: T[P] extends Record<string, any> | readonly any[]
			// eslint-disable-next-line @typescript-eslint/ban-types
			? {} extends DecamelizeKeys<T[P], Separator>
				? T[P]
				: DecamelizeKeys<
				T[P],
				Separator,
				Exclude,
				Deep,
				StopPaths
				>
			: T[P];
	}
	: T extends Record<string, any>
		// Handle objects.
		? {
			[
			P in keyof T as [IsInclude<Exclude, P>] extends [true]
				? P
				: DelimiterCase<P, Separator>
			]: [IsInclude<StopPaths, AppendPath<Path, P & string>>] extends [
				true,
			]
				? T[P]
				// eslint-disable-next-line @typescript-eslint/ban-types
				: {} extends DecamelizeKeys<T[P]>
					? T[P]
					: [Deep] extends [true]
						? DecamelizeKeys<
						T[P],
						Separator,
						Exclude,
						Deep,
						StopPaths,
						AppendPath<Path, P & string>
						>
						: T[P];
		}
		// Return anything else as-is.
		: T;

type Options<Separator> = {
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
	Exclude keys from being camel-cased.

	If this option can be statically determined, it's recommended to add `as const` to it.

	@default []
	*/
	readonly exclude?: ReadonlyArray<string | RegExp>;

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
	readonly deep?: boolean;
	/**
    Exclude children at the given object paths in dot-notation from being decamel-cased. For example, with an object like {a: {b: '🦄'}}, the object path to reach the unicorn is 'a.b'.
	If this option can be statically determined, it's recommended to add `as const` to it.
	@default []
	@example
	```
	import decamelizeKeys from 'decamelize-keys';
	decamelizeKeys({
		aB: 1,
		aC: {
			cD: 1,
			cE: {
				eF: 1
			}
		}
	}, {
		deep: true,
		stopPaths: [
			'aC.cE'
		]
	}),
	// {
	// 	a_b: 1,
	// 	a_c: {
	// 		c_d: 1,
	// 		c_e: {
	// 			eF: 1
	// 		}
	// 	}
	// }
	```
	*/
	readonly stopPaths?: readonly string[];
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

decamelizeKeys({fooBar: true, nested: {unicornRainbow: true}}, {deep: true});
//=> {{foo_bar: true, nested: {unicorn_rainbow: true}}

decamelizeKeys({aB: 1, aC: {cD: 1, cE: {e_f: 1}}}, {deep: true, stopPaths: ['aC.cE']}),
//=> {a_b: 1, a_c: {c_d: 1, c_e: {e_f: 1}}}

// Convert object keys with custom separators
decamelizeKeys({fooBar: true, Nested: {unicornRainbow: true}}, {deep: true, separator: '-'});
//=> {'foo-bar': true, nested: {'unicorn-rainbow': true}}
```
*/
export default function decamelizeKeys<
	T extends Record<string, any> | readonly any[],
	Separator extends string = '_',
	OptionsType extends Options<Separator> = Options<Separator>,
>(
	input: T,
	options?: Options<Separator>
): DecamelizeKeys<
T,
Separator,
WithDefault<OptionsType['exclude'], EmptyTuple>,
WithDefault<OptionsType['deep'], false>,
WithDefault<OptionsType['stopPaths'], EmptyTuple>
>;
