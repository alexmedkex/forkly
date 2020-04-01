const web3Utils = require('web3-utils')

export enum LETTER_OF_CREDIT_EVENTS {
  LetterOfCreditCreated = 'LetterOfCreditCreated',
  NonceIncremented = 'NonceIncremented',
  Transition = 'Transition',
  TransitionWithData = 'TransitionWithData'
}

export enum LetterOfCreditContractStatus {
  ISSUED = web3Utils.soliditySha3('issued'),
  REQUEST_REJECTED = web3Utils.soliditySha3('request rejected')
}
