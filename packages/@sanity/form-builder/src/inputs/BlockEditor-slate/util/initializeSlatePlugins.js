import insertBlockOnEnter from 'slate-insert-block-on-enter'
import softBreak from 'slate-soft-break'
import onDrop from '../plugins/onDrop'
import onPasteSlateContent from '../plugins/onPasteSlateContent'
import onModKeySetMarkCombos from '../plugins/onModKeySetMarkCombos'
import onEnterInListItem from '../plugins/onEnterInListItem'
import onEnterInTextBlock from '../plugins/onEnterInTextBlock'
import onPasteHtml from '../plugins/onPasteHtml'
import onTabSetIntendation from '../plugins/onTabSetIntendation'

import {DEFAULT_BLOCK_TYPE} from '../constants'

export default function intializeSlatePlugins(blockEditor) {
  return [

    insertBlockOnEnter(DEFAULT_BLOCK_TYPE),
    softBreak({
      onlyIn: [DEFAULT_BLOCK_TYPE.type],
      shift: true
    }),

    onDrop(),

    onEnterInListItem(DEFAULT_BLOCK_TYPE, blockEditor.refreshCSS),

    onEnterInTextBlock(DEFAULT_BLOCK_TYPE),

    onModKeySetMarkCombos(blockEditor),

    onPasteHtml(blockEditor),

    onPasteSlateContent(blockEditor.context.formBuilder, blockEditor.props.type.of),

    onTabSetIntendation()

  ]
}
