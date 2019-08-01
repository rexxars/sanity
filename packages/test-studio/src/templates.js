import T from '@sanity/base/initial-values-template-builder'

export default [
  ...T.defaults(),

  T.template({
    id: 'author-developer',
    title: 'Developer',
    schemaType: 'author',
    value: {
      role: 'developer'
    }
  })
]
