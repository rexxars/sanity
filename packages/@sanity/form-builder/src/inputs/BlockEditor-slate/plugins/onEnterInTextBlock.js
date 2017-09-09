// This plugin inserts an empty default node after enter is pressed
// within a text block which is not a default node type (normal)
// Meaning: when enter is pressed within a title start a new empty
// normal block below

function createOnKeyDown(insertBlockStyle) {
  return function onKeyDown(event, data, change) {
    if (data.key !== 'enter') {
      return null
    }
    const state = change.state
    const isTextBlock = state.blocks.some(block => block.data.get('style'))
    const isDefaultNode = state.blocks.some(block => block.data.get('style') === insertBlockStyle)
    const isListNode = state.blocks.some(block => block.data.get('listItem'))
    const {startBlock} = state
    if (isListNode || !isTextBlock || state.selection.isExpanded || !state.selection.hasEndAtEndOf(startBlock)) {
      return null
    }
    if (!isDefaultNode) {
      change.insertBlock({
        type: 'contentBlock',
        data: {
          style: insertBlockStyle
        }
      })
      event.preventDefault()
      return change
    }
    return null
  }
}

function textBlockOnEnterKey(insertBlockStyle) {
  return {
    onKeyDown: createOnKeyDown(insertBlockStyle)
  }
}

export default textBlockOnEnterKey
