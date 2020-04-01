interface IRealmAccess {
  roles: string[]
}

export default interface IDecodedJWT {
  realm_access: IRealmAccess
  sub: string
  iss: string
}
