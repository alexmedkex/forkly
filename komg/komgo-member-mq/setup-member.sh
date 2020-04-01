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

#Password generation using the password seed informed
chmod 0755 ./config/password-hash-gen
PASSWORD_HASH=$(./config/password-hash-gen $PW_SEED)
echo
echo "Password hash generated: $PASSWORD_HASH"
echo

echo "PUT a new organisation called $ORG"
echo
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"password_hash\":\"$PASSWORD_HASH\",\"tags\":\"management\"}" \
    "http://localhost:15672/api/users/$ORG"
echo
echo

UUID_ORG=$(uuidgen)
E_UUID="$UUID_ORG-EXCHANGE"

echo "PUT a new exchange $E_UUID for organisation $ORG"
echo
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPUT -d'{"type":"topic","durable":true}' \
    "http://localhost:15672/api/exchanges/%2F/$E_UUID"
echo
echo

DOCMGMT_Q_UUID="$UUID_ORG-DOCMGMT.$E_UUID"

echo "PUT a new queue $DOCMGMT_Q_UUID for organisation $ORG"
echo
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"type\":\"topic\",\"durable\":true, \"arguments\": {\"x-dead-letter-exchange\":	\"$E_UUID\", \"x-dead-letter-routing-key\":	\"$UUID_ORG-DOCMGMT.dead\"}}" \
    "http://localhost:15672/api/queues/%2F/$DOCMGMT_Q_UUID"
echo
echo

REQDOC_B="KOMGO.DOCUMENTS.RequestDocuments"

echo "POST a binding for $REQDOC_B for organisation $ORG between exchange $E_UUID and queue $DOCMGMT_Q_UUID"
echo
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"$REQDOC_B\", \"arguments\":{}}" \
    "http://localhost:15672/api/bindings/%2F/e/$E_UUID/q/$DOCMGMT_Q_UUID"
echo
echo

SENDOC_B="KOMGO.DOCUMENTS.SendDocuments"

echo "POST a binding for $SENDOC_B for organisation $ORG between exchange $E_UUID and queue $DOCMGMT_Q_UUID"
echo
    curl -i -u $ADMIN:$ADMIN_PW -H "content-type:application/json" \
    -XPOST -d"{\"routing_key\":\"$SENDOC_B\", \"arguments\":{}}" \
    "http://localhost:15672/api/bindings/%2F/e/$E_UUID/q/$DOCMGMT_Q_UUID"
echo
echo

echo "PUT permissions for $ORG for components that start with $UUID_ORG"
echo
    curl -i -u $ADMIN:$ADMIN_PW -H \
    "content-type:application/json" \
    -XPUT -d"{\"configure\":\"$UUID_ORG*\",\"write\":\".*\",\"read\":\"$UUID_ORG*\"}" \
    "http://localhost:15672/api/permissions/%2F/$ORG"
echo
echo

echo "Total execution time : $(($(date +%s)-starttime)) secs ..."