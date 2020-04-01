import * as amqp from 'amqp-connection-manager'

export const connect = () =>
  amqp.connect([process.env.COMMON_BROKER_AMQP_URI || 'amqp://KomgoCommonUser:Tostoresomewhere@localhost:5673/'])
