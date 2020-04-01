#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

printf "Enter your admin user: "
read ADMIN

printf "Enter your admin password: "
stty -echo
read ADMIN_PW
stty echo
echo

printf "Enter organisation name: "
read ORG

printf "Enter password seed: "
stty -echo
read PW_SEED
stty echo
echo


starttime=$(date +%s)

ROUTING_USER='KomgoInternalUser'
ROUTING_PASS='Tostoresomewhere'

#Password generation using the password seed informed
chmod 0755 ./config/password-hash-gen
PASSWORD_HASH=$(./config/password-hash-gen $PW_SEED)
ROUTING_HASH=$(./config/password-hash-gen $ROUTING_PASS)

# CONFIG (todo - make read from .env somehow???):
HOST_COMMON="localhost:15673"
HOST_VAKT="localhost:15674"
USER_VAKT="VaktGuestAccount"
PASS_VAKT="Tostoresomewhere"
VHOST="%2F"

# Create users:
echo "PUT new $ORG user"
echo

    # ORG user:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"password_hash\":\"$PASSWORD_HASH\",\"tags\":\"management\"}" \
    "http://$HOST_COMMON/api/users/$ORG-USER"

    # Routing agent user (persistant):
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"password_hash\":\"$ROUTING_HASH\",\"tags\":\"management\"}" \
    "http://$HOST_COMMON/api/users/$ROUTING_USER"

echo
echo

# Create ORG exchanges - INBOUND, OUTBOUND and DLX:
echo "PUT new $ORG exchanges - INBOUND and OUTBOUND"
echo
    
    # INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d'{"type":"direct","durable":true, "arguments":{}}' \
    "http://$HOST_COMMON/api/exchanges/$VHOST/$ORG-INBOUND-EXCHANGE"

    # OUTBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d'{"type":"direct","durable":true, "arguments":{}}' \
    "http://$HOST_COMMON/api/exchanges/$VHOST/$ORG-OUTBOUND-EXCHANGE"

    # DEAD LETTER - INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d'{"type":"fanout","durable":true}' \
    "http://$HOST_COMMON/api/exchanges/$VHOST/$ORG-INBOUND-EXCHANGE-DEAD"

    # DEAD LETTER - OUTBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d'{"type":"fanout","durable":true}' \
    "http://$HOST_COMMON/api/exchanges/$VHOST/$ORG-OUTBOUND-EXCHANGE-DEAD"

    # UNROUTED - INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d'{"type":"fanout","durable":true}' \
    "http://$HOST_COMMON/api/exchanges/$VHOST/$ORG-INBOUND-EXCHANGE-UNROUTED"

    # UNROUTED - OUTBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d'{"type":"fanout","durable":true}' \
    "http://$HOST_COMMON/api/exchanges/$VHOST/$ORG-OUTBOUND-EXCHANGE-UNROUTED"

echo
echo

# Create ORG queues - INBOUND and OUTBOUND:
echo "PUT a new queues for third-party $ORG routing"
echo

    # Message TTL can be added by putting the following property into arguments:
    # "x-message-ttl":60000

    # INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d'{"durable":true,"arguments":{}}' \
    "http://$HOST_COMMON/api/queues/$VHOST/$ORG-INBOUND-QUEUE"

    # INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d'{"durable":true,"arguments":{}}' \
    "http://$HOST_COMMON/api/queues/$VHOST/$ORG-OUTBOUND-QUEUE"

    # INBOUND - DEAD:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d'{"durable":true,"arguments":{}}' \
    "http://$HOST_COMMON/api/queues/$VHOST/$ORG-INBOUND-QUEUE-DEAD"

    # OUTBOUND - DEAD:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d'{"durable":true,"arguments":{}}' \
    "http://$HOST_COMMON/api/queues/$VHOST/$ORG-OUTBOUND-QUEUE-DEAD"

    # INBOUND - DEAD:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d'{"durable":true,"arguments":{}}' \
    "http://$HOST_COMMON/api/queues/$VHOST/$ORG-INBOUND-QUEUE-UNROUTED"

    # OUTBOUND - DEAD:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d'{"durable":true,"arguments":{}}' \
    "http://$HOST_COMMON/api/queues/$VHOST/$ORG-OUTBOUND-QUEUE-UNROUTED"

echo
echo

# Add specific user permissions:
echo "PUT a new $ORG-USER permissions"
echo
    
    # $ORG user:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"configure\":\"^\$\",\"write\":\"^$ORG-INBOUND-EXCHANGE\",\"read\":\"^\$\"}" \
    "http://$HOST_COMMON/api/permissions/$VHOST/$ORG-USER"

    # Routing user (persistant):
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"configure\":\"^\$\",\"write\":\".*-EXCHANGE\",\"read\":\"^VAKT-(IN|OUT)BOUND-EXCHANGE\"}" \
    "http://$HOST_COMMON/api/permissions/$VHOST/$ROUTING_USER"

