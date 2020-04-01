const web3Utils = require('web3-utils')

export enum SBLC_EVENT_TYPES {
  SBLCCreated = 'SBLCCreated',
  Transition = 'Transition',
  DataUpdated = 'DataUpdated',
  NonceIncremented = 'NonceIncremented'
}

export enum SBLCTransitions {
  ISSUED = web3Utils.soliditySha3('issued'),
  REQUEST_REJECTED = web3Utils.soliditySha3('request rejected')
}

export enum SBLCDataUpdated {
  SWIFT_SBLC_DOCUMENT = web3Utils.soliditySha3('swift sblc document'),
  ISSUING_REFERENCE = web3Utils.soliditySha3('swift sblc document reference'),
  ISSUING_BANK_POSTAL_ADDRESS = web3Utils.soliditySha3('issuing bank postal address'),
  DATA_ISSUING_BANK_COMMENTS = web3Utils.soliditySha3('issuing bank comments')
}
