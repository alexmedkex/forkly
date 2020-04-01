// In this file you can configure migrate-mongo
const config = require('mongodb-uri').parse(process.env.DB_MONGO_URL)

const MONGO_USE_SSL = process.env.MONGO_USE_SSL
const MONGO_CA_CERT_BASE64 = process.env.MONGO_CA_CERT_BASE64
const MONGO_CLIENT_PEM_BASE64 = process.env.MONGO_CLIENT_PEM_BASE64
const MONGO_CLIENT_KEY_PASSWORD = process.env.MONGO_CLIENT_KEY_PASSWORD

let SSL_OPTIONS = {}
if (MONGO_USE_SSL === 'true') {
  SSL_OPTIONS = {
    ssl: true,
    sslValidate: true,
    sslCA: MONGO_CA_CERT_BASE64 && [Buffer.from(MONGO_CA_CERT_BASE64, 'base64')],
    sslCert: MONGO_CLIENT_PEM_BASE64 && Buffer.from(MONGO_CLIENT_PEM_BASE64, 'base64'),
    sslKey: MONGO_CLIENT_PEM_BASE64 && Buffer.from(MONGO_CLIENT_PEM_BASE64, 'base64'),
    sslPass: MONGO_CLIENT_KEY_PASSWORD && Buffer.from(MONGO_CLIENT_KEY_PASSWORD)
  }
}


module.exports = {
  mongodb: {
    url: process.env.DB_MONGO_URL,
    databaseName: config.database,
    options: {
      useNewUrlParser: true,
      ...(config.options || {}),
      ...SSL_OPTIONS
    }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: 'changelog'
}
