import { check } from "k6";
import http from "k6/http";

const ETH_ADDRESS_LENGTH = 42
const ETH_TX_HASH_LENGTH = 66
const HTTP_PARAMS = {
    headers: { "Content-Type": "application/json" },
    timeout: 5 * 60 * 1000
}

export const options = {
    setupTimeout: "60s"

};

export function setup() {
    if (__ENV.contract_address && __ENV.contract_address.startsWith('0x')) {
        return { contractAddress: __ENV.contract_address }
    }

    // if no contract address was supplied, deploy a new contract for this test
    console.log('[SETUP] Deploying test contract...')

    // retrieve one-time key
    const otkResponse = http.get("http://api-blockchain-signer:8080/v0/one-time-signer/key")
    const onetimeKey = otkResponse.body.replace(/["]+/g, '')

    if (otkResponse.status !== 200) {
        throw 'Failed to retrieve one-time key'
    }

    // deploy contract
    const request = JSON.stringify(
        {
            "from": onetimeKey,
            "data": "0x608060405234801561001057600080fd5b5060e68061001f6000396000f3fe6080604052600436106043576000357c0100000000000000000000000000000000000000000000000000000000900480633d4197f0146048578063e1cb0e5214607f575b600080fd5b348015605357600080fd5b50607d60048036036020811015606857600080fd5b810190808035906020019092919050505060a7565b005b348015608a57600080fd5b50609160b1565b6040518082815260200191505060405180910390f35b8060008190555050565b6000805490509056fea165627a7a7230582032105aec41f13bc49ef56e4757694e38986b295438e13cbf4497a265e8f08c170029",
            "value": "0x0",
            "privateFor": [__ENV.private_participant]
        })
    const response = http.post("http://api-blockchain-signer:8080/v0/one-time-signer/transaction?returnFullReceipt=true",
        request, HTTP_PARAMS);

    // extract contract address
    const contractAddress = response.json().contractAddress
    if (!contractAddress) {
        throw `Undefined contract address. Response: ${response}`
    }
    console.log(`***** REUSABLE CONTRACT ADDRESS: ${contractAddress} *****`)
    return { contractAddress }
}

export default function (data) {
    // setup arguments
    const contractAddress = data.contractAddress

    // ===== retrieve one-time key =====
    const onetimeKeyResponse = http.get("http://api-blockchain-signer:8080/v0/one-time-signer/key", HTTP_PARAMS)

    check(onetimeKeyResponse, {
        "1) GET /v0/one-time-signer/key status is 200": r => r.status === 200,
    });
    if (onetimeKeyResponse.status !== 200) {
        console.log('Failed to get one-time key: ' + JSON.stringify(onetimeKeyResponse))
        if (onetimeKeyResponse.status === 0) {
            console.log('HTTP status === 0 >> express might have timed out')
        }
        throw 'Failed to get one-time key'
    }

    const onetimeKey = onetimeKeyResponse.body.replace(/["]+/g, '')
    check(onetimeKey, {
        "1) GET /v0/one-time-signer/key content is valid ETH key": r => r.length === ETH_ADDRESS_LENGTH && r.startsWith('0x')
    })

    // if we fail to retrieve one-time key, skip the rest of the flow
    if (onetimeKeyResponse.status !== 200)
        return

    // ===== send private transaction for the first time =====
    const privateTxRequest = JSON.stringify({
        "from": onetimeKey,
        "to": contractAddress,
        "data": "0x3d4197f00000000000000000000000000000000000000000000000000000000000000000",
        "value": "0x0",
        "privateFor": [__ENV.private_participant]
    })
    const successPrivateTxResponse = http.post("http://api-blockchain-signer:8080/v0/one-time-signer/transaction?returnFullReceipt=true",
        privateTxRequest, HTTP_PARAMS);

    check(successPrivateTxResponse, {
        "2) POST /v0/one-time-signer/transaction status is 200": r => r.status === 200,
        "2) POST /v0/one-time-signer/transaction body has content": r => r.body && r.body.length > 0,
        "2) POST /v0/one-time-signer/transaction body.status exists and is true": r => r.json().status === true,
        "2) POST /v0/one-time-signer/transaction body.transactionHash exists and is valid": r => r.json().transactionHash.length === ETH_TX_HASH_LENGTH
    });

    // ===== re-send private transaction should fail =====
    const failPrivateTxResponse = http.post("http://api-blockchain-signer:8080/v0/one-time-signer/transaction",
        privateTxRequest, HTTP_PARAMS);

    check(failPrivateTxResponse, {
        "3) POST /v0/one-time-signer/transaction re-send TX fails; status is 409": r => r.status === 409
    })
};