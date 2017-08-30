// This plugin is responsible for preparing data
// from a drag event onto the editor nodes

function noOp(state) {
  return state.transform().apply()
}

function onDrop(event, data, state, editor) {

  // Cancel the default Slate handling for void nodes
  // (we deal with it within our ForbuilderBlock/FormbulderInline code)
  if (data.type === 'node' && data.node.isVoid) {
    event.preventDefault()
    return noOp(state)
  }

  const {isInternal, type} = data

  // Let slate deal with all other internal drops
  if (isInternal) {
    return null
  }

  // Let slate deal with text drops from outside
  if (type === 'text') {
    return null
  }

  // Nothing else implemented for now
  // TODO: implement image drop?
  return noOp(state)

}

export default () => {
  return {onDrop}
}
