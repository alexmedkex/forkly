import { sha3 } from 'ethereumjs-util'
import { IVerifiedFile, IStatus } from '../store/types'

const calculateHash = async (files: File[], lastIndex: number): Promise<IVerifiedFile[]> => {
  return Promise.all(
    files.map((file, key) => {
      return new Promise<IVerifiedFile>(resolve => {
        const path: string[] = file.type.split('/')
        // TODO: replace it with hash
        const fileKey: number = lastIndex + key + 1
        const type: string = path.length > 1 ? path[1] : 'file'
        const stateFile: IVerifiedFile = {
          fileName: file.name,
          type,
          status: IStatus.pending,
          hash: '',
          key: fileKey
        }
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          const result: string | ArrayBuffer = reader.result
          const contentHash: Buffer = sha3(result.toString().split(',')[1])
          stateFile.hash = `0x${contentHash.toString('hex')}`
          return resolve(stateFile)
        }
      })
    })
  )
}

export { calculateHash }
