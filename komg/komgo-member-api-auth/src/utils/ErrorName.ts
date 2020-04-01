export enum ErrorName {
  GetKeycloakPublicKeyError = 'GetKeycloakPublicKeyError',
  // this is a temporary warning that may occur if someone drops KC db
  // (should never happen in prod unless someone decides to drop Keycloak db)
  TemporaryGetKeycloakPublicKeyError = 'TemporaryGetKeycloakPublicKeyError',
  // may occur due to the same reason as above
  KeycloakPublicKeyChanged = 'KeycloakPublicKeyChanged',
  // user intentionally passed an invalid JWT or Keycloak is misconfigured
  InvalidJWT = 'InvalidJWT'
}
