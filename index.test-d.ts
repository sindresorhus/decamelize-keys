/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/indent */
import {expectType, expectAssignable, expectNotType} from 'tsd';
import decamelizeKeys, {type DecamelizeKeys} from './index.js';

const fooBarObject = {fooBar: true};
const decamelFooBarObject = decamelizeKeys(fooBarObject);
expectType<{foo_bar: boolean}>(decamelFooBarObject);

const fooBarArray = [{fooBar: true}];
const decamelFooBarArray = decamelizeKeys(fooBarArray);
expectType<Array<{foo_bar: boolean}>>(decamelFooBarArray);

const readonlyFooBarObject = {fooBar: true} as const;
const decamelReadonlyFooBarObject = decamelizeKeys(readonlyFooBarObject);
expectType<{readonly foo_bar: true}>(decamelReadonlyFooBarObject);

const pascalCaseFooBarObject = {FooBar: true};
const decamelPascalCaseFooBarObject = decamelizeKeys(pascalCaseFooBarObject);
expectType<{foo_bar: boolean}>(decamelPascalCaseFooBarObject);

expectType<{'foo-bar': boolean}>(decamelizeKeys(fooBarObject, {separator: '-'}));

expectType<string[]>(decamelizeKeys(['name 1', 'name 2']));

expectType<string[]>(decamelizeKeys(['name 1', 'name 2'], {deep: true}));

expectType<readonly [{readonly 'foo_bar': true}, {readonly 'foo_baz': true}]>(
	decamelizeKeys([{fooBar: true}, {fooBaz: true}] as const),
);

const nestedFooBarObject = {fooBar: {fooBar: {fooBar: true}}};
const decamelNestedFooBarObject = decamelizeKeys(nestedFooBarObject, {deep: true});
expectType<{foo_bar: {foo_bar: {foo_bar: boolean}}}>(decamelNestedFooBarObject);

type ObjectOrUndefined = {
	fooBar: {
		fooBar:
		| {
			fooBar: boolean;
		}
		| undefined;
	};
};

const objectOrUndefined: ObjectOrUndefined = {
	fooBar: {
		fooBar: {
			fooBar: true,
		},
	},
};

expectType<{foo_bar: {foo_bar: {foo_bar: boolean} | undefined}}>(
	decamelizeKeys(objectOrUndefined, {deep: true}),
);

expectType<{fooBaz: true; foo_bar: boolean}>(
	decamelizeKeys(
		{fooBaz: true, fooBar: true},
		{exclude: ['foo', 'fooBaz', /bar/] as const},
	),
);

expectType<{foo_bar: boolean}>(
	decamelizeKeys({fooBar: true}, {stopPaths: ['foo']}),
);
expectType<{top_level: {foo_bar: {barBaz: boolean}}; 'foo-foo': boolean}>(
	decamelizeKeys(
		{topLevel: {fooBar: {barBaz: true}}, fooFoo: true},
		{deep: true, stopPaths: ['topLevel.fooBar'] as const},
	),
);

expectAssignable<Record<string, string>>(
	decamelizeKeys({} as Record<string, string>),
);

expectAssignable<Record<string, string>>(
	decamelizeKeys({} as Record<string, string>, {deep: true}),
);

type SomeObject = {
	some_property: string;
};

const someObject: SomeObject = {
	some_property: 'hello',
};

expectType<SomeObject>(decamelizeKeys(someObject));
expectType<SomeObject[]>(decamelizeKeys([someObject]));

type SomeTypeAlias = {
	some_property: string;
};

const objectWithTypeAlias = {
	some_property: 'this should also work',
};

expectType<SomeTypeAlias>(decamelizeKeys(objectWithTypeAlias));
expectType<SomeTypeAlias[]>(decamelizeKeys([objectWithTypeAlias]));

// Using exported type
expectType<DecamelizeKeys<typeof fooBarArray>>(decamelFooBarArray);

const arrayItems = [{fooBar: true}, {fooBaz: true}] as const;
expectType<DecamelizeKeys<typeof arrayItems>>(decamelizeKeys(arrayItems));

expectType<DecamelizeKeys<{'foo-bar': boolean}>>(
	decamelizeKeys({'foo-bar': true}),
);
expectType<DecamelizeKeys<{'--foo-bar': boolean}>>(
	decamelizeKeys({'--foo-bar': true}),
);
expectType<DecamelizeKeys<{foo_bar: boolean}>>(
	decamelizeKeys({foo_bar: true}),
);
expectType<DecamelizeKeys<{'foo bar': boolean}>>(
	decamelizeKeys({'foo bar': true}),
);

expectType<DecamelizeKeys<{readonly 'foo-bar': true}>>(
	decamelizeKeys({'foo-bar': true} as const),
);
expectType<DecamelizeKeys<{readonly '--foo-bar': true}>>(
	decamelizeKeys({'--foo-bar': true} as const),
);
expectType<DecamelizeKeys<{readonly foo_bar: true}>>(
	decamelizeKeys({foo_bar: true} as const),
);
expectType<DecamelizeKeys<{readonly 'foo bar': true}>>(
	decamelizeKeys({'foo bar': true} as const),
);

const nestedItem = {fooBar: {fooBar: {fooBar: true}}};
expectType<DecamelizeKeys<typeof nestedItem, '_', unknown[], true>>(
	decamelizeKeys(nestedItem, {deep: true}),
);

expectType<DecamelizeKeys<ObjectOrUndefined, '_', unknown[], true>>(
	decamelizeKeys(objectOrUndefined, {deep: true}),
);

