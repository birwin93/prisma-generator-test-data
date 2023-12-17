import { DMMF } from '@prisma/generator-helper'

const TD_OVERRIDE = '@td:'

export function generate(datamodel: DMMF.Datamodel): string {
  return datamodel.models
    .map((model) => generateModel(model, datamodel.enums))
    .join('\n\n')
}

function generateModel(model: DMMF.Model, enums: DMMF.DatamodelEnum[]): string {
  return `export function test${model.name}(): ${model.name} {
        return {
            ${generateModelFields(model, enums)}
        }
    }`
}

function generateModelFields(
  model: DMMF.Model,
  enums: DMMF.DatamodelEnum[],
): string {
  let fields: string[] = []
  for (const field of model.fields) {
    const value = generateFieldValue(field, enums)
    if (value) {
      fields.push(`${field.name}: ${value},`)
    }
  }
  return fields.join('\n')
}

function generateFieldValue(
  field: DMMF.Field,
  enums: DMMF.DatamodelEnum[],
): string | null {
  const docLines = field.documentation?.split('\n') || []
  const tdOverride = docLines
    .find((line) => line.startsWith(TD_OVERRIDE))
    ?.replace(TD_OVERRIDE, '')

  console.log(docLines, tdOverride)

  // If there is an explict td override, use it
  if (tdOverride) {
    return tdOverrideValue(tdOverride)
  }

  // If field is an object (aka relation)
  // or is optional, return null
  if (field.kind === 'object' || field.isRequired == false) {
    return null
  }

  // If field is a scalar, check type and return appropriate value
  if (field.kind == 'scalar') {
    if (field.isId) {
      if (field.type == 'String') {
        return 'faker.string.uuid()'
      } else {
        return 'faker.number.int()'
      }
    } else if (field.type == 'String') {
      if (field.default) {
        return `'${field.default}'`
      } else {
        return 'faker.lorem.word(10)'
      }
    } else if (field.type == 'Date' || field.type == 'DateTime') {
      return 'new Date()'
    } else if (field.type == 'Int') {
      return 'faker.number.int()'
    }
  } else if (field.kind == 'enum') {
    const enumName = field.type
    const enumValues = enums.find((it) => it.name === enumName)?.values || []
    if (enumValues.length === 0) {
      throw new Error(`Could not find enum values for enum ${enumName}`)
    } else {
      return `${enumName}.${enumValues[0].name}`
    }
  }

  return `${field}`
}

function tdOverrideValue(override: string): string {
  switch (override) {
    case 'email':
      return 'faker.internet.email()'
    case 'phone':
      return 'faker.phone.number()'
    case 'firstName':
      return 'faker.person.firstName()'
    case 'lastName':
      return 'faker.person.lastName()'
    case 'fullName':
      return 'faker.person.findName()'
    case 'numberString':
      return 'faker.string.numeric(8)'
    case 'bigint':
      return 'faker.number.int()'
  }

  return override
}