echo
echo

# Add specific binding routes for exchanges:
echo "POST a new binding called for $ORG exchanges"
echo

    # INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"EXTERNAL.MEMBER.MESSAGE\", \"arguments\":{}}" \
    "http://$HOST_COMMON/api/bindings/$VHOST/e/$ORG-INBOUND-EXCHANGE/q/$ORG-INBOUND-QUEUE"

    # OUTBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"KOMGO.INTERNAL\", \"arguments\":{}}" \
    "http://$HOST_COMMON/api/bindings/$VHOST/e/$ORG-OUTBOUND-EXCHANGE/q/$ORG-OUTBOUND-QUEUE"

    # INBOUND - DEAD:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"\", \"arguments\":{}}" \
    "http://$HOST_COMMON/api/bindings/$VHOST/e/$ORG-INBOUND-EXCHANGE-DEAD/q/$ORG-INBOUND-QUEUE-DEAD"

    # OUTBOUND - DEAD:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"\", \"arguments\":{}}" \
    "http://$HOST_COMMON/api/bindings/$VHOST/e/$ORG-OUTBOUND-EXCHANGE-DEAD/q/$ORG-OUTBOUND-QUEUE-DEAD"

    # INBOUND - UNROUTED:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"\", \"arguments\":{}}" \
    "http://$HOST_COMMON/api/bindings/$VHOST/e/$ORG-INBOUND-EXCHANGE-UNROUTED/q/$ORG-INBOUND-QUEUE-UNROUTED"

    # OUTBOUND - UNROUTED:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"\", \"arguments\":{}}" \
    "http://$HOST_COMMON/api/bindings/$VHOST/e/$ORG-OUTBOUND-EXCHANGE-UNROUTED/q/$ORG-OUTBOUND-QUEUE-UNROUTED"

echo
echo

# Add specific policies to route DLX and ALT:
echo "PUT a new policies for DEAD LETTER EXCHANGES"
echo

    # INBOUND EXCHANGE DLX + ALTERNATIVE EXCHANGE:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d"{\"pattern\":\"^$ORG-INBOUND-EXCHANGE$\", \"priority\": 1, \"apply-to\": \"exchanges\", \"definition\":{
        \"dead-letter-exchange\":\"$ORG-INBOUND-EXCHANGE-DEAD\",
        \"alternate-exchange\":\"$ORG-INBOUND-EXCHANGE-UNROUTED\"
    }}" \
    "http://$HOST_COMMON/api/policies/$VHOST/POLICY-$ORG-INBOUND-EXCHANGE"

    # OUTBOUND EXCHANGE DLX + ALTERNATIVE EXCHANGE:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d"{\"pattern\":\"^$ORG-OUTBOUND-EXCHANGE$\", \"priority\": 1, \"apply-to\": \"exchanges\", \"definition\":{
        \"dead-letter-exchange\":\"$ORG-OUTBOUND-EXCHANGE-DEAD\",
        \"alternate-exchange\":\"$ORG-OUTBOUND-EXCHANGE-UNROUTED\"
    }}" \
    "http://$HOST_COMMON/api/policies/$VHOST/POLICY-$ORG-OUTBOUND-EXCHANGE"

    # INBOUND QUEUE DLX:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d"{\"pattern\":\"^$ORG-INBOUND-QUEUE$\", \"priority\": 1, \"apply-to\": \"queues\", \"definition\":{\"dead-letter-exchange\":\"$ORG-INBOUND-EXCHANGE-DEAD\"}}" \
    "http://$HOST_COMMON/api/policies/$VHOST/DLX-$ORG-INBOUND-QUEUE"

    # OUTBOUND QUEUE DLX:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d"{\"pattern\":\"^$ORG-OUTBOUND-QUEUE$\", \"priority\": 1, \"apply-to\": \"queues\", \"definition\":{\"dead-letter-exchange\":\"$ORG-OUTBOUND-EXCHANGE-DEAD\"}}" \
    "http://$HOST_COMMON/api/policies/$VHOST/DLX-$ORG-OUTBOUND-QUEUE"

echo
echo

# Dynamic shovel to send messages to the VAKT broker:
echo "PUT a new dynamic shovel for $ORG-VAKT connection"
echo

    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d'{"value":{
          "src-protocol": "amqp091", 
          "src-uri": "amqp://'$ADMIN':'$ADMIN_PW'@komgo-common-mq-node-1",
          "src-queue":  "'$ORG'-OUTBOUND-QUEUE",
          "dest-protocol": "amqp091", 
          "dest-uri": "amqp://'$USER_VAKT':'$PASS_VAKT'@komgo-vakt-mq-node-1",
          "dest-exchange": "KOMGO-INBOUND-EX"}}' \
    "http://$HOST_COMMON/api/parameters/shovel/%2f/KomComToVaktShovel"

echo
echo

echo "Total execution time : $(($(date +%s)-starttime)) secs ..."
