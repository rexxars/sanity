import {Template, TemplateBuilder} from './Template'
import {Schema, SchemaType, getDefaultSchema} from '../parts/Schema'

function defaultTemplateForType(
  schemaType: string | SchemaType,
  sanitySchema?: Schema
): TemplateBuilder {
  let type: SchemaType
  if (typeof schemaType === 'string') {
    const schema = sanitySchema || getDefaultSchema()
    type = schema.get(schemaType)
  } else {
    type = schemaType
  }

  return new TemplateBuilder({
    id: type.name,
    schemaType: type.name,
    title: type.title || type.name,
    icon: type.icon,
    value: type.initialValue || {_type: type.name}
  })
}

function defaults(sanitySchema?: Schema) {
  const schema = sanitySchema || getDefaultSchema()
  return schema
    .getTypeNames()
    .map(typeName => defaultTemplateForType(schema.get(typeName), sanitySchema))
}

export default {
  template: (spec?: Template) => new TemplateBuilder(spec),
  defaults,
  defaultTemplateForType
}
