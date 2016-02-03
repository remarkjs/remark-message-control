var remark = require('remark');
var lint = require('remark-lint');
var report = require('vfile-reporter');
var control = require('./index.js');

remark()
    .use(function () {
        return function (tree, file) {
            var message = file.warn('Whoops!', tree.children[1]);

            message.ruleId = 'thing';
            message.source = 'foo';
        };
    })
    .use(control, {
        'name': 'foo'
    })
    .process([
        '<!--foo disable thing-->',
        '',
        '## Heading',
        ''
    ].join('\n'), function (err, file) {
        console.log(report(file));
        // <stdin>: no issues found
    });
