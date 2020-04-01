import { IsDefined } from 'class-validator'

export default class CreateRFPAcceptRequest {
  @IsDefined()
  responseData: any
  @IsDefined()
  participantStaticId: string
}
