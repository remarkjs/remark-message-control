/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('unified').Plugin<[], Root>} RemarkPlugin
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {remark} from 'remark'
import remarkMessageControl from 'remark-message-control'
import remarkToc from 'remark-toc'

test('remarkMessageControl', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('remark-message-control')).sort(),
      ['default']
    )
  })

  await t.test('should throw w/o options', async function () {
    try {
      // @ts-expect-error: check how the runtime handles missing `options`.
      await remark().use(remarkMessageControl).process('x')
      assert.fail()
    } catch (error) {
      assert.match(String(error), /Expected `name` in `options`/)
    }
  })

  await t.test('should “disable” a message', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.children[1]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo'})
      .process('<!--foo disable bar-->\n\nThis is a paragraph.')

    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test(
    'should “disable” all message without `ruleId`s',
    async function () {
      const file = await remark()
        .use(
          /** @type {RemarkPlugin} */
          function () {
            return function (tree, file) {
              file.message('Error', {
                place: tree.children[1]?.position,
                ruleId: 'bar',
                source: 'foo'
              })
            }
          }
        )
        .use(remarkMessageControl, {name: 'foo'})
        .process('<!--foo disable-->\n\nThis is a paragraph.')

      assert.deepEqual(file.messages.map(String), [])
    }
  )

  await t.test('should support `reset`', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.children[0]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
            file.message('Error', {
              place: tree.children[2]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo', reset: true})
      .process(
        [
          'This is a paragraph.',
          '',
          '<!--foo enable-->',
          '',
          'This is a paragraph.'
        ].join('\n')
      )

    assert.deepEqual(file.messages.map(String), ['5:1-5:21: Error'])
  })

  await t.test('should enable with a marker, when `reset`', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.children[1]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo', reset: true})
      .process('<!--foo enable bar-->\n\nThis is a paragraph.')

    assert.deepEqual(file.messages.map(String), ['3:1-3:21: Error'])
  })

  await t.test('should enable a message', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.children[1]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
            file.message('Error', {
              place: tree.children[3]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo'})
      .process(
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

    assert.deepEqual(file.messages.map(String), ['7:1-7:21: Error'])
  })

  await t.test(
    'should enable all message without `ruleId`s',
    async function () {
      const file = await remark()
        .use(
          /** @type {RemarkPlugin} */
          function () {
            return function (tree, file) {
              file.message('Error', {
                place: tree.children[1]?.position,
                ruleId: 'bar',
                source: 'foo'
              })
              file.message('Error', {
                place: tree.children[3]?.position,
                ruleId: 'bar',
                source: 'foo'
              })
            }
          }
        )
        .use(remarkMessageControl, {name: 'foo'})
        .process(
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

      assert.deepEqual(file.messages.map(String), ['7:1-7:21: Error'])
    }
  )

  await t.test('should ignore a message', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.children[1]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
            file.message('Error', {
              place: tree.children[2]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo'})
      .process(
        [
          '<!--foo ignore bar-->',
          '',
          'This is a paragraph.',
          '',
          'This is a paragraph.'
        ].join('\n')
      )

    assert.deepEqual(file.messages.map(String), ['5:1-5:21: Error'])
  })

  await t.test(
    'should ignore all message without `ruleId`s',
    async function () {
      const file = await remark()
        .use(
          /** @type {RemarkPlugin} */
          function () {
            return function (tree, file) {
              file.message('Error', {
                place: tree.children[1]?.position,
                ruleId: 'bar',
                source: 'foo'
              })
              file.message('Error', {
                place: tree.children[2]?.position,
                ruleId: 'bar',
                source: 'foo'
              })
            }
          }
        )
        .use(remarkMessageControl, {name: 'foo'})
        .process(
          [
            '<!--foo ignore-->',
            '',
            'This is a paragraph.',
            '',
            'This is a paragraph.'
          ].join('\n')
        )

      assert.deepEqual(file.messages.map(String), ['5:1-5:21: Error'])
    }
  )

  await t.test('should ignore multiple rules', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.children[1]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
            file.message('Error', {
              place: tree.children[1]?.position,
              ruleId: 'baz',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo'})
      .process('<!--foo ignore bar baz-->\n\nThis is a paragraph.')

    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test('should fail on invalid verbs', async function () {
    try {
      await remark()
        .use(remarkMessageControl, {name: 'foo'})
        .process('<!--foo test-->')

      assert.fail()
    } catch (error) {
      assert.match(
        String(error),
        /^1:1-1:16: Unknown keyword `test`: expected `'enable'`, `'disable'`, or `'ignore'`/
      )
    }
  })

  await t.test('should ignore gaps', async function () {
    const file = await remark()
      .use(remarkToc)
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (_, file) {
            file.message('Error', {
              place: {line: 5, column: 1},
              ruleId: 'bar',
              source: 'foo'
            })
            file.message('Error', {
              place: {line: 7, column: 1},
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo'})
      .process(
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

    assert.deepEqual(file.messages.map(String), ['7:1: Error'])
  })

  await t.test('should ignore final gaps', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: {line: 5, column: 1},
              ruleId: 'bar',
              source: 'foo'
            })
            file.message('Error', {
              place: {line: 5, column: 1},
              ruleId: 'bar',
              source: 'foo'
            })
            // Remove list.
            tree.children.pop()
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo'})
      .process(
        [
          '# README',
          '',
          '## Table of Contents',
          '',
          '*  [This is removed](#this-is-removed)'
        ].join('\n')
      )

    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test('should support empty documents', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (_, file) {
            file.message('Error', {
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo'})
      .process('')

    assert.deepEqual(file.messages.map(String), ['1:1: Error'])
  })

  await t.test('should message at the end of the document', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.position?.end,
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo'})
      .process('# README\n')

    assert.deepEqual(file.messages.map(String), ['2:1: Error'])
  })

  await t.test('should message at the end of the document', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.children[1]?.position?.end,
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo'})
      .process('# README\n\n*   List')

    assert.deepEqual(file.messages.map(String), ['3:9: Error'])
  })

  await t.test('should ignore double disables', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.children[1]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
            file.message('Error', {
              place: tree.children[3]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {name: 'foo'})
      .process(
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

    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test(
    'should not ignore messages without location information',
    async function () {
      const file = await remark()
        .use(
          /** @type {RemarkPlugin} */
          function () {
            return function (_, file) {
              file.message('Error', {ruleId: 'bar', source: 'foo'})
            }
          }
        )
        .use(remarkMessageControl, {name: 'foo'})
        .process('Foo')

      assert.deepEqual(file.messages.map(String), ['1:1: Error'])
    }
  )

  await t.test('should ignore non-markers', async function () {
    const file = await remark()
      .use(remarkMessageControl, {name: 'foo'})
      .process('<!doctype html>\n\n<!--bar baz qux-->')

    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test(
    'should support a list of `known` values, and warn on unknowns',
    async function () {
      const file = await remark()
        .use(remarkMessageControl, {known: ['known'], name: 'foo'})
        .process('<!--foo ignore known-->\n\n<!--foo ignore unknown-->')

      assert.deepEqual(file.messages.map(String), [
        "3:1-3:26: Cannot ignore `'unknown'`, it’s not known"
      ])
    }
  )

  await t.test(
    'should ignore by `source`, when given as a string',
    async function () {
      const file = await remark()
        .use(
          /** @type {RemarkPlugin} */
          function () {
            return function (tree, file) {
              file.message('Error', {
                place: tree.children[1]?.position,
                ruleId: 'bar',
                source: 'baz'
              })
            }
          }
        )
        .use(remarkMessageControl, {name: 'foo', source: 'baz'})
        .process('<!--foo ignore bar-->\n\nFoo')

      assert.deepEqual(file.messages.map(String), [])
    }
  )

  await t.test(
    'should ignore by `source`, when given as an array',
    async function () {
      const file = await remark()
        .use(
          /** @type {RemarkPlugin} */
          function () {
            return function (tree, file) {
              file.message('Error', {
                place: tree.children[1]?.position,
                ruleId: 'delta',
                source: 'bravo'
              })
              file.message('Error', {
                place: tree.children[3]?.position,
                ruleId: 'echo',
                source: 'charlie'
              })
            }
          }
        )
        .use(remarkMessageControl, {
          name: 'alpha',
          source: ['bravo', 'charlie']
        })
        .process(
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

      assert.deepEqual(file.messages.map(String), [])
    }
  )

  await t.test('should support initial `disable`s', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.children[0]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {
        disable: ['bar'],
        name: 'foo',
        reset: false
      })
      .process('This is a paragraph.')

    assert.deepEqual(file.messages.map(String), [])
  })

  await t.test('should support initial `enable`s', async function () {
    const file = await remark()
      .use(
        /** @type {RemarkPlugin} */
        function () {
          return function (tree, file) {
            file.message('Error', {
              place: tree.children[0]?.position,
              ruleId: 'bar',
              source: 'foo'
            })
          }
        }
      )
      .use(remarkMessageControl, {
        enable: ['bar'],
        name: 'foo',
        reset: true
      })
      .process('This is a paragraph.')

    assert.deepEqual(file.messages.map(String), ['1:1-1:21: Error'])
  })
})
