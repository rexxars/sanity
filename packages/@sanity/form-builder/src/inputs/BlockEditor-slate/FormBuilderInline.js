import PropTypes from 'prop-types'
import React from 'react'

import ReactDOM from 'react-dom'
import OffsetKey from 'slate/lib/utils/offset-key'
import {Selection} from 'slate'
import ItemForm from './ItemForm'
import FullscreenDialog from 'part:@sanity/components/dialogs/fullscreen'
import Preview from '../../Preview'
import styles from './styles/FormBuilderInline.css'
import createRange from './util/createRange'
import {applyAll} from '../../simplePatch'
import {resolveTypeName} from '../../utils/resolveTypeName'
import InvalidValue from '../InvalidValue'

export default class FormBuilderInline extends React.Component {
  static propTypes = {
    // Note: type refers to the array type, not the value type
    type: PropTypes.object,
    node: PropTypes.object,
    editor: PropTypes.object,
    state: PropTypes.object,
    attributes: PropTypes.object
  }

  state = {
    isSelected: false,
    isFocused: false,
    isEditing: false,
    isDragging: false
  }

  _dropTarget = null
  _editorNode = null

  componentWillUpdate(nextProps) {
    const {node} = this.props
    const selection = nextProps.state.selection
    if (selection !== this.props.state.selection) {
      const isFocused = selection.hasFocusIn(node)
      this.setState({isFocused})
    }
  }

  componentDidMount() {
    this.addSelectionHandler()
  }

  componentWillUnmount() {
    this.removeSelectionHandler()
  }

  handleChange = event => {
    const {node, editor} = this.props
    const next = editor.getState()
      .transform()
      .setNodeByKey(node.key, {
        data: {value: applyAll(node.data.get('value'), event.patches)}
      })
      .apply()

    editor.onChange(next)
  }

  handleInvalidValueChange = event => {
    // the setimeout is a workaround because there seems to be a race condition with clicks and state updates
    setTimeout(() => {
      const {node, editor} = this.props

      const nextValue = applyAll(node.data.get('value'), event.patches)

      const nextState = (nextValue === undefined)
        ? editor.getState()
          .transform()
          .removeNodeByKey(node.key)
          .apply()
        : editor.getState()
          .transform()
          .setNodeByKey(node.key, {
            data: {value: nextValue}
          })
          .apply()

      editor.onChange(nextState)
    }, 0)
  }

