import * as fs from 'fs'

export default JSON.parse(fs.readFileSync('./src/data-layer/contracts/KomgoResolver.json').toString('utf8'))
