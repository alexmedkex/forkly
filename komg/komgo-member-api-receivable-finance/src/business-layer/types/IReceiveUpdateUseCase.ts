import { IReceivableFinanceMessage, IUpdatePayload } from '.'

export interface IReceiveUpdateUseCase<T> {
  execute(message: IReceivableFinanceMessage<IUpdatePayload<T>>): Promise<void>
}
