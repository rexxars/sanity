import * as rules from './rules'
import * as helpers from './helpers'
import {DEFAULT_BLOCK_TYPE} from '../../constants'
import {Html} from 'slate'

class HtmlDeserializer {

  constructor(options = {}) {
    this.rules = rules.createRules(options)
  }

  deserialize(html) {
    const cleanedHtml = helpers.cleanHtml(html)
    const deserializer = new Html({
      rules: this.rules,
      defaultBlockType: DEFAULT_BLOCK_TYPE
    })
    return deserializer.deserialize(cleanedHtml)
  }
}

export default HtmlDeserializer
