interface IRealmAccess {
  roles: string[]
}

export default interface IDecodedJWT {
  sub: string
  preferred_username: string
  given_name: string
  family_name: string
  email: string
  realm_access: IRealmAccess
}
