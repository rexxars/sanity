import React from 'react'
import {Block, setKeyGenerator} from 'slate'
import createBlockNode from '../createBlockNode'
import createInlineNode from '../createInlineNode'
import createSpanNode from '../createSpanNode'
import mapToObject from './mapToObject'
import randomKey from '../util/randomKey'

import {getSpanType} from './spanHelpers'
import {SLATE_DEFAULT_STYLE} from '../constants'

// Content previews
import Blockquote from '../preview/Blockquote'
import Header from '../preview/Header'
import ListItem from '../preview/ListItem'
import Decorator from '../preview/Decorator'
import Normal from '../preview/Normal'

// Set our own key generator
const keyGenerator = () => randomKey(12)
setKeyGenerator(keyGenerator)

// When the slate-fields are rendered in the editor, their node data is stored in a parent container component.
// In order to use the node data as props inside our components, we have to dereference them here first (see list and header keys)
const slateTypeComponentMapping = {
  normal: Normal,
  h1(props) {
    return <Header level={1} {...props} />
  },
  h2(props) {  // eslint-disable-line react/no-multi-comp
    return <Header level={2} {...props} />
  },
  h3(props) {  // eslint-disable-line react/no-multi-comp
    return <Header level={3} {...props} />
  },
  h4(props) {  // eslint-disable-line react/no-multi-comp
    return <Header level={4} {...props} />
  },
  h5(props) {  // eslint-disable-line react/no-multi-comp
    return <Header level={5} {...props} />
  },
  h6(props) {  // eslint-disable-line react/no-multi-comp
    return <Header level={6} {...props} />
  },
  listItem(props) {  // eslint-disable-line react/no-multi-comp
    // eslint-disable-next-line react/prop-types
    const listItem = props.children[0] && props.children[0].props.parent.data.get('listItem')
    // eslint-disable-next-line react/prop-types
    const style = (props.children[0] && props.children[0].props.parent.data.get('style'))
      || SLATE_DEFAULT_STYLE
    const contentComponent = slateTypeComponentMapping[style]
    return <ListItem contentComponent={contentComponent} listItem={listItem} {...props} />
  },
  blockquote: Blockquote,
}

function createSlatePreviewNode(props) {
  let component = null
  const style = props.children[0] && props.children[0].props.parent.data.get('style')
  const isListItem = props.children[0] && props.children[0].props.parent.data.get('listItem')
  if (isListItem) {
    component = slateTypeComponentMapping.listItem
  } else {
    component = slateTypeComponentMapping[style]
  }
  if (!component) {
    // eslint-disable-next-line no-console
    console.warn(`No mapping for style '${style}' exists, using 'normal'`)
    component = slateTypeComponentMapping.normal
  }
  return component(props)
}

export default function prepareSlateForBlockEditor(blockEditor) {

  const type = blockEditor.props.type
  const blockType = type.of.find(ofType => ofType.name === 'block')
  if (!blockType) {
    throw new Error("'block' type is not defined in the schema (required).")
  }

  const styleField = blockType.fields.find(btField => btField.name === 'style')
  if (!styleField) {
    throw new Error("A field with name 'style' is not defined in the block type (required).")
  }

  const textStyles = styleField.type.options.list
    && styleField.type.options.list.filter(style => style.value)
  if (!textStyles || textStyles.length === 0) {
    throw new Error('The style fields need at least one style '
      + "defined. I.e: {title: 'Normal', value: 'normal'}.")
  }

  const listField = blockType.fields.find(btField => btField.name === 'list')
  let listItems = []
  if (listField) {
    listItems = listField.type.options.list
      && listField.type.options.list.filter(listStyle => listStyle.value)
  }


  const memberTypesExceptBlock = type.of.filter(ofType => ofType.name !== 'block')
  const spanType = getSpanType(type)
  const allowedDecorators = spanType.decorators.map(decorator => decorator.value)

  const FormBuilderBlock = createBlockNode(type)
  const FormBuilderInline = createInlineNode(type)

  const slateSchema = {
    nodes: {
      ...mapToObject(
        memberTypesExceptBlock,
        ofType => [
          ofType.name,
          ofType.options && ofType.options.inline ? FormBuilderInline : FormBuilderBlock
        ]
      ),
      __unknown: FormBuilderBlock,
      span: createSpanNode(spanType),
      contentBlock: createSlatePreviewNode,
    },
    marks: mapToObject(allowedDecorators, decorator => {
      return [decorator, Decorator]
    }),
    rules: [
      // Rule to insert a default block when document is empty
      {
        match: node => {
          return node.kind === 'document'
        },
        validate: document => {
          return document.nodes.size ? null : true
        },
        normalize: (change, document) => {
          const block = Block.create({
            type: 'contentBlock',
            data: {style: SLATE_DEFAULT_STYLE}
          })
          change
            .insertNodeByKey(document.key, 0, block)
            .focus()
        }
      },
      // Rule to unique annotation's _keys within a block (i.e. copy/pasted within the same block)
      {
        match: node => {
          return node.kind === 'block'
            && node.type === 'contentBlock'
            && node.filterDescendants(desc => {
              const annotations = desc.data && desc.data.get('annotations')
              return annotations && Object.keys(annotations).length
            }).size
        },
        validate: node => {
          const duplicateKeys = node.filterDescendants(
            desc => desc.data && desc.data.get('annotations')
          )
          .toArray()
          .map(aNode => {
            const annotations = aNode.data.get('annotations')
            return Object.keys(annotations).map(name => annotations[name]._key)
          })
          .reduce((a, b) => {
            return a.concat(b)
          }, [])
          .filter((key, i, keys) => keys.lastIndexOf(key) !== i)
          if (duplicateKeys.length) {
            return duplicateKeys.map(key => {
              return {
                dKey: key,
                aNode: node.filterDescendants(
                  desc => {
                    const annotations = desc.data && desc.data.get('annotations')
                    return annotations
                      && Object.keys(annotations)
                          .find(name => annotations[name]._key === key)
                  }).toArray().slice(-1)[0] // The last occurrence, most of the time the one we want
              }
            })
          }
          return null
        },
        normalize: (change, node, keysAndNodes) => {
          keysAndNodes.forEach(keyAndNode => {
            const {dKey, aNode} = keyAndNode
            const annotations = {...aNode.data.get('annotations')}
            const newAnnotations = {}
            Object.keys(annotations).forEach(name => {
              newAnnotations[name] = {...annotations[name]}
              if (annotations[name]._key === dKey) {
                newAnnotations[name]._key = randomKey(12)
              }
            })
            const data = {...aNode.data.toObject(), annotations: newAnnotations}
            change.setNodeByKey(aNode.key, {data})
          })
          blockEditor.props.onChange(change)
          return change
        }
      }
    ]
  }
  return {
    listItems: listItems,
    textStyles: textStyles,
    annotationTypes: spanType.annotations,
    decorators: spanType.decorators,
    customBlocks: memberTypesExceptBlock,
    slateSchema: slateSchema
  }
}
