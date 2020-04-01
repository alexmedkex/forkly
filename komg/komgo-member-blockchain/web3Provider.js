const Web3 = require("web3");

const blockchainHost = process.env.BLOCKCHAIN_HOST || "localhost";

let web3Provider;
let blockchainURL;

if (process.env.KALEIDO_USER) {
    console.log("Kaleido mode")
    blockchainURL = `https://${process.env.KALEIDO_USER}:${process.env.KALEIDO_PASSWORD}@${blockchainHost}`;
    web3Provider = new Web3.providers.HttpProvider("https://" + blockchainHost, 0, process.env.KALEIDO_USER, process.env.KALEIDO_PASSWORD);
}
else {
    const blockchainPort = process.env.BLOCKCHAIN_PORT || "8545"
    blockchainURL = "http://" + blockchainHost + ":" + blockchainPort;
    web3Provider = new Web3.providers.HttpProvider(blockchainURL);
}

console.log("Blockchain URL: " + blockchainURL);
const web3Instance = new Web3(web3Provider);
console.log("Accounts: " + web3Instance.eth.accounts);
const address = process.env.TRUFFLE_DEPLOYMENT_ADDRESS || web3Instance.eth.accounts[0];
console.log("Deployment address: " + address);

module.exports = {
    web3Provider: new Web3.providers.HttpProvider(blockchainURL),
    web3Instance: web3Instance,
    address: address,
}