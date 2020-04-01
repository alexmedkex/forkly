export const findFieldFromSchema = (field: string, name: string, ...schemas: any[]) => {
  for (const schema of schemas) {
    if (name.includes('.')) {
      const arrayName = name.split('.')
      let fieldSplit = schema.properties
      arrayName.forEach(item => {
        if (fieldSplit[item]) {
          fieldSplit = fieldSplit[item]
        } else if (fieldSplit.properties) {
          fieldSplit = fieldSplit.properties[item]
        }
      })
      if (fieldSplit[field]) {
        return fieldSplit[field]
      }
    }

    if (schema.properties[name]) {
      return schema.properties[name][field]
    }
  }
  return name
}
