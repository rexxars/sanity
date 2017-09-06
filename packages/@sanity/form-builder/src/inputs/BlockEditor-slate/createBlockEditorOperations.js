import {SLATE_DEFAULT_STYLE, SLATE_SPAN_TYPE} from './constants'
import {createProtoValue} from './createProtoValue'
import randomKey from './util/randomKey'

export default function createBlockEditorOperations(blockEditor) {

  function onChange(change) {
    return blockEditor.props.onChange(change)
  }

  function getState() {
    // Work on absolutely current state of the slate editor
    // blockEditor.props.value (state) could potentially be out of sync
    return blockEditor.editor.getState()
  }

  return {

    createFormBuilderSpan(annotationType) {
      const state = getState()
      const {startOffset} = state
      let change

      if (state.isExpanded) {
        change = state.change()
      } else {
        change = this.expandToFocusedWord()
        if (!change) {
          // No word to expand to
          return null
        }
      }
      const key = randomKey(12)
      const span = {
        isVoid: false,
        type: SLATE_SPAN_TYPE,
        kind: 'inline',
        data: undefined,
        key: key
      }

      change = change
        .unwrapInline(SLATE_SPAN_TYPE)
        .wrapInline(span)

      // There is a bug (in Slate?) where if you
      // select the first word in a block text and try to
      // make a link of it, at this point, it says
      // that the range is not in the document
      // Move the selection back to the initial selection
      if (startOffset === 0 && state.isExpanded && state.inlines.size === 0) {
        change = change.select(state.selection)
      }

      // IDEA: get selected text and set it on the data
      // could be used to searching etc in the dialogue

      // // Get text of applied new selection
      // const selecetedText = nextState
      //   .startText
      //   .text
      //   .substring(
      //     nextState.selection.anchorOffset,
      //     nextState.selection.focusOffset
      //   )

      const currentSpan = blockEditor.props.value.inlines.filter(inline => inline.type == SLATE_SPAN_TYPE).toArray()[0]
      const data = {
        annotations: currentSpan ? currentSpan.data.get('annotations') || {} : {},
        focusedAnnotationName: annotationType.name
      }
      data.annotations[annotationType.name] = createProtoValue(annotationType, key)
      // Update the span with new data
      const finalChange = change
        .setInline({data: data})

      return onChange(finalChange)
    },

    removeAnnotationFromSpan(spanNode, annotationType) {
      const state = getState()
      const annotations = spanNode.data.get('annotations')
      if (!annotations) {
        return
      }
      // Remove the whole span if this annotation is the only one left
      if (Object.keys(annotations).length === 1 && annotations[annotationType.name]) {
        this.removeSpan(spanNode)
        return
      }
      // If several annotations, remove only this one and leave the node intact
      Object.keys(annotations).forEach(name => {
        if (annotations[name]._type === annotationType.name) {
          delete annotations[name]
        }
      })
      const data = {
        ...spanNode.data.toObject(),
        focusedAnnotationName: undefined,
        annotations: annotations
      }
      const nextChange = state.change()
        .setNodeByKey(spanNode.key, {data})

      onChange(nextChange)
    },

    removeSpan(spanNode) {
      const state = getState()
      let change
      if (Array.isArray(spanNode)) {
        change = state.change()
        spanNode.forEach(node => {
          change = change.unwrapInlineByKey(node.key)
        })
        change = change.focus()
      } else if (spanNode) {
        change = state.change()
          .unwrapInlineByKey(spanNode.key)
          .focus()
      } else {
        // Apply on current selection
        change = state.change()
          .unwrapInline(SLATE_SPAN_TYPE)
          .focus()
      }
      onChange(change)
    },

    toggleListItem(listItemName, isActive) {
      const state = getState()
      const normalBlock = {
        type: 'contentBlock',
        data: {style: SLATE_DEFAULT_STYLE}
      }
      const listItemBlock = {
        type: 'contentBlock',
        data: {listItem: listItemName, style: SLATE_DEFAULT_STYLE}
      }
      let change = state.change()

      if (isActive) {
        change = change
          .setBlock(normalBlock)
      } else {
        change = change
          .setBlock(listItemBlock)
      }
      const nextChange = change.focus()
      onChange(nextChange)
    },

    setBlockStyle(styleName) {
      const state = getState()
      const {selection, startBlock, endBlock} = state
      let change = state.change()

      // If a single block is selected partially, split block conditionally
      // (selection in start, middle or end of text)
      if (startBlock === endBlock
        && selection.isExpanded
        && !(
          selection.hasStartAtStartOf(startBlock)
          && selection.hasEndAtEndOf(startBlock
        )
      )) {
        const hasTextBefore = !selection.hasStartAtStartOf(startBlock)
        const hasTextAfter = !selection.hasEndAtEndOf(startBlock)
        if (hasTextAfter) {
          const extendForward = selection.isForward
            ? (selection.focusOffset - selection.anchorOffset)
            : (selection.anchorOffset - selection.focusOffset)
          change = change
            .collapseToStart()
            .splitBlock()
            .moveForward()
            .extendForward(extendForward)
            .collapseToEnd()
            .splitBlock()
            .collapseToStartOfPreviousText()
        } else {
          change = hasTextBefore ? (
            change
              .collapseToStart()
              .splitBlock()
              .moveForward()
          ) : (
            change
              .collapseToEnd()
              .splitBlock()
              .select(selection)
          )
        }
      }
      change.focus()

      // Do the actual style transform, only acting on type contentBlock
      state.blocks.forEach(blk => {
        const newData = {...blk.data.toObject(), style: styleName}
        if (blk.type === 'contentBlock') {
          change = change
            .setNodeByKey(blk.key, {data: newData})
        }
      })
      const nextChange = change.focus()
      onChange(nextChange)
    },

    insertBlock(type) {
      const state = getState()
      const key = randomKey(12)
      const props = {
        type: type.name,
        isVoid: true,
        key: key,
        data: {
          value: createProtoValue(type, key)
        }
      }

      const nextChange = state.change().insertBlock(props)
      onChange(nextChange)
    },

    insertInline(type) {
      const state = getState()
      const key = randomKey(12)
      const props = {
        type: type.name,
        isVoid: true,
        key: key,
        data: {
          value: createProtoValue(type, key)
        }
      }

      const nextChange = state.change().insertInline(props)
      onChange(nextChange)
    },

    toggleMark(mark) {
      const state = getState()
      const nextChange = state
        .change()
        .toggleMark(mark.type)
        .focus()
      onChange(nextChange)
    },

    expandToFocusedWord() {
      const state = getState()
      const {focusText, focusOffset} = state
      const charsBefore = focusText.characters.slice(0, focusOffset)
      const charsAfter = focusText.characters.slice(focusOffset, -1)
      const isEmpty = obj => obj.get('text').match(/\s/g)
      const whiteSpaceBeforeIndex = charsBefore.reverse().findIndex(obj => isEmpty(obj))

      const newStartOffset = (whiteSpaceBeforeIndex > -1)
        ? (charsBefore.size - whiteSpaceBeforeIndex)
        : -1

      const whiteSpaceAfterIndex = charsAfter.findIndex(obj => isEmpty(obj))
      const newEndOffset = charsBefore.size
          + (whiteSpaceAfterIndex > -1 ? whiteSpaceAfterIndex : (charsAfter.size + 1))

      // Not near any word, abort
      if (newStartOffset === newEndOffset) {
        return null
      }

      // Select and highlight current word
      return state.change()
        .moveOffsetsTo(newStartOffset, newEndOffset)
        .focus()
    },

    expandToNode(node) {
      return getState().change()
        .moveToRangeOf(node)
        .focus()
    }

  }
}
