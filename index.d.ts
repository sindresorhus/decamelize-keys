import type {DelimiterCase} from 'type-fest';

// eslint-disable-next-line @typescript-eslint/ban-types
type EmptyTuple = [];

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

type DecamelizeKeysArrayElement<
	Element,
	Separator extends string,
	Exclude extends readonly unknown[],
	Deep extends boolean,
> = Element extends Record<string, any> | readonly any[]
	// eslint-disable-next-line @typescript-eslint/ban-types
	? {} extends DecamelizeKeys<Element, Separator>
		? Element
		: DecamelizeKeys<Element, Separator, Exclude, Deep>
	: Element;

/**
Convert the keys of an object from camel case.
*/
export type DecamelizeKeys<
	T extends Record<string, any> | readonly any[],
	Separator extends string = '_',
	Exclude extends readonly unknown[] = EmptyTuple,
	Deep extends boolean = false,
> = T extends Date | Error | RegExp
	? T
	: T extends readonly any[]
	// Handle arrays or tuples.
		? {
			[P in keyof T]: DecamelizeKeysArrayElement<T[P], Separator, Exclude, Deep>;
		}
		: T extends Record<string, any>
		// Handle objects.
			? {
				[
				P in keyof T as [IsInclude<Exclude, P>] extends [true]
					? P
					: DelimiterCase<P, Separator>
				]: Record<string, unknown> extends DecamelizeKeys<T[P]>
					? T[P]
					: Deep extends true
						? DecamelizeKeys<
						T[P],
						Separator,
						Exclude,
						Deep
						>
						: T[P];
			}
		// Return anything else as-is.
			: T;

type Options<
	Separator extends string,
	Exclude extends ReadonlyArray<string | RegExp>,
	Deep extends boolean,
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
	Exclude keys from being camel-cased.

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
>(
	input: T,
	options?: Options<Separator, Exclude, Deep>
): DecamelizeKeys<
T,
Separator,
Exclude,
Deep
>;
