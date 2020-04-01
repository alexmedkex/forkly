const contractInstanceMock = {
  getBalance: {
    call: jest.fn()
  },
  getBalanceInEth: {
    call: jest.fn()
  },
  sendCoin: jest.fn(async () => true)
}
const truffleContractMock = {
  setProvider() {},
  currentProvider: {
    sendAsync: () => {}
  },
  deployed: jest.fn(async () => contractInstanceMock)
}

export = () => truffleContractMock
