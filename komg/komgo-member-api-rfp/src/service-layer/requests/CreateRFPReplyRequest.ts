import { IsDefined } from 'class-validator'

export default class CreateRFPReplyRequest {
  @IsDefined()
  responseData: any
}
