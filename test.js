/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module remark:message-control
 * @fileoverview Test suite for `remark-message-control`.
 */

'use strict';

/* Dependencies. */
var test = require('tape');
var remark = require('remark');
var toc = require('remark-toc');
var control = require('./index.js');

/* Tests. */
test('control()', function (t) {
  t.throws(function () {
    remark().use(control);
  }, /Expected `name` in `options`, got `undefined`/);

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo', reset: true});

    return function (ast, file) {
      var message = file.message('Error', ast.children[0]);

      message.ruleId = 'bar';
      message.source = 'foo';

      message = file.message('Error', ast.children[2]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo', reset: true});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'bar';
      message.source = 'foo';

      message = file.message('Error', ast.children[3]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'bar';
      message.source = 'foo';

      message = file.message('Error', ast.children[3]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'bar';
      message.source = 'foo';

      message = file.message('Error', ast.children[2]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'bar';
      message.source = 'foo';

      message = file.message('Error', ast.children[2]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'bar';
      message.source = 'foo';

      message = file.message('Error', ast.children[1]);

      message.ruleId = 'baz';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    return control(processor, {name: 'foo'});
  }).process([
    '<!--foo test-->'
  ].join('\n'), function (err, file) {
    var message = '1:1-1:16: Unknown keyword `test`: ' +
        'expected `\'enable\'`, `\'disable\'`, or `\'ignore\'`';

    t.equal(String(err), message);

    t.deepEqual(
      file.messages.map(String),
      [message],
      'should fail on invalid verbs'
    );
  });

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    processor.use(toc);

    return function (ast, file) {
      var message = file.message('Error', {line: 5, column: 1});

      message.ruleId = 'bar';
      message.source = 'foo';

      message = file.message('Error', {line: 7, column: 1});

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', {line: 5, column: 1});

      message.ruleId = 'bar';
      message.source = 'foo';

      message = file.message('Error', {line: 5, column: 1});

      message.ruleId = 'bar';
      message.source = 'foo';

      /* Remove list. */
      ast.children.pop();

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error');

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
    };
  }).process('', function (err, file) {
    t.ifError(err, 'should not fail');

    t.deepEqual(
      file.messages.map(String),
      ['1:1: Error'],
      'should support empty documents'
    );
  });

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', ast.position.end);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1].position.end);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'bar';
      message.source = 'foo';

      message = file.message('Error', ast.children[3]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo'});

    return function (ast, file) {
      var message = file.message('Error');

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    return control(processor, {name: 'foo'});
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

  remark().use(function (processor) {
    return control(processor, {name: 'foo', known: ['known']});
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo', source: 'baz'});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'bar';
      message.source = 'baz';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'alpha', source: ['bravo', 'charlie']});

    return function (ast, file) {
      var message = file.message('Error', ast.children[1]);

      message.ruleId = 'delta';
      message.source = 'bravo';

      message = file.message('Error', ast.children[3]);

      message.ruleId = 'echo';
      message.source = 'charlie';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {name: 'foo', disable: ['bar']});

    return function (ast, file) {
      var message = file.message('Error', ast.children[0]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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

  remark().use(function (processor) {
    var transformer = control(processor, {
      name: 'foo',
      reset: true,
      enable: ['bar']
    });

    return function (ast, file) {
      var message = file.message('Error', ast.children[0]);

      message.ruleId = 'bar';
      message.source = 'foo';

      transformer(ast, file);
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
