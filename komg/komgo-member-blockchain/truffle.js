const { web3Provider, address } = require("./web3Provider");

module.exports = {
  contracts_directory: "node_modules/@komgo/smart-contracts/contracts",
  networks: {
    development: {
      provider: () => {
        return web3Provider;
      },
      from: address,
      network_id: "*", // Match any network id
      gasPrice: 0,
      gasLimit: 804247552
    }
  },
  compilers: {
    solc: {
      version: '0.4.24',
      optimizer: {
        enabled: true,
        runs: 1
      }
    }
  },
  mocha: {
    timeout: 50000,
    useColors: true
  }
};
