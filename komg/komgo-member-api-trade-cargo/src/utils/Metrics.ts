export enum MetricState {
  Failed = 'failed',
  Success = 'success'
}

export enum MetricAction {
  CargoReceived = 'cargoReceived',
  CargoCreated = 'cargoCreated',
  CargoUpdated = 'cargoUpdated',
  TradeReceived = 'tradeReceived',
  TradeCreated = 'tradeCreated',
  TradeUpdated = 'tradeUpdated'
}

export enum Metric {
  Action = 'action',
  State = 'state'
}
