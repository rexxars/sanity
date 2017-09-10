import {DEFAULT_BLOCK_TYPE} from '../../constants'
import * as helpers from './helpers'
import randomKey from '../../util/randomKey'
import {uniq} from 'lodash'
import createWordDocumentRules from './createWordDocumentRules'

const {styledBlock, tagName} = helpers

export const HTML_BLOCK_TAGS = {
  p: DEFAULT_BLOCK_TYPE,
  blockquote: styledBlock(DEFAULT_BLOCK_TYPE, {style: 'blockquote'})
}

export const HTML_SPAN_TAGS = {
  span: {kind: 'text'}
}

export const HTML_LIST_CONTAINER_TAGS = {
  ol: {kind: null},
  ul: {kind: null}
}

export const HTML_HEADER_TAGS = {
  h1: styledBlock(DEFAULT_BLOCK_TYPE, {style: 'h1'}),
  h2: styledBlock(DEFAULT_BLOCK_TYPE, {style: 'h2'}),
  h3: styledBlock(DEFAULT_BLOCK_TYPE, {style: 'h3'}),
  h4: styledBlock(DEFAULT_BLOCK_TYPE, {style: 'h4'}),
  h5: styledBlock(DEFAULT_BLOCK_TYPE, {style: 'h5'}),
  h6: styledBlock(DEFAULT_BLOCK_TYPE, {style: 'h6'})
}

export const HTML_MISC_TAGS = {
  br: styledBlock(DEFAULT_BLOCK_TYPE, {style: 'normal'}),
}
export const HTML_DECORATOR_TAGS = {

  b: 'strong',
  strong: 'strong',

  i: 'em',
  em: 'em',

  u: 'underline',
  s: 'strike-through',
  strike: 'strike-through',
  del: 'strike-through',

  code: 'code'
}

export const HTML_LIST_ITEM_TAGS = {
  li: DEFAULT_BLOCK_TYPE
}

export const elementMap = {
  ...HTML_BLOCK_TAGS,
  ...HTML_SPAN_TAGS,
  ...HTML_LIST_CONTAINER_TAGS,
  ...HTML_LIST_ITEM_TAGS,
  ...HTML_HEADER_TAGS,
  ...HTML_MISC_TAGS,
}

const supportedStyles = uniq(
  Object.keys(elementMap)
    .filter(tag => elementMap[tag].data && elementMap[tag].data.style)
    .map(tag => elementMap[tag].data.style)
)

const supportedDecorators = uniq(
  Object.keys(HTML_DECORATOR_TAGS)
    .map(tag => HTML_DECORATOR_TAGS[tag])
)

export function createRules(options) {

  const enabledStyles = options.enabledStyles || supportedStyles
  const enabledDecorators = options.enabledDecorators || supportedDecorators
  const enabledAnnotations = options.enabledAnnotations || ['link']

  return [

    ...createWordDocumentRules(options),

    // Special case for Google Docs which always
    // wrap the html data in a <b> tag :/
    {
      deserialize(el, next) {
        if (helpers.isPastedFromGoogleDocs(el)) {
          return next(el.childNodes)
        }
        return undefined
      }
    },

    // Blocks
    {
      deserialize(el, next) {
        const blocks = {...HTML_BLOCK_TAGS, ...HTML_HEADER_TAGS}
        let block = blocks[tagName(el)]
        if (!block) {
          return undefined
        }
        // Don't add blocks into list items
        if (el.parentNode && tagName(el) == 'li') {
          return next(el.childNodes)
        }
        // If style is not supported, return a defaultBlockType
        if (!enabledStyles.includes(block.data.style)) {
          block = DEFAULT_BLOCK_TYPE
        }
        return {
          ...block,
          nodes: next(el.childNodes)
        }
      }
    },

    // Ignore span tags
    {
      deserialize(el, next) {
        const span = HTML_SPAN_TAGS[tagName(el)]
        if (!span) {
          return undefined
        }
        return next(el.childNodes)
      }
    },

    // Ignore list containers
    {
      deserialize(el, next) {
        const listContainer = HTML_LIST_CONTAINER_TAGS[tagName(el)]
        if (!listContainer) {
          return undefined
        }
        return next(el.childNodes)
      }
    },

    // Deal with br's
    {
      deserialize(el, next) {
        if (tagName(el) == 'br') {
          return {
            kind: 'text',
            text: '\n'
          }
        }
        return undefined
      }
    },

    // Deal with list items
    {
      deserialize(el, next) {
        const listItem = HTML_LIST_ITEM_TAGS[tagName(el)]
        if (!listItem
            || !el.parentNode
            || !HTML_LIST_CONTAINER_TAGS[tagName(el.parentNode)]) {
          return undefined
        }
        return {
          ...styledBlock(
              listItem,
              {listItem: helpers.resolveListItem(tagName(el.parentNode))}
            ),
          nodes: next(el.childNodes)
        }
      }
    },

    // Deal with decorators
    {
      deserialize(el, next) {
        const decorator = HTML_DECORATOR_TAGS[tagName(el)]
        if (!decorator || !enabledDecorators.includes(decorator)) {
          return undefined
        }
        return {
          kind: 'mark',
          type: decorator,
          nodes: next(el.childNodes)
        }
      }
    },

    // Special case for hyperlinks, add annotation (if allowed by schema),
    // If not supported just write out the link text and href in plain text.
    {
      deserialize(el, next) {
        if (tagName(el) != 'a') {
          return undefined
        }
        const linkEnabled = enabledAnnotations.includes('link')
        const href = el.getAttribute('href')
        if (!href) {
          return next(el.childNodes)
        }
        let data
        if (linkEnabled) {
          data = {
            annotations: {
              link: {
                _key: randomKey(12),
                _type: 'link',
                href: href
              }
            }
          }
        }
        return {
          kind: 'inline',
          type: 'span',
          nodes: linkEnabled
            ? next(el.childNodes)
            : (
                el.appendChild(
                  new Text(` (${href})`)
                ) && next(el.childNodes)
              ),
          data: data
        }
      }
    },
    // {
    //   // Special case for code blocks (pre and code tag)
    //   deserialize(el, next) {
    //     if (tagName(el) != 'pre') {
    //       return null
    //     }
    //     const code = el.children[0]
    //     const childNodes = code && tagName(code) == 'code'
    //       ? code.childNodes
    //       : el.childNodes
    //     return {
    //       kind: 'block',
    //       type: 'code',
    //       nodes: next(childNodes)
    //     }
    //   }
    // },
  ]
}

