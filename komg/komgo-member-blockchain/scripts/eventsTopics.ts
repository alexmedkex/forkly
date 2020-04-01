const path = require('path');
const fs = require('fs');
const web3Utils = require('web3-utils')
import {AbiCoder} from 'web3-eth-abi';

const ARTIFACTS_FOLDER_PATH = path.join(process.cwd(), "build", "contracts");

const generateEvents = async () => {
  const abi = new AbiCoder()
  try {
    const files = await fs.readdirSync(ARTIFACTS_FOLDER_PATH)
    for (const file of files) {
      let hasEvents = false
      const contractJson = JSON.parse(await fs.readFileSync(`${ARTIFACTS_FOLDER_PATH}/${file}`, 'utf8'));
      let text = `h2. Events for ${contractJson.contractName}`
      const events = contractJson.abi.filter(entry => entry.type === 'event')
      for (const event of events) {
        hasEvents = true
        let eventTopic = abi.encodeEventSignature(event)
        if (event.anonymous) {
          eventTopic = web3Utils.sha3(contractJson.contractName)
        }
        text = `${text}\n|${event.name}|${eventTopic}|`
      }
      if (hasEvents) {
        console.log(text)
      }
    }
  } catch (error) {
    console.log(error)
  }
  
}

generateEvents()
