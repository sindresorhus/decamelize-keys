import {expectType, expectAssignable, expectError, expectNotType} from 'tsd';
import decamelizeKeys, {type DecamelizeKeys} from './index.js';

expectType<{foo_bar: boolean}>(decamelizeKeys({fooBar: true}));

// Array
expectType<Array<{foo_bar: boolean}>>(decamelizeKeys([{fooBar: true}]));

// Custom separator
expectType<{'foo-bar': boolean}>(decamelizeKeys({fooBar: true}, {separator: '-' as const}));

// Widened booleans represent both deep and shallow results.
const options: {deep: boolean} = {deep: true};
expectType<{nested: {fooBar: true} | {foo_bar: true}}>(
	decamelizeKeys({nested: {fooBar: true}}, options),
);

// Mixed array element unions are transformed distributively.
// eslint-disable-next-line @typescript-eslint/ban-types
expectType<{items: Array<{foo_bar: boolean} | null>}>(
	decamelizeKeys(
		// eslint-disable-next-line @typescript-eslint/ban-types
		{items: [{fooBar: true}, null] as Array<{fooBar: boolean} | null>},
		{deep: true},
	),
);

// Unknown options remain rejected.
expectError(decamelizeKeys({fooBar: true}, {deep: true, typo: true}));

// Deep
expectType<{foo_bar: boolean; nested: {unicorn_rainbow: boolean}}>(
	decamelizeKeys({fooBar: true, nested: {unicornRainbow: true}}, {deep: true}),
);
expectType<Array<{foo_bar: boolean; nested: {unicorn_rainbow: boolean}}>>(
	decamelizeKeys([{fooBar: true, nested: {unicornRainbow: true}}], {deep: true}),
);
expectType<{'foo-bar': boolean; nested: {'unicorn-rainbow': boolean}}>(
	decamelizeKeys(
		{fooBar: true, nested: {unicornRainbow: true}},
		{deep: true, separator: '-' as const},
	),
);

const shallowResult = decamelizeKeys(
	{fooBar: true, nested: {unicornRainbow: true}},
	{deep: false},
);
expectType<{foo_bar: boolean; nested: {unicornRainbow: boolean}}>(shallowResult);
expectNotType<{foo_bar: boolean; nested: {unicorn_rainbow: boolean}}>(shallowResult);

expectType<{fooBar: true; nested_object: {keepCamel: boolean; change_me: boolean}}>(
	decamelizeKeys(
		{fooBar: true, nestedObject: {keepCamel: true, changeMe: true}},
		{deep: true, exclude: ['fooBar', 'keepCamel'] as const},
	),
);

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/naming-convention */
expectAssignable<DecamelizeKeys<{
	fooBar: boolean;
	nested: {unicornRainbow: boolean};
}, '_', [], true>>({
	foo_bar: true,
	nested: {unicorn_rainbow: true},
});
/* eslint-enable @typescript-eslint/ban-types, @typescript-eslint/naming-convention */
expectType<{foo_bar: boolean; created_at: Date}>(
	decamelizeKeys({fooBar: true, createdAt: new Date()}, {deep: true}),
);
expectType<{foo_bar: boolean; thrown_error: Error; match_pattern: RegExp}>(
	decamelizeKeys({fooBar: true, thrownError: new Error('test'), matchPattern: /fooBar/}, {deep: true}),
);

// `stopPaths`
expectType<{foo_bar: boolean; nested: {unicornRainbow: true}}>(
	decamelizeKeys({fooBar: true, nested: {unicornRainbow: true}}, {deep: true, stopPaths: ['nested'] as const}),
);
expectType<{foo_bar: {barBaz: {quxQuux: boolean}}}>(
	decamelizeKeys({fooBar: {barBaz: {quxQuux: true}}}, {deep: true, stopPaths: ['fooBar'] as const}),
);
expectType<{foo_bar: {bar_baz: {quxQuux: boolean}}}>(
	decamelizeKeys({fooBar: {barBaz: {quxQuux: true}}}, {deep: true, stopPaths: ['fooBar.barBaz'] as const}),
);
expectType<{one_two: {aB: number}; three_four: {cD: number}; five_six: {e_f: number}}>(
	decamelizeKeys({oneTwo: {aB: 1}, threeFour: {cD: 2}, fiveSix: {eF: 3}}, {deep: true, stopPaths: ['oneTwo', 'threeFour'] as const}),
);
expectType<{foo_bar: {one_two: boolean}}>(
	decamelizeKeys({fooBar: {oneTwo: true}}, {deep: true, stopPaths: ['nope.nope'] as const}),
);

