import { IRequestForProposalBase } from '@komgo/types'
import { ArrayNotEmpty, IsDefined } from 'class-validator'

export default class CreateRFPRequest {
  @IsDefined()
  rfp: IRequestForProposalBase
  @ArrayNotEmpty()
  participantStaticIds: string[]
}
