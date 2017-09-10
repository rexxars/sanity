const {get} = require('lodash')
const {extractWithPath} = require('@sanity/mutator')
const serializePath = require('./serializePath')

function getStrongRefs(doc) {
  return {
    documentId: doc._id,
    references: findStrongRefs(doc).map(serializePath)
  }
}

// Note: mutates in-place
function weakenStrongRefs(doc) {
  const refs = findStrongRefs(doc)

  refs.forEach(item => {
    item.ref._weak = true
  })

  return doc
}

function findStrongRefs(doc) {
  return extractWithPath('..[_ref]', doc)
    .map(match => match.path.slice(0, -1))
    .map(path => ({path, ref: get(doc, path)}))
    .filter(item => item.ref._weak !== true)
}

exports.getStrongRefs = getStrongRefs
exports.weakenStrongRefs = weakenStrongRefs