  handleDragStart = event => {
    const {editor} = this.props
    this._editorNode = ReactDOM.findDOMNode(editor)

    this.setState({isDragging: true})
    this.addDragHandlers()

    const element = ReactDOM.findDOMNode(this.previewContainer)
    event.dataTransfer.setData('text/plain', event.target.id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setDragImage(element, (element.clientWidth / 2), -10)
  }

  addSelectionHandler() {
    document.addEventListener('selectionchange', this.handleSelectionChange)
  }

  removeSelectionHandler() {
    document.removeEventListener('selectionchange', this.handleSelectionChange)
  }

  addDragHandlers() {
    this._editorNode.addEventListener('dragover', this.handleDragOverOtherNode)
    this._editorNode.addEventListener('dragleave', this.handleDragLeave)
  }

  removeDragHandlers() {
    this._editorNode.removeEventListener('dragover', this.handleDragOverOtherNode)
    this._editorNode.removeEventListener('dragleave', this.handleDragLeave)
  }

  handleSelectionChange = event => {
    const selection = document.getSelection()
    const isSelected = selection.containsNode
        && selection.containsNode(this.formBuilderInline)
    this.setState({isSelected})
  }

  // Remove the drop target if we leave the editors nodes
  handleDragLeave = event => {
    if (event.target === this._editorNode) {
      this._dropTarget = null
    }
  }

  handleDragOverOtherNode = event => {

    if (!this.state.isDragging) {
      return
    }

    const targetDOMNode = event.target

    // As the event is registered on the editor parent node
    // ignore the event if it is coming from from the editor node itself
    if (targetDOMNode === this._editorNode) {
      this._dropTarget = null
      return
    }

    const offsetKey = OffsetKey.findKey(targetDOMNode, 0)
    if (!offsetKey) {
      return
    }
    const {key} = offsetKey

    // If this is 'our' node, return
    if (this.props.node.hasDescendant(key)) {
      return
    }

    const {editor} = this.props
    const state = editor.getState()
    const {document} = state

    const range = createRange(event)

    if (range === null) {
      return
    }

    const {rangeOffset} = range

    const node = document.getDescendant(key)

    if (!node) {
      this._dropTarget = null
      return
    }

    // If we are dragging over a custom type block return
    const block = document.getClosestBlock(node.key)
    if (block && block.type !== 'contentBlock') {
      return
    }

    // If we are dragging over another inline return
    if (document.getClosestInline(node.key)) {
      return
    }

    this._dropTarget = {node: node, offset: rangeOffset}
    this.moveCursor(rangeOffset, node)
  }

  handleDragEnd = event => {

    this.setState({isDragging: false})
    this.removeDragHandlers()

    if (!this._dropTarget) {
      return
    }

    const {editor, node} = this.props
    const state = editor.getState()
    const next = state.transform()
      .removeNodeByKey(node.key)
      .insertInline(node)
      .focus()
      .apply()
    this._dropTarget = null
    editor.onChange(next)
  }

  handleCancelEvent = event => {
    event.preventDefault()
  }

  getValue() {
    return this.props.node.data.get('value')
  }

  handleToggleEdit = () => {
    this.setState({isEditing: true})
  }

  handleClose = () => {
    this.setState({isEditing: false})
  }

  getMemberTypeOf(value) {
    const typeName = resolveTypeName(value)
    return this.props.type.of.find(memberType => memberType.name === typeName)
  }

  renderPreview() {
    const value = this.getValue()
    const memberType = this.getMemberTypeOf(value)
    if (!memberType) {
      const validMemberTypes = this.props.type.of.map(type => type.name)
      const actualType = resolveTypeName(value)
      return (
        <InvalidValue
          validTypes={validMemberTypes}
          actualType={actualType}
          value={value}
          onChange={this.handleInvalidValueChange}
        />
      )
    }
    return (
      <span onClick={this.handleToggleEdit}>
        <Preview
          type={memberType}
          value={this.getValue()}
          layout="inline"
        />
      </span>
    )
  }

  refFormBuilderInline = formBuilderInline => {
    this.formBuilderInline = formBuilderInline
  }

  refPreview = previewContainer => {
    this.previewContainer = previewContainer
  }

  renderInput() {
    const value = this.getValue()
    const memberType = this.getMemberTypeOf(value)

    return (
      <FullscreenDialog
        isOpen
        title={this.props.node.title}
        onClose={this.handleClose}
      >
        <ItemForm
          onDrop={this.handleCancelEvent}
          type={memberType}
          level={0}
          value={this.getValue()}
          onChange={this.handleChange}
        />
      </FullscreenDialog>
    )
  }

  moveCursor(offset, node) {
    if (node.kind !== 'text') {
      return
    }
    const {editor} = this.props
    const state = editor.getState()
    const {document} = state
    let theOffset = offset

    // Check if it is acceptable to move the cursor here
    const nextChars = document.getCharactersAtRange(
      Selection.create({
        anchorKey: node.key,
        focusKey: node.key,
        anchorOffset: offset - 1,
        focusOffset: offset,
        isFocused: true,
        isBackward: false
      })
    )
    if (!nextChars.size) {
      theOffset = 0
    }

    const nextState = state.transform()
      .collapseToStartOf(node)
      .move(theOffset)
      .focus()
      .apply()
    editor.onChange(nextState)
  }

  render() {
    const {isEditing} = this.state
    const {attributes} = this.props

    let className
    if (this.state.isFocused) {
      className = styles.focused
    } else if (this.state.isSelected) {
      className = styles.selected
    } else {
      className = styles.root
    }

    return (
      <span
        {...attributes}
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
        draggable
        ref={this.refFormBuilderInline}
        className={className}
      >
        <span
          ref={this.refPreview}
          className={styles.previewContainer}
        >
          {this.renderPreview()}
        </span>

        {isEditing && (
          <span className={styles.editBlockContainer}>
            {this.renderInput()}
          </span>
        )}
      </span>
    )
  }
}
