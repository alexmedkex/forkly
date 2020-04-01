const CONFIG = {
  smtpHost: Symbol.for('smtpHost'),
  smtpPort: Symbol.for('smtpPort'),
  smtpAuth: Symbol.for('smtpAuth'),
  smtpAuthUser: Symbol.for('smtpAuthUser'),
  smtpAuthPassword: Symbol.for('smtpAuthPassword'),
  smtpSSL: Symbol.for('smtpSSL'),
  smtpStartTls: Symbol.for('smtpStartTls'),
  smtpFrom: Symbol.for('smtpFrom'),
  clientId: Symbol.for('clientId'),
  keycloakSsl: Symbol.for('keycloakSsl'),
  keycloakCorsAllowedOrigin: Symbol.for('keycloakCorsAllowedOrigin'),
  rolesBaseUrl: Symbol.for('rolesBaseUrl'),
  realm: Symbol.for('realm')
}

export { CONFIG }
