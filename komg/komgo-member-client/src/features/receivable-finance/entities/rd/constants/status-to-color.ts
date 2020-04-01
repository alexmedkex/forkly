import { ParticipantRFPStatus, RDStatus } from '@komgo/types'
import { green, grey, red, violetBlue } from '../../../../../styles/colors'

export const PARTICIPANT_RFP_STATUS_TO_COLOR = {
  [ParticipantRFPStatus.Requested]: grey,
  [ParticipantRFPStatus.Rejected]: red,
  [ParticipantRFPStatus.RequestExpired]: grey,
  [ParticipantRFPStatus.QuoteSubmitted]: violetBlue,
  [ParticipantRFPStatus.QuoteDeclined]: red,
  [ParticipantRFPStatus.QuoteAccepted]: green
}

export const RD_STATUS_TO_COLOR = {
  [RDStatus.PendingRequest]: grey,
  [RDStatus.Requested]: grey,
  [RDStatus.RequestDeclined]: red,
  [RDStatus.RequestExpired]: grey,
  [RDStatus.QuoteSubmitted]: violetBlue,
  [RDStatus.QuoteDeclined]: red,
  [RDStatus.QuoteAccepted]: green
}