const data = {'foo-bar': true, foo_bar: true};
const exclude = ['foo', 'fooBar', /bar/] as const;

expectType<DecamelizeKeys<typeof data, '_', typeof exclude>>(
	decamelizeKeys(data, {exclude}),
);

const nonNestedWithStopPathData = {fooBar: true};
expectType<
DecamelizeKeys<typeof nonNestedWithStopPathData, '_', unknown[], false, ['foo']>
>(decamelizeKeys({fooBar: true}, {stopPaths: ['foo']}));
const nestedWithStopPathData = {
	topLevel: {fooBar: {barBaz: true}},
	fooFoo: true,
};
const stopPaths = ['topLevel.fooBar'] as const;
expectType<
DecamelizeKeys<typeof nestedWithStopPathData, '_', unknown[], true, typeof stopPaths>
>(decamelizeKeys(nestedWithStopPathData, {deep: true, stopPaths}));

expectAssignable<DecamelizeKeys<Record<string, string>>>(
	decamelizeKeys({} as Record<string, string>),
);

expectAssignable<DecamelizeKeys<Record<string, string>, '_', unknown[], true>>(
	decamelizeKeys({} as Record<string, string>, {deep: true}),
);

expectType<DecamelizeKeys<SomeObject>>(decamelizeKeys(someObject));
expectType<DecamelizeKeys<SomeObject[]>>(decamelizeKeys([someObject]));

expectType<DecamelizeKeys<SomeTypeAlias>>(decamelizeKeys(objectWithTypeAlias));
expectType<DecamelizeKeys<SomeTypeAlias[]>>(
	decamelizeKeys([objectWithTypeAlias]),
);

// Verify exported type `DecamelizeKeys`
// Mapping types and retaining properties of keys
// https://github.com/microsoft/TypeScript/issues/13224

type ObjectDataType = {
	fooBar?: string;
	barBaz?: string;
	baz: string;
};
type InvalidConvertedObjectDataType = {
	foo_bar: string;
	bar_baz: string;
	baz: string;
};
type ConvertedObjectDataType = {
	foo_bar?: string;
	bar_baz?: string;
	baz: string;
};

const objectInputData: ObjectDataType = {
	fooBar: 'foo_bar',
	baz: 'baz',
};
expectType<ConvertedObjectDataType>(decamelizeKeys(objectInputData));
expectNotType<InvalidConvertedObjectDataType>(decamelizeKeys(objectInputData));

// Array
type ArrayDataType = ObjectDataType[];

const arrayInputData: ArrayDataType = [
	{
		fooBar: 'foo_bar',
		baz: 'baz',
	},
];
expectType<ConvertedObjectDataType[]>(decamelizeKeys(arrayInputData));
expectNotType<InvalidConvertedObjectDataType[]>(decamelizeKeys(arrayInputData));

// Deep
type DeepObjectType = {
	fooBar?: string;
	barBaz?: string;
	baz: string;
	firstLevel: {
		fooBar?: string;
		barBaz?: string;
		secondLevel: {
			fooBar: string;
			barBaz?: string;
		};
	};
};
type InvalidConvertedDeepObjectDataType = {
	foo_bar?: string;
	bar_baz?: string;
	baz: string;
	firstLevel?: {
		foo_bar?: string;
		bar_baz?: string;
		secondLevel?: {
			foo_bar: string;
			bar_baz?: string;
		};
	};
};
type ConvertedDeepObjectDataType = {
	foo_bar?: string;
	bar_baz?: string;
	baz: string;
	first_level: {
		fooBar?: string;
		barBaz?: string;
		secondLevel: {
			fooBar: string;
			barBaz?: string;
		};
	};
};
const deepInputData: DeepObjectType = {
	fooBar: 'foo_bar',
	baz: 'baz',
	firstLevel: {
		barBaz: 'bar_baz',
		secondLevel: {
			fooBar: 'foo_bar',
		},
	},
};
expectType<ConvertedDeepObjectDataType>(
	decamelizeKeys(deepInputData, {deep: false}),
);
expectNotType<InvalidConvertedDeepObjectDataType>(
	decamelizeKeys(deepInputData, {deep: false}),
);

// Exclude
type InvalidConvertedExcludeObjectDataType = {
	fooBar?: string;
	barBaz?: string;
	baz: string;
};
type ConvertedExcludeObjectDataType = {
	fooBar?: string;
	bar_baz?: string;
	baz: string;
};
const excludeInputData: ObjectDataType = {
	fooBar: 'foo_bar',
	barBaz: 'bar_baz',
	baz: 'baz',
};
expectType<ConvertedExcludeObjectDataType>(
	decamelizeKeys(excludeInputData, {
		exclude,
	}),
);
expectNotType<InvalidConvertedExcludeObjectDataType>(
	decamelizeKeys(excludeInputData, {
		exclude,
	}),
);

expectType<{
	func_foo: () => 'foo';
	record_bar: {foo: string};
	promise_baz: Promise<unknown>;
}>(
	decamelizeKeys({
		funcFoo: () => 'foo',
		recordBar: {foo: 'bar'},
		promiseBaz: new Promise(resolve => {
			resolve(true);
		}),
	}),
);

expectType<[
	() => 'foo',
	{foo: string},
	Promise<unknown>,
]>(
	decamelizeKeys([
		() => 'foo',
		{foo: 'bar'},
		new Promise(resolve => {
			resolve(true);
		}),
	]),
);
