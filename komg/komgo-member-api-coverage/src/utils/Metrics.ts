export enum MetricState {
  Failed = 'failed',
  Success = 'success'
}

export enum MetricAction {
  CounterpartyRequestApproved = 'counterpartyRequestApproved',
  CounterpartyRequestRejected = 'counterpartyRequestRejected',
  CounterpartyRequestSent = 'counterpartyRequestSent',
  CounterpartyRequestResent = 'counterpartyRequestResent',
  CounterpartyApprovalReceived = 'counterpartyApprovalReceived',
  CounterpartyRejectionReceived = 'counterpartyRejectionReceived',
  CounterpartyRequestReceived = 'counterpartyRequestReceived',
  CounterpartyRequestReceivedReprocessed = 'counterpartyRequestReceivedReprocessed',
  CounterpartyAutomaticallyAdded = 'counterpartyAutomaticallyAdded',
  CounterpartyAdded = 'counterpartyAdded'
}

export enum Metric {
  Action = 'action',
  State = 'state'
}
