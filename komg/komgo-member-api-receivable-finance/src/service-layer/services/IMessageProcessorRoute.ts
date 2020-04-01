import { IMessageProcessor } from './IMessageProcessor'

export interface IMessageProcessorRoute {
  prefix: string
  processor: IMessageProcessor
}
