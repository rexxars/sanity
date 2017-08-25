export default {
  name: 'blocksWithAnnotations',
  title: 'Blocks with annotations',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'annotatedContent',
      title: 'Annotated content',
      type: 'array',
      of: [
        {type: 'image', title: 'Image', options: {inline: true}},
        {type: 'author', title: 'Author'},
        {
          type: 'object',
          title: 'Footnote',
          name: 'footnote',
          fields: [{type: 'string', name: 'note'}],
          options: {inline: true}
        },
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'Quote', value: 'blockquote'}
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'}
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'}
            ],
            annotations: [
              {type: 'reference', to: {type: 'author'}, name: 'authorReference', title: 'Author', preview: {select: ['name']}, options: {icon: ''}},
              {
                type: 'object',
                title: 'Address',
                name: 'address',
                fields: [{type: 'string', name: 'street'}, {type: 'string', name: 'number'}]
              },
              {type: 'object', title: 'Link', name: 'link', fields: [{type: 'string', name: 'href'}]},
            ]
          }
        }
      ]
    },
  ]
}

export const typeWithBlocks = {
  name: 'typeWithBlocks',
  title: 'Yo Dawg',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'someBlocks',
      type: 'object',
      fields: [
        {
          name: 'blocks',
          type: 'array',
          title: 'Blocks',
          of: [
            {
              type: 'block',
              styles: [],
              lists: [],
              span: {}
            },
            {
              type: 'typeWithBlocks',
              title: 'Type with blocks!'
            }
          ]
        }
      ]
    }
  ]
}
