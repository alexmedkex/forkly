const basePaths = {
  notification: `http://api-notif:8080/v0`,
  registry: `http://api-registry:8080/v0`,
  coverage: 'http://api-coverage:8080/v0'
}

export const apiroutes = {
  notification: {
    create: new RegExp(`${basePaths.notification}/notifications.*`),
    task: new RegExp(`${basePaths.notification}/tasks.*`),
    general: new RegExp(`${basePaths.notification}/.*`)
  },
  registry: {
    getCompanies: new RegExp(`${basePaths.registry}/registry/cache\\?companyData=.*`)
  },
  coverage: {
    getCounterparties: new RegExp(`${basePaths.coverage}/counterparties\\?query=.*`)
  }
}
