import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'

import DefaultButton from 'part:@sanity/components/buttons/default'
import EditItemPopOver from 'part:@sanity/components/edititem/popover'
import Field from '../Object/Field'
import styles from './styles/FormBuilderSpan.css'
import {applyAll} from '../../simplePatch'
import {isEqual} from 'lodash'

export default class FormBuilderSpan extends React.Component {
  static propTypes = {
    type: PropTypes.object,
    editor: PropTypes.object,
    state: PropTypes.object,
    attributes: PropTypes.object,
    children: PropTypes.node,
    node: PropTypes.object
  }

  state = {isFocused: false, isEditing: false}
  _clickCounter = 0
  _isMarkingText = false
  _editorNodeRect = null
  _memberFields = []

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.isEditing !== this.state.isEditing
      || nextState.rootElement !== this.state.rootElement
      || nextProps.state.focusOffset !== this.props.state.focusOffset
      || !isEqual(nextProps.node.data.get('annotations'), this.props.node.data.get('annotations'))
      || nextProps.node.data.get('fieldBeingEdited') !== this.props.node.data.get('fieldBeingEdited')
  }

  componentWillUpdate(nextProps, nextState) {
    const {node} = this.props
    const {state} = nextProps
    const selection = state.selection
    const isFocused = selection.hasFocusIn(node)

    if (selection !== this.props.state.selection) {
      if (!isFocused) {
        this.setState({isEditing: false, ...{isFocused}})
      }
    }
    this._memberFields = nextProps.type.fields.filter(field => {
      return !['text', 'decorators'].includes(field.name)
    })
  }

  componentDidUpdate() {
    if (this.isEmpty() && this.state.isEditing && !this.getAnnotationBeingEdited()) {
      this.handleCloseInput()
    }
  }

  componentWillMount() {
    if (this.isEmpty()) {
      this.setState({isEditing: true})
    }
  }

  componentDidMount() {
    this._editorNodeRect = ReactDOM.findDOMNode(this.props.editor).getBoundingClientRect()
  }

  isEmpty() {
    const value = this.getAnnotations()
    if (!value) {
      return true
    }
    return !value.filter(field => {
      return !this.isEmptyField(field)
    }).length
  }

  isEmptyField = field => {
    return isEqual(Object.keys(field.value), ['_type', '_key'])
  }

  getAnnotations() {
    return this.props.node.data.get('annotations')
  }

  getAnnotationBeingEdited() {
    return this.props.node.data.get('annotationBeingEdited')
  }

  handleCloseInput = () => {
    // Let it happen after focus is set in the editor (state may be out of sync)
    this.props.editor.focus()
    setTimeout(() => {
      if (this.state.isEditing) {
        this.setState({isEditing: false})
      }
      this.cleanUpAfterDialogClosed()
    }, 100)
  }

  handleRemove = () => {
    this.props.editor.props.blockEditor
      .operations
      .removeSpan(this.props.node)
  }

  cleanUpAfterDialogClosed() {
    const value = this.getAnnotations()
    if (value) {
      Object.keys(value).forEach(key => {
        if (this.isEmptyField(value[key])) {
          delete value[key]
        }
      })
    }
    const {editor, node} = this.props
    if (value && !Object.keys(value).length) {
      this.handleRemove()
      return
    }
    const next = editor.getState()
      .transform()
      .setNodeByKey(node.key, {
        data: {
          fieldBeingEdited: undefined,
          value: value
        }
      })
      .apply()

    editor.onChange(next)
  }

  setFieldBeingEdited(fieldName) {
    const {editor, node} = this.props
    const next = editor.getState()
      .transform()
      .setNodeByKey(node.key, {
        data: {
          fieldBeingEdited: fieldName,
          value: node.data.get('value')
        }
      })
      .apply()
    editor.onChange(next)
  }

  // Open dialog when user clicks the node,
  // but support double clicks, and mark text as normal
  handleMouseDown = () => {
    this._isMarkingText = true
    setTimeout(() => {
      if (this._clickCounter === 1 && !this._isMarkingText) {
        this.setState({isEditing: true})
      }
      this._clickCounter = 0
    }, 350)
    this._clickCounter++
  }

  handleMouseUp = () => {
    this._isMarkingText = false
  }

  handleFieldChange = (event, field) => {
    const {node, editor} = this.props
    const next = editor.getState()
      .transform()
      .setNodeByKey(node.key, {
        data: {
          annotationBeingEdited: this.getAnnotationBeingEdited(),
          annotations: applyAll(node.data.get('annotations').map(annotation => annotation.value), event.prefixAll(field.name).patches)
        }
      })
      .apply()
    editor.onChange(next)
  }

  renderInput() {
    const annotations = this.getAnnotations()
    const style = {}
    if (this.state.rootElement) {
      const {width, height, left} = this.state.rootElement.getBoundingClientRect()
      style.width = `${width}px`
      style.height = `${height}px`
      style.left = `${left - this._editorNodeRect.left}px`
      style.top = `${this.state.rootElement.offsetTop + height + 10}px`
    }
    const annotationBeingEdited = this.getAnnotationBeingEdited()
    let fieldBeingEdited
    if (this._memberFields.length === 1) {
      fieldBeingEdited = this.memberFields[0]
    } else if (annotations && annotations.length === 1) {
      fieldBeingEdited = this._memberFields.find(memberField => {
        return memberField.name === annotations[0].type.name
      })
    } else if (annotationBeingEdited) {
      fieldBeingEdited = this._memberFields.find(memberField => {
        return memberField.name === annotationBeingEdited
      })
    }
    const fieldValue = fieldBeingEdited && annotations && annotations.find(annotation => annotation.type.name === fieldBeingEdited)
    return (
      <span className={styles.editSpanContainer} style={style}>
        <EditItemPopOver
          onClose={this.handleCloseInput}
        >
          { !fieldBeingEdited && (
            <div>
              {
                this._memberFields.map(memberField => {
                  if (!annotations || !annotations.length || !annotations.find(annotation => annotation.type.name === memberField.name)) {
                    return null
                  }
                  const setFieldFunc = () => {
                    this.setFieldBeingEdited(memberField.name)
                  }
                  return (
                    <DefaultButton
                      key={`memberField${memberField.name}`}
                      onClick={setFieldFunc}
                    >
                      {memberField.type.title}
                    </DefaultButton>
                  )
                })
              }
            </div>
          )}

          { fieldBeingEdited && (
            <Field
              field={fieldBeingEdited}
              level={0}
              value={fieldValue}
              onChange={this.handleFieldChange}
            />
          )}
        </EditItemPopOver>
      </span>
    )
  }

  getCustomFields() {
    return this.props.type.fields
      .filter(field => field.name !== 'text' && field.name !== 'marks')
  }


  setRootElement = element => {
    this.setState({rootElement: element})
  }

  render() {
    const {isEditing} = this.state
    const {attributes} = this.props
    return (
      <span
        {...attributes}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        className={styles.root}
        ref={this.setRootElement}
      >
        {this.props.children}

        { isEditing && this.renderInput() }

      </span>
    )
  }
}
