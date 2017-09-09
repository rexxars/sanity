import insertBlockOnEnter from 'slate-insert-block-on-enter'
import softBreak from 'slate-soft-break'
import onDrop from '../plugins/onDrop'
import onPasteSlateContent from '../plugins/onPasteSlateContent'
import onModKeySetMarkCombos from '../plugins/onModKeySetMarkCombos'
import onEnterInListItem from '../plugins/onEnterInListItem'
import onEnterInTextBlock from '../plugins/onEnterInTextBlock'
import onPasteHtml from '../plugins/onPasteHtml'
import onTabSetIntendation from '../plugins/onTabSetIntendation'

import {SLATE_DEFAULT_STYLE} from '../constants'

const insertBlockOnEnterDef = {
  type: 'contentBlock',
  kind: 'block',
  data: {
    style: SLATE_DEFAULT_STYLE
  }
}

export default function intializeSlatePlugins(blockEditor) {
  return [
    insertBlockOnEnter(insertBlockOnEnterDef),

    // Copy paste
    onPasteHtml(blockEditor),
    onPasteSlateContent(blockEditor.context.formBuilder, blockEditor.props.type.of),

    // Key handling
    onEnterInListItem(SLATE_DEFAULT_STYLE, blockEditor.refreshCSS),
    onEnterInTextBlock(SLATE_DEFAULT_STYLE),
    onTabSetIntendation(),

    // Set mark keyboard shortcuts
    onModKeySetMarkCombos(blockEditor),

    // Dropping stuff
    onDrop(),

    softBreak({
      onlyIn: ['contentBlock'],
      shift: true
    })
  ]
}
