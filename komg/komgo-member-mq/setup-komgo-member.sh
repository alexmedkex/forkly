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

printf "Enter MNID: "
read MNID

printf "Enter password seed: "
stty -echo
read PW_SEED
stty echo
echo

starttime=$(date +%s)

#Password generation using the password seed informed
chmod 0755 ./config/password-hash-gen
PASSWORD_HASH=$(./config/password-hash-gen $PW_SEED)
ROUTING_HASH=$(./config/password-hash-gen $ROUTING_PASS)

# HOSTS:
HOST_COMMON="localhost:15673"
VHOST="%2F"

# Create users:
echo "PUT new $MNID user"
echo

    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"password_hash\":\"$PASSWORD_HASH\",\"tags\":\"management\"}" \
    "http://$HOST_COMMON/api/users/$MNID-USER"

echo
echo

# Create excange:
echo "PUT new $MNID exchange"
echo

    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d'{"type":"direct","durable":true, "arguments":{}}' \
    "http://$HOST_COMMON/api/exchanges/$VHOST/$MNID-EXCHANGE"

echo
echo

# Create queue:
echo "PUT a new queues for third-party $MNID routing"
echo

    # INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d'{"durable":true,"arguments":{}}' \
    "http://$HOST_COMMON/api/queues/$VHOST/$MNID-QUEUE"

echo
echo

# Add specific user permissions:
echo "PUT a new $MNID-USER permissions"
echo

    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"configure\":\"^\$\",\"write\":\".*-EXCHANGE\",\"read\":\"^$MNID-QUEUE\$\"}" \
    "http://$HOST_COMMON/api/permissions/$VHOST/$MNID-USER"

echo
echo

# Add specific binding routes for exchanges:
echo "POST a new binding called for $MNID exchanges"
echo

    # INBOUND:
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"KOMGO.INTERNAL\", \"arguments\":{}}" \
    "http://$HOST_COMMON/api/bindings/$VHOST/e/$MNID-EXCHANGE/q/$MNID-QUEUE"

echo
echo

echo "Total execution time : $(($(date +%s)-starttime)) secs ..."
