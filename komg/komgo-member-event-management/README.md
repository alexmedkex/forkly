# KomGo Event Management

Service that will have 3 responsibilities:

- Forward messages from Intra-MQ to Internal-MQ (decrypting in the way).
- Forward messages from Internal-MQ to Intra-MQ (encrypting and signing in the way)

## How to send messages to Intra-MQ via this service

Import the [Messaging Library](https://gitlab.com/ConsenSys/client/uk/KomGo/komgo-packages/messaging-library) in your project.

By default, the `publisherId` used to send messages to this services which will forward to Intra-MQ is: `to-event-mgnt`.

The `companyDomainId` should be the domain registered in the ENS Registry. For example, `companyDomainId.komgo` and `companyDomainId.meta.komgo`.

```
import { IMessagePublisher, MessagingFactory, IPublishResult } from '@komgo/messaging-library'


const factory = new MessagingFactory(<internal-mq host>, <internal-mq username>, <internal-mq password>)
const publisher: IMessagePublisher = factory.createRetryPublisher("to-event-mgnt")

const routingKey = <message routing key>
const messageContent = { <your payload object> }

const result: IPublishResult = await messagingPublisherToIntra.publish(routingKey, messageContent, {
      recipientDomainID: <companyDomainId>
    })

```

## How to receive messages from Intra-MQ via this service

Import the [Messaging Library](https://gitlab.com/ConsenSys/client/uk/KomGo/komgo-packages/messaging-library) in your project.

By default, the `publisherId` used to receive messages from Intra-MQ forwarded by this service is: `from-event-mgnt`.

```javascript
import { IMessageConsumer, MessagingFactory, IPublishResult } from '@komgo/messaging-library'


const factory = new MessagingFactory(<internal-mq host>, <internal-mq username>, <internal-mq password>)
const consumer: IMessageConsumer = factory.createConsumer(<your service id>)

const routingKeyToListen = "#" // topic exchange type

await messagingConsumer.listen("from-event-mgnt", routingKeyToListen, receivedMessage => {
		// to get payload: receivedMessage.content
		// to get routingKey: receivedMessage.routingKey
		// to get messageId: receivedMessage.routingKey.options. messageId
		// to get correlationId: receivedMessage.routingKey.options.correlationId
		// to get recipientDomainID: receivedMessage.routingKey.options.recipientDomainID
		// to get senderDomainID: receivedMessage.routingKey.options.senderDomainID

		// ack message when is processed
      receivedMessage.ack()
    })

```

## How to run ready check

In a container that runs a production build image run `npm run is-ready`.

When in development mode, run `npm run is-ready:dev`.
