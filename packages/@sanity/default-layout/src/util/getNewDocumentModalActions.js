import schema from 'part:@sanity/base/schema'
import {isActionEnabled} from 'part:@sanity/base/util/document-action-utils'
import newDocumentStructure from 'part:@sanity/base/new-document-structure?'
import {getTemplateById} from '@sanity/base/initial-value-templates'
import S from '@sanity/base/structure-builder'

export default function getNewDocumentModalActions() {
  let structure = newDocumentStructure
  if (structure && !Array.isArray(structure)) {
    // eslint-disable-next-line no-console
    console.warn(
      `Invalid action modal configuration: "part:@sanity/base/new-document-structure" should return an array of items`
    )
    structure = S.defaultInitialValueTemplateItems()
  } else if (!structure) {
    // No structure defined, use default
    structure = S.defaultInitialValueTemplateItems()
  }

  return createModalActions(structure)
}

function createModalActions(structure) {
  return structure
    .map(createModalAction)
    .filter(canCreateTemplateItem)
    .filter(hasRequiredParameters)
}

function createModalAction(templateItem) {
  // Make sure we're working with serialized definitions
  let item = templateItem
  if (item && typeof item.serialize === 'function') {
    item = item.serialize()
  }

  // We currently only allow initial value template items in the "new document" dialog
  if (item.type !== 'initialValueTemplateItem') {
    throw new Error(
      'Only initial value template items are currently allowed in the new document structure'
    )
  }

  // Make sure the template actually exists
  const tpl = getTemplateById(item.templateId)
  if (!tpl) {
    throw new Error(`Template "${item.templateId}" not declared`)
  }

  // Build up an item suited for the "action modal" dialog
  const type = schema.get(tpl.schemaType)
  const title = item.title || tpl.title
  return {
    ...tpl,
    // Don't show the type name as subtitle if it's the same as the template name
    subtitle: type.title === title ? undefined : type.title,
    key: item.id,
    // Prioritize icon from initial value template item
    icon: item.icon || tpl.icon || type.icon,
    template: tpl,
    params: {
      template: item.templateId,
      type: tpl.schemaType
    },
    templateParams: item.parameters
  }
}

// Don't include templates for schema types we cannot actually create
function canCreateTemplateItem(item) {
  const {template, type} = item.params
  const canCreate = isActionEnabled(schema.get(type), 'create')
  if (!canCreate) {
    // eslint-disable-next-line no-console
    console.warn(
      `Template with ID "${template}" has schema type "${type}", where the "create" action is disabled and will not be included in the "new document"-dialog.`
    )
  }
  return canCreate
}

// Don't include templates that have defined parameters but no parameters are provided for the template item
function hasRequiredParameters(item) {
  const {template, templateParameters} = item.params
  const hasMissingParams = !templateParameters && item.template.parameters
  if (hasMissingParams) {
    // eslint-disable-next-line no-console
    console.warn(
      `Template with ID "${template}" requires a set of parameters, but none were given. Skipping.`
    )
  }

  return !hasMissingParams
}
