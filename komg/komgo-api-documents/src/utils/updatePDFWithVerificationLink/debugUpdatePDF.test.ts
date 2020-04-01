import * as fs from 'fs'

import { updatePDF } from './updatePDF'

const testingFiles = `${__dirname}/testing-files`

describe('debugUpdatePDF', () => {
  /**
   * remove skip and run
   * ./node_modules/.bin/jest -- src/utils/updatePDFWithVerificationLink/debugUpdatePDF.test.ts
   * in order to test PDF updates
   */
  it('update file', () => {
    const file = fs.readFileSync(`${testingFiles}/blank.pdf`)
    const newFile = updatePDF(file, 'Company Inc.')
    fs.writeFileSync(`${testingFiles}/fileWithVerificationLink.pdf`, newFile)
  })
})
