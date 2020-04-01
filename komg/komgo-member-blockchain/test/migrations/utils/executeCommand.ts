const util = require('util')
const exec = util.promisify(require('child_process').exec)

const executeCommand = async (command: string) => {
  const { stdout, stderr } = await exec(`${command}`)
  console.log('stdout', stdout, 'stdout', stderr) // tslint:disable-line
}

export default executeCommand
