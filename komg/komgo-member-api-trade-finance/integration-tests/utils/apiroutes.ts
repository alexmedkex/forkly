const basePaths = {
  tradeCargo: 'http://api-trade-cargo:8080/v0',
  registry: `http://api-registry:8080/v0`,
  signer: `http://api-blockchain-signer:8080/v0`,
  documents: `http://api-documents:8080/v0`,
  notif: `http://api-notif:8080/v0`,
  tasks: `http://api-notif:8080/v0`
}

export const apiroutes = {
  tradeCargo: {
    getTrade: new RegExp(`${basePaths.tradeCargo}/trades.*`),
    getTradeNoWildCard: `${basePaths.tradeCargo}/trades`,
    getCargo: new RegExp(`${basePaths.tradeCargo}/trades/.*/movements`),
    getTradeByVaktId: new RegExp(`${basePaths.tradeCargo}/trades.*`)
  },
  registry: {
    getMembers: new RegExp(`${basePaths.registry}/registry/cache/\\?companyData=.*`),
    getMembersNoWildcard: `${basePaths.registry}/registry/cache/?companyData=`
  },
  signer: {
    getKey: new RegExp(`${basePaths.signer}/one-time-signer/key`),
    sendTransaction: new RegExp(`${basePaths.signer}/one-time-signer/transaction`),
    simpleSign: new RegExp(`${basePaths.signer}/signer/simple-sign`)
  },
  documents: {
    registerDocument: new RegExp(`${basePaths.documents}/products/tradeFinance/categories/.*/types/.*/documents`),
    getDocument: new RegExp(`${basePaths.documents}/products/.*/documents\\?context=.*`),
    sendDocument: new RegExp(`${basePaths.documents}/products/tradeFinance/send-documents/internal`),
    documentTypes: new RegExp(`${basePaths.documents}/products/tradeFinance/types`)
  },
  notif: {
    createNotification: new RegExp(`${basePaths.notif}/notifications/.*`),
    createTask: new RegExp(`${basePaths.notif}/tasks`)
  },
  tasks: {
    updateTask: new RegExp(`${basePaths.tasks}/tasks`)
  }
}
