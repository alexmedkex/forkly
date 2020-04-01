const basePaths = {
  registry: `http://api-registry:8080/v0`,
  notification: `http://api-notif:8080/v0`
}

export const apiroutes = {
  registry: {
    getMembers: new RegExp(`.*/v0/registry/cache\\?companyData=.*`)
  },
  notification: {
    create: new RegExp(`${basePaths.notification}/notifications.*`),
    task: new RegExp(`${basePaths.notification}/tasks.*`)
  }
}
