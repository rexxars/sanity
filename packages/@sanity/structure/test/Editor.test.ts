import {StructureBuilder as S} from '../src'
import {getDefaultSchema} from '../src/parts/Schema'

test('builds editor node through constructor', () => {
  expect(
    S.editor({
      id: 'foo',
      title: 'some title',
      options: {
        id: 'docId',
        type: 'book'
      }
    }).serialize()
  ).toMatchSnapshot()
})

test('throws on missing id', () => {
  expect(() =>
    S.editor()
      .documentId('docId')
      .schemaType('book')
      .serialize()
  ).toThrowError(/`id` is required/)
})

test('infers ID from title if not specified', () => {
  expect(
    S.editor()
      .title('Hei der')
      .getId()
  ).toEqual('heiDer')
  expect(
    S.editor()
      .id('zing')
      .title('Hei der')
      .getId()
  ).toEqual('zing')
  expect(
    S.editor()
      .title('Hei der')
      .id('blah')
      .getId()
  ).toEqual('blah')
})

test('throws on missing document ID', () => {
  expect(() =>
    S.editor()
      .id('id')
      .title('title')
      .schemaType('book')
      .serialize()
  ).toThrowError(/document id/)
})

test('can construct with schema type instead of schema type name', () => {
  expect(
    S.editor()
      .schemaType(getDefaultSchema().get('post'))
      .id('yeah')
      .title('Yeah')
      .documentId('wow')
      .serialize()
  ).toMatchSnapshot()
})

test('can construct using builder', () => {
  expect(
    S.editor()
      .id('yeah')
      .title('Yeah')
      .documentId('wow')
      .schemaType('book')
      .serialize()
  ).toMatchSnapshot()
})

test('can construct using builder (alt)', () => {
  expect(
    S.editor()
      .schemaType('book')
      .id('yeah')
      .title('Yeah')
      .documentId('wow')
      .serialize()
  ).toMatchSnapshot()
})

test('builder is immutable', () => {
  const original = S.editor()
  expect(original.id('foo')).not.toEqual(original)
  expect(original.title('foo')).not.toEqual(original)
  expect(original.documentId('moo')).not.toEqual(original)
  expect(original.schemaType('author')).not.toEqual(original)
})

test('getters work', () => {
  const original = S.editor()
  expect(original.id('foo').getId()).toEqual('foo')
  expect(original.title('bar').getTitle()).toEqual('bar')
  expect(original.documentId('moo').getDocumentId()).toEqual('moo')
  expect(original.schemaType('author').getSchemaType()).toEqual('author')
})
