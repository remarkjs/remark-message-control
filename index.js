'use strict';

var control = require('unified-message-control');
var marker = require('mdast-comment-marker');

module.exports = function (options) {
  if (options) {
    options.marker = marker;
    options.test = 'html';
  }
  return control(options);
};
