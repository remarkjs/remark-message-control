'use strict';

var test = require('tape');
var remark = require('remark');
var toc = require('remark-toc');
var control = require('./');

test('control()', function (t) {
  t.throws(function () {
    remark().use(control).freeze();
  }, /Expected `name` in `options`, got `undefined`/);

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'foo:bar');
      transformer(tree, file);
    };
  }).process([
    '<!--foo disable bar-->',
    '',
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      [],
      'should “disable” a message'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    '<!--foo disable-->',
    '',
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      [],
      'should “disable” all message without `ruleId`s'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo', reset: true});

    return function (tree, file) {
      file.message('Error', tree.children[0], 'foo:bar');
      file.message('Error', tree.children[2], 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    'This is a paragraph.',
    '',
    '<!--foo enable-->',
    '',
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['5:1-5:21: Error'],
      'should support `reset`'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo', reset: true});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    '<!--foo enable bar-->',
    '',
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['3:1-3:21: Error'],
      'should enable with a marker, when `reset`'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'foo:bar');
      file.message('Error', tree.children[3], 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    '<!--foo disable bar-->',
    '',
    'This is a paragraph.',
    '',
    '<!--foo enable bar-->',
    '',
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['7:1-7:21: Error'],
      'should enable a message'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'foo:bar');
      file.message('Error', tree.children[3], 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    '<!--foo disable bar-->',
    '',
    'This is a paragraph.',
    '',
    '<!--foo enable-->',
    '',
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['7:1-7:21: Error'],
      'should enable all message without `ruleId`s'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'foo:bar');
      file.message('Error', tree.children[2], 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    '<!--foo ignore bar-->',
    '',
    'This is a paragraph.',
    '',
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['5:1-5:21: Error'],
      'should ignore a message'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'foo:bar');
      file.message('Error', tree.children[2], 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    '<!--foo ignore-->',
    '',
    'This is a paragraph.',
    '',
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['5:1-5:21: Error'],
      'should ignore all message without `ruleId`s'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'foo:bar');
      file.message('Error', tree.children[1], 'foo:baz');

      transformer(tree, file);
    };
  }).process([
    '<!--foo ignore bar baz-->',
    '',
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      [],
      'should ignore multiple rules'
    );
  });

  remark().use(function () {
    return control({name: 'foo'});
  }).process('<!--foo test-->', function (err) {
    t.equal(
      String(err),
      '1:1-1:16: Unknown keyword `test`: ' +
      'expected `\'enable\'`, `\'disable\'`, or `\'ignore\'`',
      'should fail on invalid verbs'
    );
  });

  remark().use(toc).use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', {line: 5, column: 1}, 'foo:bar');
      file.message('Error', {line: 7, column: 1}, 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    '# README',
    '',
    '## Table of Contents',
    '',
    '*  [Another Header](#another-header)',
    '',
    '## Another header'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['7:1: Error'],
      'should ignore gaps'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', {line: 5, column: 1}, 'foo:bar');
      file.message('Error', {line: 5, column: 1}, 'foo:bar');

      /* Remove list. */
      tree.children.pop();

      transformer(tree, file);
    };
  }).process([
    '# README',
    '',
    '## Table of Contents',
    '',
    '*  [This is removed](#this-is-removed)'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      [],
      'should ignore final gaps'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', 'foo:bar');

      transformer(tree, file);
    };
  }).process('', function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['1:1: Error'],
      'should support empty documents'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', tree.position.end, 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    '# README',
    ''
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['2:1: Error'],
      'should message at the end of the document'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', tree.children[1].position.end, 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    '# README',
    '',
    '*   List'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['3:9: Error'],
      'should message at the end of the document'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'foo:bar');
      file.message('Error', tree.children[3], 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    '<!--foo disable bar-->',
    '',
    'This is a paragraph.',
    '',
    '<!--foo disable bar-->',
    '',
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      [],
      'should ignore double disables'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo'});

    return function (tree, file) {
      file.message('Error', 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    'Foo'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['1:1: Error'],
      'should not ignore messages without location information'
    );
  });

  remark().use(function () {
    return control({name: 'foo'});
  }).process([
    '<!doctype html>',
    '',
    '<!--bar baz qux-->'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      [],
      'should ignore non-markers'
    );
  });

  remark().use(function () {
    return control({name: 'foo', known: ['known']});
  }).process([
    '<!--foo ignore known-->',
    '',
    '<!--foo ignore unknown-->'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['3:1-3:26: Unknown rule: cannot ignore `\'unknown\'`'],
      'should support a list of `known` values, and warn on unknowns'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo', source: 'baz'});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'baz:bar');

      transformer(tree, file);
    };
  }).process([
    '<!--foo ignore bar-->',
    '',
    'Foo'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      [],
      'should ignore by `source`, when given as a string'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'alpha', source: ['bravo', 'charlie']});

    return function (tree, file) {
      file.message('Error', tree.children[1], 'bravo:delta');
      file.message('Error', tree.children[3], 'charlie:echo');

      transformer(tree, file);
    };
  }).process([
    '<!--alpha ignore delta-->',
    '',
    'Foxtrot',
    '',
    '<!--alpha ignore echo-->',
    '',
    'Golf'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      [],
      'should ignore by `source`, when given as an array'
    );
  });

  remark().use(function () {
    var transformer = control({name: 'foo', disable: ['bar']});

    return function (tree, file) {
      file.message('Error', tree.children[0], 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      [],
      'should support initial `disable`s'
    );
  });

  remark().use(function () {
    var transformer = control({
      name: 'foo',
      reset: true,
      enable: ['bar']
    });

    return function (tree, file) {
      file.message('Error', tree.children[0], 'foo:bar');

      transformer(tree, file);
    };
  }).process([
    'This is a paragraph.'
  ].join('\n'), function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['1:1-1:21: Error'],
      'should support initial `enable`s'
    );
  });

  t.end();
});
