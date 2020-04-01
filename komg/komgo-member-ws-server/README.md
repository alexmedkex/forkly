# Websocket Server

Uses socket.io to communicate with a WS client and `@komgo/messaging-library` to subscribe to messages from a queue

## Quickstart

running in prod mode:
```
./kg up ws-server
```

running in dev mode:
```
./kg up ws-server --dev
./kg sh ws-server
npm install
npm run start:dev
```

If `NODE_ENV` is development, testing page is available under [localhost:3109](http://localhost:3109/).

**Note : Please make sure your `api-auth` and `rabbitmq-internal` are running.** For more information see [README.md](https://gitlab.com/ConsenSys/client/uk/KomGo/komgo-member/blob/develop/README.md).


## Usage
####  Server
```javascript
import { MessagingFactory } from '@komgo/messaging-library'
import { getRequestIdHandler } from '@komgo/microservice-config'

new MessagingFactory(
    process.env.INTERNAL_MQ_HOST,
    process.env.INTERNAL_MQ_USERNAME,
    process.env.INTERNAL_MQ_PASSWORD,
    getRequestIdHandler()
)
.createPublisher('websocket')
.publish(
    'INTERNAL.WS.action',
    { recipient, type, version, payload },
    { requestId }
)
```

####  Client
```javascript
import io from 'socket.io-client'

const socket = io(process.env.REACT_APP_API_GATEWAY_URL)
socket.on('connect', () => {
    socket.emit('authenticate', { token })
})
socket.on('authenticated', () => {
    socket.on('action', ({ type, payload }) => console.log({ type, payload }))
})
```

## License

ISC