// The types cannot build a dot-notation path from a numeric key, so numeric keys are never stopped.
expectType<{1: {c_d: number}}>(
	// eslint-disable-next-line @typescript-eslint/naming-convention
	decamelizeKeys({1: {cD: 1}}, {deep: true, stopPaths: ['nope'] as const}),
);

// An index signature cannot be expressed in a dot-notation path, so its values are still decamelized.
expectType<Record<string, {c_d: number}>>(
	decamelizeKeys({} as Record<string, {cD: number}>, {deep: true, stopPaths: ['nope'] as const}),
);

// A stop path is applied without array indices, to every item in the array.
expectType<{foo_bar: Array<{bar_baz: {quxQuux: boolean}}>}>(
	decamelizeKeys({fooBar: [{barBaz: {quxQuux: true}}, {barBaz: {quxQuux: false}}]}, {deep: true, stopPaths: ['fooBar.barBaz'] as const}),
);
expectType<{foo_bar: Array<Array<{one_two: {threeFour: boolean}}>>}>(
	decamelizeKeys({fooBar: [[{oneTwo: {threeFour: true}}]]}, {deep: true, stopPaths: ['fooBar.oneTwo'] as const}),
);
expectType<Array<{foo_bar: {oneTwo: boolean}}>>(
	decamelizeKeys([{fooBar: {oneTwo: true}}], {deep: true, stopPaths: ['fooBar'] as const}),
);
expectType<{foo_bar: Array<{oneTwo: boolean}>; baz_qux: Array<{three_four: boolean}>}>(
	decamelizeKeys({fooBar: [{oneTwo: true}], bazQux: [{threeFour: true}]}, {deep: true, stopPaths: ['fooBar'] as const}),
);
expectType<{foo_bar: {oneTwo: boolean}; foo_bar_baz: {three_four: boolean}}>(
	decamelizeKeys({fooBar: {oneTwo: true}, fooBarBaz: {threeFour: true}}, {deep: true, stopPaths: ['fooBar'] as const}),
);

// A `stopPath` uses the input key casing, not the separator'd output casing.
expectType<{'foo-bar': {'one-two': {threeFour: boolean}}}>(
	decamelizeKeys({fooBar: {oneTwo: {threeFour: true}}}, {deep: true, separator: '-' as const, stopPaths: ['fooBar.oneTwo'] as const}),
);

// `stopPaths` works together with `exclude`.
expectType<{fooBar: {oneTwo: true}; nested_object: {keepCamel: boolean; change_me: boolean}}>(
	decamelizeKeys(
		{fooBar: {oneTwo: true}, nestedObject: {keepCamel: true, changeMe: true}},
		{deep: true, exclude: ['fooBar', 'keepCamel'] as const, stopPaths: ['fooBar'] as const},
	),
);

// `stopPaths` has no effect without `deep`.
expectType<{foo_bar: {oneTwo: boolean}}>(
	decamelizeKeys({fooBar: {oneTwo: true}}, {stopPaths: ['fooBar'] as const}),
);

// Without `as const` the paths widen to `string[]`, which cannot be matched.
expectType<{foo_bar: {one_two: boolean}}>(
	decamelizeKeys({fooBar: {oneTwo: true}}, {deep: true, stopPaths: ['fooBar']}),
);

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/naming-convention */
expectAssignable<DecamelizeKeys<{
	fooBar: {barBaz: boolean};
}, '_', [], true, ['fooBar']>>({
	foo_bar: {barBaz: true},
});
/* eslint-enable @typescript-eslint/ban-types, @typescript-eslint/naming-convention */

// TODO: Port more tests from https://github.com/sindresorhus/camelcase-keys/blob/main/index.test-d.ts
