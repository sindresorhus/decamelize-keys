import {expectType, expectAssignable, expectNotType} from 'tsd';
import decamelizeKeys, {type DecamelizeKeys} from './index.js';

expectType<{foo_bar: boolean}>(decamelizeKeys({fooBar: true}));

// Array
expectType<Array<{foo_bar: boolean}>>(decamelizeKeys([{fooBar: true}]));

// Custom separator
expectType<{'foo-bar': boolean}>(decamelizeKeys({fooBar: true}, {separator: '-' as const}));

// TODO: Port more tests from https://github.com/sindresorhus/camelcase-keys/blob/main/index.test-d.ts
