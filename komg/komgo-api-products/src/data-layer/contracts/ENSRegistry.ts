import * as fs from 'fs'

export default JSON.parse(fs.readFileSync('./src/data-layer/contracts/ENSRegistry.json').toString('utf8'))
