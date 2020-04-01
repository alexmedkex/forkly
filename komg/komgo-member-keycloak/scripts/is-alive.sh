#!/bin/bash -e

KEYCLOAK_ADMIN_AUTH_URL=http://localhost:8080/auth
KEYCLOAK_HOME=/opt/jboss/keycloak/bin
REALM_NAME=$KEYCLOAK_REALM_NAME

cd $KEYCLOAK_HOME

./kcadm.sh config credentials --server $KEYCLOAK_ADMIN_AUTH_URL --realm master --user $KEYCLOAK_USER --password $KEYCLOAK_PASSWORD

./kcadm.sh get realms/$REALM_NAME
