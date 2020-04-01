#!/bin/bash

# This script may be useful if you want to run SMS project locally and use docker images built locally
# Usage:
#   ./kg cde
#   ./kg build all --rebuild
#   ./kg-tools/dev-to-release-images.sh
#   Then you can start the SMS project and it will use your images

set -ex

docker tag komgo-api-documents:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-api-documents:latest
docker tag komgo-member-api-auth:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-auth:latest
docker tag komgo-member-api-blockchain-signer:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-blockchain-signer:latest
docker tag komgo-member-api-coverage:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-coverage:latest
docker tag komgo-member-api-gateway:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-gateway:latest
docker tag komgo-member-api-notif:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-notif:latest
docker tag komgo-member-api-receivable-finance:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-receivable-finance:latest
docker tag komgo-member-api-registry:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-registry:latest
docker tag komgo-member-api-rfp:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-rfp:latest
docker tag komgo-member-api-roles:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-roles:latest
docker tag komgo-member-api-signer:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-signer:latest
docker tag komgo-member-api-timer:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-timer:latest
docker tag komgo-member-api-trade-cargo:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-trade-cargo:latest
docker tag komgo-member-api-trade-finance:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-trade-finance:latest
docker tag komgo-member-api-users:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-users:latest
docker tag komgo-member-api-credit-lines:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-api-credit-lines:latest
docker tag komgo-member-blockchain-event-management:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-blockchain-event-management:latest
docker tag komgo-member-client:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-client:latest
docker tag komgo-member-event-management:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-event-management:latest
docker tag komgo-member-keycloak:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-keycloak:latest
docker tag komgo-member-ws-server:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-ws-server:latest
docker tag komgo-member-vault:latest hbr.solutions.consensys-uk.net/komgo-release/komgo-member-vault:latest

cd komgo-member-mq
docker build -t hbr.solutions.consensys-uk.net/komgo-release/komgo-member-mq:latest .
cd -

echo
echo Done