import TruffleContractInstance = require('truffle-contract')
const { web3Provider } = require("../../web3Provider");

export const TruffleContract = (artifact: any) => {
    const instance = TruffleContractInstance(artifact);
    instance.setProvider(web3Provider)
    if (typeof instance.currentProvider.sendAsync !== 'function') {
        instance.currentProvider.sendAsync = function () {
            return instance.currentProvider.send.apply(instance.currentProvider, arguments)
        }
    }
    return instance;
}