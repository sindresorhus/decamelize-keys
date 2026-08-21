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

// TODO: Port more tests from https://github.com/sindresorhus/camelcase-keys/blob/main/index.test-d.ts
