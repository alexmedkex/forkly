import { object, string } from 'yup'

const validationSchema = object().shape({
  validFrom: string().required("'validFrom' is required"),
  validTo: string().required("'validTo' is required"),
  key: object().shape({
    kty: string().required("'kty in key' is required"),
    kid: string().required("'kid in key' is required"),
    n: string().required("'n in key' is required"),
    e: string().required("'e in key' is required")
  })
})

const validateMessagingPublicKey = (value: string) => {
  let errorMessage: string

  try {
    validationSchema.validateSync(JSON.parse(value))
  } catch (error) {
    errorMessage = error.name === 'ValidationError' ? error.message : 'Invalid JSON'
  }

  if (!value) {
    errorMessage = "'Messaging Public Key' should not be empty"
  }
  return errorMessage
}

export default validateMessagingPublicKey
