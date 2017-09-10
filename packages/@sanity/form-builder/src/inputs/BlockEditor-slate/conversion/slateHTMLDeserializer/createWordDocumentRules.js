import {DEFAULT_BLOCK_TYPE} from '../../constants'
import * as helpers from './helpers'

const {styledBlock, tagName} = helpers

function getListItemStyle(el) {
  return el.getAttribute('style').match('lfo1') ? 'bullet' : 'number'
}

function getListItemLevel(el) {
  return el.getAttribute('style').match(/level\d+/)[0].match(/\d/)[0]
}

function isWordListElement(el) {
  return el.className === 'MsoListParagraphCxSpFirst'
    || el.className === 'MsoListParagraphCxSpMiddle'
}

export default function (options) {
  return [
    {
      deserialize(el, next) {
        if (tagName(el) === 'p' && isWordListElement(el)) {
          return {
            ...styledBlock(
              DEFAULT_BLOCK_TYPE,
              {
                listItem: getListItemStyle(el),
                level: getListItemLevel(el)
              }
            ),
            nodes: next(el.childNodes)
          }
        }
        return undefined
      }
    }
  ]
}
