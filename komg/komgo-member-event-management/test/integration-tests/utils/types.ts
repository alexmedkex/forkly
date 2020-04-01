export interface IMockedIds {
  recipientMNID: string
  senderMNID: string
  eventToPublisherId: string
  eventFromPublisherId: string
  eventConsumerId: string
  companyStaticId: string
  outboundRoutingKey: string
  outboundVaktExchange: string
  outboundVaktQueue: string
  outboundMonitoringExchange: string
  outboundMonitoringQueue: string
  outboundEmailNotificationQueue: string
  eventToPublisherDeadQueue: string
  eventFromPublisherDeadQueue: string
  eventToPublisherDeadExchange: string
  eventFromPublisherDeadExchange: string
}
