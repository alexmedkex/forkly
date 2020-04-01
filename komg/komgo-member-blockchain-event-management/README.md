# KomGo Blockchain Event Management

Service that will have 3 responsibilities:
 - Publish events from blockchain in Internal-MQ.
 - Whitelist and blacklist contract addresses based on events
 - Verify that the bytecode of events from contract addresses is registered by Komgo

## How to run ready check

In a container that runs a production build image run `npm run is-ready`.

When in development mode, run `npm run is-ready:dev`.

## Receiving messages from the blockchain

By default, this service will listen to all events on the blockchain.

It will then forward them to the `internal-mq` using the routing key `'BLK.$topic0'`

Where `$topic0` is either the event signature (regular events), or the first indexed topic in the event (anonymous events).
