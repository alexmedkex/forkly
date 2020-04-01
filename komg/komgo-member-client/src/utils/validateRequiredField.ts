const validateRequiredField = (field: string) => (value: string) => {
  let errorMessage: string

  if (!value) {
    errorMessage = `'${field}' should not be empty`
  }
  return errorMessage
}

export default validateRequiredField
