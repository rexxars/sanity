
export default {
  name: 'filesTest',
  type: 'object',
  title: 'Files test',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string'
    },
    {
      name: 'someFile',
      title: 'A simple file',
      type: 'file'
    },
    {
      name: 'fileWithFields',
      title: 'File with additional fields',
      type: 'file',
      fields: [
        {
          title: 'Description',
          name: 'description',
          type: 'string',
          options: {isHighlighted: true}
        },
        {
          title: 'Not so important',
          name: 'notsoimportant',
          type: 'string'
        }
      ]
    }
  ]
}
