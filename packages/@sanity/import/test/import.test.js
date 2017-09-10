const fs = require('fs')
const path = require('path')
const importer = require('../')
const assetRefs = require('../src/assetRefs')

const fixturesDir = path.join(__dirname, 'fixtures')
const getFixture = fix => {
  const fixPath = path.join(fixturesDir, `${fix}.ndjson`)
  return fs.createReadStream(fixPath, 'utf8')
}

test('rejects on invalid JSON', async () => {
  await expect(importer(getFixture('invalid-json'))).rejects.toHaveProperty(
    'message',
    'Failed to parse line #3: Unexpected token _ in JSON at position 1'
  )
})

test('rejects on missing `_id` property', async () => {
  await expect(importer(getFixture('missing-id'))).rejects.toHaveProperty(
    'message',
    'Failed to parse line #2: Document did not contain required "_id" property of type string'
  )
})

test('rejects on missing `_type` property', async () => {
  await expect(importer(getFixture('missing-type'))).rejects.toHaveProperty(
    'message',
    'Failed to parse line #3: Document did not contain required "_type" property of type string'
  )
})

/*
assetRefs({
  _id: 'movie_123',
  _type: 'movie',
  title: 'Rogue One',
  poster: {
    _sanityAsset:
      'image@https://cdn.sanity.io/images/q2tdbkqz/production/Y5bythpg4VBl8nRbQBnNSKs0-3000x1817.jpg?w=2000&fit=max&q=90'
  }
})
*/
