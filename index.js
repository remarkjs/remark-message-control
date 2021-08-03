import unifiedMessageControl from 'unified-message-control'
import {commentMarker} from 'mdast-comment-marker'

var test = [
  'html', // Comments are `html` nodes in mdast.
  'comment' // In MDX, comments have their own node.
]

export default function remarkMessageControl(options) {
  return unifiedMessageControl(
    Object.assign({marker: commentMarker, test}, options)
  )
}
