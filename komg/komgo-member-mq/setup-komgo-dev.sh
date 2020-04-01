#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

starttime=$(date +%s)

BANK=$1

ADMIN=KomgoInternalUser
PW_SEED=Tostoresomewhere
URL=http://localhost:15672

# DEV environment
# ADMIN=admin
# PW_SEED=z6YUYRW1e
# URL=https://mq.dev.komgo.io

E_UUID="$BANK-EXCHANGE"

echo "PUT a new exchange $E_UUID"
echo
    curl -k -i -u $ADMIN:$PW_SEED -H "content-type:application/json" \
    -XPUT -d'{"type":"topic","durable":true}' \
    "$URL/api/exchanges/%2F/$E_UUID"
echo
echo

E_ACK_UUID="$BANK-EXCHANGE-ACK"

echo "PUT a new exchange $E_UUID"
echo
    curl -k -i -u $ADMIN:$PW_SEED -H "content-type:application/json" \
    -XPUT -d'{"type":"topic","durable":true}' \
    "$URL/api/exchanges/%2F/$E_ACK_UUID"
echo
echo

Q_UUID="$BANK-QUEUE"

echo "PUT a new queue $Q_UUID"
echo
    curl -k -i -u $ADMIN:$PW_SEED -H \
    "content-type:application/json" \
    -XPUT -d"{\"type\":\"topic\",\"durable\":true, \"arguments\": {\"x-dead-letter-exchange\":	\"$E_ACK_UUID\", \"x-dead-letter-routing-key\":	\"$Q_UUID.dead\"}}" \
    "$URL/api/queues/%2F/$Q_UUID"
echo
echo

Q_ACK_UUID="$BANK-QUEUE-ACK"

echo "PUT a new queue $Q_UUID"
echo
    curl -k -i -u $ADMIN:$PW_SEED -H \
    "content-type:application/json" \
    -XPUT -d"{\"type\":\"topic\",\"durable\":true}" \
    "$URL/api/queues/%2F/$Q_ACK_UUID"
echo
echo

echo "POST a binding for # between exchange $E_UUID and queue $Q_UUID"
echo
    curl -k -i -u $ADMIN:$PW_SEED -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"#\", \"arguments\":{}}" \
    "$URL/api/bindings/%2F/e/$E_UUID/q/$Q_UUID"
echo
echo

echo "POST a binding for # between exchange $E_ACK_UUID and queue $Q_ACK_UUID"
echo
    curl -k -i -u $ADMIN:$PW_SEED -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"#\", \"arguments\":{}}" \
    "$URL/api/bindings/%2F/e/$E_ACK_UUID/q/$Q_ACK_UUID"
echo
echo

echo "Total execution time : $(($(date +%s)-starttime)) secs ..."