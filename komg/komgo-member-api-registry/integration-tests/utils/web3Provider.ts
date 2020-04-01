import Web3 = require('web3')

const BLOCKCHAIN_BASE_URL = 'http://localhost'
const QUORUM_DEFAULT_PORT = process.env.BLOCKCHAIN_PORT || 22001
const QUORUM_NODE = `${BLOCKCHAIN_BASE_URL}:${QUORUM_DEFAULT_PORT}`

const GANACHE_PORT = 8545
const GANACHE_NODE = `${BLOCKCHAIN_BASE_URL}:${GANACHE_PORT}`

const ganacheProvider = new Web3.providers.HttpProvider(GANACHE_NODE)
const quorumProvider = new Web3.providers.HttpProvider(QUORUM_NODE)

const useQuorumNode = process.env.USE_QUORUM_NODE || false

export const web3Provider = useQuorumNode ? quorumProvider : ganacheProvider

export const web3Instance = new Web3(web3Provider)

export const getAccounts = async () => {
  let accounts = await web3Instance.eth.getAccounts()
  return accounts
}

export const unlockAccount = async (address: string) => {
  await web3Instance.eth.personal.unlockAccount(address, '', 15000)
}
