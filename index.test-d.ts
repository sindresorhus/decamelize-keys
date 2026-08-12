import {expectType, expectAssignable, expectNotType} from 'tsd';
import decamelizeKeys, {type DecamelizeKeys} from './index.js';

expectType<{foo_bar: boolean}>(decamelizeKeys({fooBar: true}));

// Array
expectType<Array<{foo_bar: boolean}>>(decamelizeKeys([{fooBar: true}]));

// Custom separator
expectType<{'foo-bar': boolean}>(decamelizeKeys({fooBar: true}, {separator: '-' as const}));

// Deep
expectType<{foo_bar: boolean; nested: {unicorn_rainbow: boolean}}>(
	decamelizeKeys({fooBar: true, nested: {unicornRainbow: true}}, {deep: true}),
);
expectType<Array<{foo_bar: boolean; nested: {unicorn_rainbow: boolean}}>>(
	decamelizeKeys([{fooBar: true, nested: {unicornRainbow: true}}], {deep: true}),
);
expectType<{foo_bar: boolean; created_at: Date}>(
	decamelizeKeys({fooBar: true, createdAt: new Date()}, {deep: true}),
);
expectType<{foo_bar: boolean; thrown_error: Error; match_pattern: RegExp}>(
	decamelizeKeys({fooBar: true, thrownError: new Error(), matchPattern: /fooBar/}, {deep: true}),
);

// TODO: Port more tests from https://github.com/sindresorhus/camelcase-keys/blob/main/index.test-d.ts
