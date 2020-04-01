const TYPES = {
  // Data layer
  KeyDataAgent: Symbol.for('KeyDataAgent'),

  // Business layer
  CompanyKeyProvider: Symbol.for('CompanyKeyProvider'),
  RsaKeyManager: Symbol.for('RsaKeyManager'),
  KeyMigration: Symbol.for('KeyMigration'),

  // infrastructure
  VaultClient: Symbol.for('VaultClient')
}

export { TYPES }
