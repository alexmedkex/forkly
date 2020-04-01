import TruffleContractInstance = require('truffle-contract')
import { web3Provider } from './web3Provider'

export const TruffleContract = (artifact: any) => {
  const instance = TruffleContractInstance(artifact)
  instance.setProvider(web3Provider)
  if (typeof instance.currentProvider.sendAsync !== 'function') {
    instance.currentProvider.sendAsync = function() {
      return instance.currentProvider.send.apply(instance.currentProvider, arguments)
    }
  }
  return instance
}
