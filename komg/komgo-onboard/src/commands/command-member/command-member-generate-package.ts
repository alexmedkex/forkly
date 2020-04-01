import { CLI } from '../../cli'
import { Config } from '../../config'
import * as fs from 'fs'
import { generateMemberPackage } from '../../features/onboard-member'
import { logger } from '../../utils'

export const commandGenerateMemberPackage = async (config: Config, cli: CLI) => {
  const [, , fileName] = cli.input

  const fileContent = fs.readFileSync(fileName, 'utf8')
  const data = JSON.parse(fileContent)
  const memberPackage = await generateMemberPackage(data, config)
  const json = JSON.stringify(memberPackage, null, 2)
  const outputFileName = 'member-package.json'
  fs.writeFile(outputFileName, json, function(err) {
    if (err) {
      return logger.error(err.message, err)
    }
    logger.info(`Member package was saved to ${outputFileName}`)
  })
}
