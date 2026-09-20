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

test('stopPaths option', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: true, obj: {oneTwo: false, arr: [{threeFour: true}]}}, {deep: true, stopPaths: ['obj']}),
		{'foo_bar': true, obj: {oneTwo: false, arr: [{threeFour: true}]}},
	);
});

test('stopPaths option stops only the given subtree', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: {barBaz: {quxQuux: true}}}, {deep: true, stopPaths: ['fooBar']}),
		{'foo_bar': {barBaz: {quxQuux: true}}},
	);
});

test('stopPaths option still decamelizes the key at the stop path', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: {barBaz: {quxQuux: true}}}, {deep: true, stopPaths: ['fooBar.barBaz']}),
		{'foo_bar': {'bar_baz': {quxQuux: true}}},
	);
});

test('stopPaths option accepts multiple paths', t => {
	t.deepEqual(
		decamelizeKeys({oneTwo: {aB: 1}, threeFour: {cD: 2}, fiveSix: {eF: 3}}, {deep: true, stopPaths: ['oneTwo', 'threeFour']}),
		{'one_two': {aB: 1}, 'three_four': {cD: 2}, 'five_six': {'e_f': 3}},
	);
});

test('stopPaths option applies to every item in an array', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: [{barBaz: {oneTwo: true}}, {barBaz: {threeFour: true}}]}, {deep: true, stopPaths: ['fooBar.barBaz']}),
		{'foo_bar': [{'bar_baz': {oneTwo: true}}, {'bar_baz': {threeFour: true}}]},
	);
});

test('stopPaths option can stop an array', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: [{oneTwo: true}], bazQux: [{threeFour: true}]}, {deep: true, stopPaths: ['fooBar']}),
		{'foo_bar': [{oneTwo: true}], 'baz_qux': [{'three_four': true}]},
	);
});

test('stopPaths option ignores array indices', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: [{barBaz: {oneTwo: true}}]}, {deep: true, stopPaths: ['fooBar.0.barBaz']}),
		{'foo_bar': [{'bar_baz': {'one_two': true}}]},
	);
});

test('stopPaths option handles nested arrays', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: [[{oneTwo: {threeFour: true}}]]}, {deep: true, stopPaths: ['fooBar.oneTwo']}),
		{'foo_bar': [[{'one_two': {threeFour: true}}]]},
	);
});

test('stopPaths option accepts an array of objects', t => {
	t.deepEqual(
		decamelizeKeys([{fooBar: {oneTwo: true}}], {deep: true, stopPaths: ['fooBar']}),
		[{'foo_bar': {oneTwo: true}}],
	);
});

test('stopPaths option uses the input key casing', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: {oneTwo: {threeFour: true}}}, {deep: true, separator: '-', stopPaths: ['fooBar.oneTwo']}),
		{'foo-bar': {'one-two': {threeFour: true}}},
	);
});

test('stopPaths option has no effect without the `deep` option', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: {oneTwo: true}}, {stopPaths: ['fooBar']}),
		{'foo_bar': {oneTwo: true}},
	);
});

test('stopPaths option ignores paths that do not exist', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: {oneTwo: true}}, {deep: true, stopPaths: ['nope.nope']}),
		{'foo_bar': {'one_two': true}},
	);
});

test('stopPaths option works together with the `exclude` option', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: {oneTwo: true}, bazQux: {threeFour: true}}, {deep: true, exclude: ['bazQux'], stopPaths: ['fooBar']}),
		{'foo_bar': {oneTwo: true}, bazQux: {'three_four': true}},
	);
});

test('stopPaths option does not match keys that only share a prefix', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: {oneTwo: true}, fooBarBaz: {threeFour: true}}, {deep: true, stopPaths: ['fooBar']}),
		{'foo_bar': {oneTwo: true}, 'foo_bar_baz': {'three_four': true}},
	);
});

test('stopPaths option matches the whole path from the root', t => {
	t.deepEqual(
		decamelizeKeys({aB: {cD: 1}, xY: {aB: {cD: 2}}}, {deep: true, stopPaths: ['aB']}),
		{'a_b': {cD: 1}, 'x_y': {'a_b': {'c_d': 2}}},
	);
});

test('stopPaths option accepts an empty array', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: {oneTwo: true}}, {deep: true, stopPaths: []}),
		{'foo_bar': {'one_two': true}},
	);
});

test('stopPaths option keeps built-in values in a stopped subtree', t => {
	t.deepEqual(
		decamelizeKeys({fooBar: {createdAt: new Date(0), error: new Error('test'), pattern: /foo/}}, {deep: true, stopPaths: ['fooBar']}),
		{'foo_bar': {createdAt: new Date(0), error: new Error('test'), pattern: /foo/}},
	);
});
