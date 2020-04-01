export enum AccessDeniedReason {
  InsufficientPermission = 'InsufficientPermission',
  UnexpectedError = 'UnexpectedError',
  KeycloakValidationError = 'KeycloakValidationError', // keycloak-connect middleware rejected token for some reason
  ProtectedRoute = 'ProtectedRoute'
}

export enum Metric {
  AccessDenied = 'AccessDenied'
}
