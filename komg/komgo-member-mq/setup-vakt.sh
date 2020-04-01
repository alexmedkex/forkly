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

USER=VaktGuestAccount
PW_SEED=Tostoresomewhere

starttime=$(date +%s)

#Password generation using the password seed informed
chmod 0755 ./config/password-hash-gen
PASSWORD_HASH=$(./config/password-hash-gen $PW_SEED)

# HOSTS:
HOST_VAKT="localhost:15674"
VHOST="%2F"

# Create ORG user:
echo "PUT new $ORG user"
echo

    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"password_hash\":\"$PASSWORD_HASH\",\"tags\":\"guests\"}" \
    "http://$HOST_VAKT/api/users/$USER"

echo
echo

# Create KOMGO exchanges - INBOUND and OUTBOUND:
echo "PUT new KOMGO exchanges - INBOUND and OUTBOUND"
echo
    
    # INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d'{"type":"fanout","durable":true, "arguments":{}}' \
    "http://$HOST_VAKT/api/exchanges/$VHOST/KOMGO-INBOUND-EX"

    # OUTBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d'{"type":"fanout","durable":true, "arguments":{}}' \
    "http://$HOST_VAKT/api/exchanges/$VHOST/KOMGO-OUTBOUND-EX"

echo
echo

# Create KOMGO queues - INBOUND and OUTBOUND:
echo "PUT a new queues for KOMGO routing"
echo

    # INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d'{"arguments":{}}' \
    "http://$HOST_VAKT/api/queues/$VHOST/KOMGO-INBOUND-QUEUE"

    # INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d'{"arguments":{}}' \
    "http://$HOST_VAKT/api/queues/$VHOST/KOMGO-OUTBOUND-QUEUE"

echo
echo

# Add specific binding routes for exchanges:
echo "POST a new binding called for $ORG exchanges"
echo

    # INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"\", \"arguments\":{}}" \
    "http://$HOST_VAKT/api/bindings/$VHOST/e/KOMGO-INBOUND-EX/q/KOMGO-INBOUND-QUEUE"

    # OUTBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"\", \"arguments\":{}}" \
    "http://$HOST_VAKT/api/bindings/$VHOST/e/KOMGO-OUTBOUND-EX/q/KOMGO-OUTBOUND-QUEUE"

echo
echo

# Add specific user permissions:
echo "PUT a new $ORG-USER permissions"
echo
    
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"configure\":\".*\",\"write\":\".*\",\"read\":\".*\"}" \
    "http://$HOST_VAKT/api/permissions/$VHOST/$USER"
    # full access for developer purposes

echo
echo

echo "Total execution time : $(($(date +%s)-starttime)) secs ..."
