/* eslint-disable quote-props */
import test from 'ava';
import decamelizeKeys from './index.js';

test('main', t => {
	t.deepEqual(Object.keys(decamelizeKeys({fooBar: true})), ['foo_bar']);
});

test('separator option', t => {
	t.deepEqual(Object.keys(decamelizeKeys({fooBar: true}, {separator: '-'})), ['foo-bar']);
});

test('exclude option', t => {
	t.deepEqual(Object.keys(decamelizeKeys({'--': true}, {exclude: ['--']})), ['--']);
	t.deepEqual(Object.keys(decamelizeKeys({fooBar: true}, {exclude: [/^f/]})), ['fooBar']);
});

test('deep option', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: true, obj: {oneTwo: false, arr: [{threeFour: true}]}}, {deep: true}),
		{'foo_bar': true, obj: {'one_two': false, arr: [{'three_four': true}]}},
	);
});

test('handles nested arrays', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: [['a', 'b']]}, {deep: true}),
		{'foo_bar': [['a', 'b']]},
	);
});

test('accepts an array of objects', t => {
	t.deepEqual(
		decamelizeKeys([{fooBar: true}, {barFoo: false}, {'bar_foo': 'false'}]),
		[{'foo_bar': true}, {'bar_foo': false}, {'bar_foo': 'false'}],
	);
});

test('handle array of non-objects', t => {
	const input = ['name 1', 'name 2'];
	t.deepEqual(
		decamelizeKeys(input),
		input,
	);
});

test('handle array of non-objects with `deep` option', t => {
	const input = ['name 1', 'name 2'];
	t.deepEqual(
		decamelizeKeys(input, {deep: true}),
		input,
	);
});
