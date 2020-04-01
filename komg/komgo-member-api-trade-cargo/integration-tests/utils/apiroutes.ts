const basePaths = {
  registry: `http://api-registry:8080/v0`,
  coverage: `http://api-coverage:8080/v0`,
  notification: `http://api-notif:8080/v0`,
  documents: `http://api-documents:8080/v0`,
  tradeFinance: `http://api-trade-finance:8080/v0`
}

export const apiroutes = {
  registry: {
    getMembers: new RegExp(`.*/v0/registry/cache\\?companyData=.*`)
  },
  coverage: {
    autoAdd: new RegExp(`${basePaths.coverage}/counterparties.*`)
  },
  notification: {
    create: new RegExp(`${basePaths.notification}/notifications.*`)
  },
  documents: {
    getDocumentTypes: new RegExp(`${basePaths.documents}/products/.*/types.*`)
  },
  tradeFinance: {
    getLc: new RegExp(`${basePaths.tradeFinance}/lc.*`)
  }
}
