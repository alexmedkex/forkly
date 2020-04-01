import { IFile } from '../../business-layer/types/IFile'

export interface IMultipartData<TData> {
  file: IFile
  data: TData
}
