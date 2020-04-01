import { IRFPMessage, IRFPPayload } from '@komgo/messaging-types'

export interface IReceiveMessageUseCase {
  execute(message: IRFPMessage<IRFPPayload>): Promise<void>
}
