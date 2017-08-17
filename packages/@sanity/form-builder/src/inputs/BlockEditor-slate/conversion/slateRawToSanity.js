// Converts a persisted array to a slate compatible json document
import {get, flatten} from 'lodash'
import randomKey from '../util/randomKey'

function toSanitySpan(blockNode, sanityBlock) {
  if (blockNode.kind === 'text') {
    return blockNode.ranges
      .map(range => {
        return {
          _type: 'span',
          text: range.text,
          marks: range.marks.map(mark => mark.type)
        }
      })
  }
  if (blockNode.kind === 'inline') {
    const {nodes, data} = blockNode
    return flatten(nodes.map(node => {
      if (node.kind !== 'text') {
        throw new Error(`Unexpected non-text child node for inline text: ${node.kind}`)
      }
      const annotations = data.value
      const annotationKeys = []
      if (annotations) {
        Object.keys(annotations).forEach(name => {
          const annotationKey = randomKey(8)
          const entry = annotations[name]
          console.log(entry)
          delete entry._key
          entry._name = name
          sanityBlock.markDefs[annotationKey] = entry
          annotationKeys.push(annotationKey)
        })
      }
      return node.ranges
        .map(range => ({
          _type: 'span',
          text: range.text,
          marks: range.marks.map(mark => mark.type).concat(annotationKeys),
        }))
    }))
  }
  throw new Error(`Unsupported kind ${blockNode.kind}`)
}

function toSanityBlock(block) {
  // debugger
  if (block.type === 'contentBlock' /*<-- hack should probably be fixed better */ || block.type === 'paragraph' /* -->*/) {
    const sanityBlock = {
      ...block.data,
      _type: 'block',
      markDefs: {}
    }
    sanityBlock.children = flatten(block.nodes.map(node => {
      return toSanitySpan(node, sanityBlock)
    }))
    return sanityBlock
  }
  return block.data.value
}

function isEmpty(blocks) {
  if (blocks.length === 0) {
    return true
  }
  if (blocks.length > 1) {
    return false
  }
  const firstBlock = blocks[0]
  if (firstBlock._type !== 'block') {
    return false
  }
  const children = firstBlock.children
  if (children.length === 0) {
    return true
  }
  if (children.length > 1) {
    return false
  }
  const firstChild = children[0]
  if (firstChild._type !== 'span') {
    return false
  }
  return firstChild.text.length === 0
}

export default function slateRawToSanity(raw) {
  const nodes = get(raw, 'document.nodes')
  if (!nodes || nodes.length === 0) {
    return undefined
  }
  const blocks = nodes.map(toSanityBlock).filter(Boolean)
  return isEmpty(blocks) ? undefined : blocks
}
