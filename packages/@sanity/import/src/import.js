const streamToArray = require('./streamToArray')
const {getAssetRefs, unsetAssetRefs} = require('./assetRefs')
const {getStrongRefs, weakenStrongRefs} = require('./references')

async function importFromStream(stream) {
  // Get raw documents from the stream
  const docs = await streamToArray(stream)

  // Extract asset references from the documents
  const assetRefs = docs.map(getAssetRefs)

  // Remove asset references from the documents
  const assetless = docs.map(unsetAssetRefs)

  // Find references that will need strengthening when import is done
  const strongRefs = docs.map(getStrongRefs)

  // Make strong references weak so they can be imported in any order
  const weakened = assetless.map(weakenStrongRefs)
}

module.exports = importFromStream
