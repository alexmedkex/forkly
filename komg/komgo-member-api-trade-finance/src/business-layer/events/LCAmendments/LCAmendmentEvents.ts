const web3Utils = require('web3-utils')

export enum LC_AMENDMENT_EVENT_TYPES {
  LCAmendmentCreated = 'LCAmendmentCreated',
  Transition = 'Transition',
  DataUpdated = 'DataUpdated'
}

export enum LC_AMENDMENT_TRANSITIONS {
  APPROVED_BY_ISSUING_BANK = web3Utils.soliditySha3('approved by issuing bank'),
  APPROVED_BY_ADVISING_BANK = web3Utils.soliditySha3('approved by advising bank'),
  REJECTED_BY_ISSUING_BANK = web3Utils.soliditySha3('rejected by issuing bank'),
  REJECTED_BY_ADVISING_BANK = web3Utils.soliditySha3('rejected by advising bank'),
  ACCEPTED_BY_BENEFICIARY = web3Utils.soliditySha3('accepted by beneficiary'),
  REJECTED_BY_BENEFICIARY = web3Utils.soliditySha3('rejected by beneficiary')
}

export enum LC_AMENDMENT_DATA_UPDATED {
  ISSUING_BANK_REJECTION_COMMENTS = 'issuing rejection comments'
}
