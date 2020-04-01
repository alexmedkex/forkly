import IUser from '../IUser'
import IDecodedJWT from '../../middleware/utils/IDecodedJWT'

export default function getUser(decoded: IDecodedJWT): IUser {
  return {
    id: decoded.sub,
    firstName: decoded.given_name,
    lastName: decoded.family_name,
    email: decoded.email
  }
}
