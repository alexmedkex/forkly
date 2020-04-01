export const toValidationErrors = (errors: any[]) => {
  const validationErrors = {}
  errors.forEach(error => {
    validationErrors[error['dataPath']] = [error['message']] // tslint:disable-line
  })
  return validationErrors
}

export class ValidationError extends Error {
  public errors: any

  constructor(message, errors?) {
    super(message)
    this.name = 'ValidationError'
    if (errors) {
      this.errors = errors
    }
  }
}
