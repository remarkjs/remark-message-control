import test from 'tape'
import {remark} from 'remark'
import remarkToc from 'remark-toc'
import remarkMessageControl from './index.js'

test('remarkMessageControl', function (t) {
  t.throws(function () {
    remark().use(remarkMessageControl).freeze()
  }, /Expected `name` in `options`, got `undefined`/)

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync('<!--foo disable bar-->\n\nThis is a paragraph.')
      .messages.map(String),
    [],
    'should “disable” a message'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync('<!--foo disable-->\n\nThis is a paragraph.')
      .messages.map(String),
    [],
    'should “disable” all message without `ruleId`s'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo', reset: true})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[0], 'foo:bar')
          file.message('Error', tree.children[2], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync(
        [
          'This is a paragraph.',
          '',
          '<!--foo enable-->',
          '',
          'This is a paragraph.'
        ].join('\n')
      )
      .messages.map(String),
    ['5:1-5:21: Error'],
    'should support `reset`'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo', reset: true})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync('<!--foo enable bar-->\n\nThis is a paragraph.')
      .messages.map(String),
    ['3:1-3:21: Error'],
    'should enable with a marker, when `reset`'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'foo:bar')
          file.message('Error', tree.children[3], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync(
        [
          '<!--foo disable bar-->',
          '',
          'This is a paragraph.',
          '',
          '<!--foo enable bar-->',
          '',
          'This is a paragraph.'
        ].join('\n')
      )
      .messages.map(String),
    ['7:1-7:21: Error'],
    'should enable a message'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'foo:bar')
          file.message('Error', tree.children[3], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync(
        [
          '<!--foo disable bar-->',
          '',
          'This is a paragraph.',
          '',
          '<!--foo enable-->',
          '',
          'This is a paragraph.'
        ].join('\n')
      )
      .messages.map(String),
    ['7:1-7:21: Error'],
    'should enable all message without `ruleId`s'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'foo:bar')
          file.message('Error', tree.children[2], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync(
        [
          '<!--foo ignore bar-->',
          '',
          'This is a paragraph.',
          '',
          'This is a paragraph.'
        ].join('\n')
      )
      .messages.map(String),
    ['5:1-5:21: Error'],
    'should ignore a message'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'foo:bar')
          file.message('Error', tree.children[2], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync(
        [
          '<!--foo ignore-->',
          '',
          'This is a paragraph.',
          '',
          'This is a paragraph.'
        ].join('\n')
      )
      .messages.map(String),
    ['5:1-5:21: Error'],
    'should ignore all message without `ruleId`s'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'foo:bar')
          file.message('Error', tree.children[1], 'foo:baz')
          transformer(tree, file)
        }
      })
      .processSync('<!--foo ignore bar baz-->\n\nThis is a paragraph.')
      .messages.map(String),
    [],
    'should ignore multiple rules'
  )

  t.throws(
    function () {
      remark()
        .use(function () {
          return remarkMessageControl({name: 'foo'})
        })
        .processSync('<!--foo test-->')
    },
    /^1:1-1:16: Unknown keyword `test`: expected `'enable'`, `'disable'`, or `'ignore'`/,
    'should fail on invalid verbs'
  )

  t.deepEqual(
    remark()
      .use(remarkToc)
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', {line: 5, column: 1}, 'foo:bar')
          file.message('Error', {line: 7, column: 1}, 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync(
        [
          '# README',
          '',
          '## Table of Contents',
          '',
          '*  [Another Header](#another-header)',
          '',
          '## Another header'
        ].join('\n')
      )
      .messages.map(String),
    ['7:1: Error'],
    'should ignore gaps'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', {line: 5, column: 1}, 'foo:bar')
          file.message('Error', {line: 5, column: 1}, 'foo:bar')

          /* Remove list. */
          tree.children.pop()

          transformer(tree, file)
        }
      })
      .processSync(
        [
          '# README',
          '',
          '## Table of Contents',
          '',
          '*  [This is removed](#this-is-removed)'
        ].join('\n')
      )
      .messages.map(String),
    [],
    'should ignore final gaps'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync('')
      .messages.map(String),
    ['1:1: Error'],
    'should support empty documents'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.position.end, 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync('# README\n')
      .messages.map(String),
    ['2:1: Error'],
    'should message at the end of the document'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1].position.end, 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync('# README\n\n*   List')
      .messages.map(String),
    ['3:9: Error'],
    'should message at the end of the document'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'foo:bar')
          file.message('Error', tree.children[3], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync(
        [
          '<!--foo disable bar-->',
          '',
          'This is a paragraph.',
          '',
          '<!--foo disable bar-->',
          '',
          'This is a paragraph.'
        ].join('\n')
      )
      .messages.map(String),
    [],
    'should ignore double disables'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo'})
        return transform
        function transform(tree, file) {
          file.message('Error', 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync('Foo')
      .messages.map(String),
    ['1:1: Error'],
    'should not ignore messages without location information'
  )

  t.deepEqual(
    remark()
      .use(function () {
        return remarkMessageControl({name: 'foo'})
      })
      .processSync('<!doctype html>\n\n<!--bar baz qux-->')
      .messages.map(String),
    [],
    'should ignore non-markers'
  )

  t.deepEqual(
    remark()
      .use(function () {
        return remarkMessageControl({name: 'foo', known: ['known']})
      })
      .processSync('<!--foo ignore known-->\n\n<!--foo ignore unknown-->')
      .messages.map(String),
    ["3:1-3:26: Unknown rule: cannot ignore `'unknown'`"],
    'should support a list of `known` values, and warn on unknowns'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo', source: 'baz'})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'baz:bar')
          transformer(tree, file)
        }
      })
      .processSync('<!--foo ignore bar-->\n\nFoo')
      .messages.map(String),
    [],
    'should ignore by `source`, when given as a string'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({
          name: 'alpha',
          source: ['bravo', 'charlie']
        })
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[1], 'bravo:delta')
          file.message('Error', tree.children[3], 'charlie:echo')
          transformer(tree, file)
        }
      })
      .processSync(
        [
          '<!--alpha ignore delta-->',
          '',
          'Foxtrot',
          '',
          '<!--alpha ignore echo-->',
          '',
          'Golf'
        ].join('\n')
      )
      .messages.map(String),
    [],
    'should ignore by `source`, when given as an array'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({name: 'foo', disable: ['bar']})
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[0], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync('This is a paragraph.')
      .messages.map(String),
    [],
    'should support initial `disable`s'
  )

  t.deepEqual(
    remark()
      .use(function () {
        var transformer = remarkMessageControl({
          name: 'foo',
          reset: true,
          enable: ['bar']
        })
        return transform
        function transform(tree, file) {
          file.message('Error', tree.children[0], 'foo:bar')
          transformer(tree, file)
        }
      })
      .processSync('This is a paragraph.')
      .messages.map(String),
    ['1:1-1:21: Error'],
    'should support initial `enable`s'
  )

  t.end()
})
