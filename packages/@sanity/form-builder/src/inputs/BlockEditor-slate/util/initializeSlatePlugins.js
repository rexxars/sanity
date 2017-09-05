import insertBlockOnEnter from 'slate-insert-block-on-enter'
import softBreak from 'slate-soft-break'
import onDrop from '../plugins/onDrop'
import formBuilderNodeOnPaste from '../plugins/formBuilderNodeOnPaste'
import onModKeySetMarkCombos from '../plugins/onModKeySetMarkCombos'
import onEnterInListItem from '../plugins/onEnterInListItem'
import textBlockOnEnterKey from '../plugins/textBlockOnEnterKey'
import editorOnPasteHtml from '../plugins/editorOnPasteHtml'

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
    editorOnPasteHtml(blockEditor),
    formBuilderNodeOnPaste(blockEditor.context.formBuilder, blockEditor.props.type.of),

    // Key handling
    onEnterInListItem(SLATE_DEFAULT_STYLE, blockEditor.refreshCSS),
    textBlockOnEnterKey(SLATE_DEFAULT_STYLE),

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
