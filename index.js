import control from 'unified-message-control'
import marker from 'mdast-comment-marker'

var test = [
  'html', // Comments are `html` nodes in mdast.
  'comment' // In MDX, comments have their own node.
]

export default function remarkMessageControl(options) {
  return control(Object.assign({marker, test}, options))
}
