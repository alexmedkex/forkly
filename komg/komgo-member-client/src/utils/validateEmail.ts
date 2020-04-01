import { object, string } from 'yup'

const validationEmailSchema = (fieldName: string) =>
  object().shape({
    email: string()
      .email(`'${fieldName}' is not valid`)
      .required(`'${fieldName}' should not be empty`)
  })

const validateEmail = (fieldName: string) => (value: string) => {
  let errorMessage: string

  try {
    validationEmailSchema(fieldName).validateSync({ email: value })
  } catch (error) {
    errorMessage = error.message
  }
  return errorMessage
}

export default validateEmail
