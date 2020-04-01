lms-mode-on () {
  [[ "$LMS_MODE" = "on" ]]
}

lms-env-vars () {
  if ! lms-mode-on; then
    return
  fi

  export MEMBER_1_STATIC_ID=$(get-company-static-id 1)
  export MEMBER_2_STATIC_ID=$(get-company-static-id 2)
  export IS_LMS_NODE=true
  export KEYCLOAK_URL=http://localhost:10070
  export KEYCLOAK_AUTH_URL=$KEYCLOAK_URL/auth
  export KEYCLOAK_SERVER_AUTH_URL=http://$DOCKER_HOST_MACHINE:10070/auth
  export KEYCLOAK_AUTH_OVERRIDE_URL=$KEYCLOAK_SERVER_AUTH_URL
  if [[ "$MEMBER_ID" = "1" ]]; then
    export COMPANY_STATIC_ID=$MEMBER_1_STATIC_ID
    export KEYCLOAK_REALM_NAME=$MEMBER_1_STATIC_ID
    env-from-single-to-multitenant $COMPANY_STATIC_ID
  elif [[ "$MEMBER_ID" = "2" ]]; then
    export COMPANY_STATIC_ID=$MEMBER_2_STATIC_ID
    export KEYCLOAK_REALM_NAME=$MEMBER_2_STATIC_ID
    env-from-single-to-multitenant $COMPANY_STATIC_ID
  elif [[ "$MEMBER_ID" = "3" ]]; then
    export API_GATEWAY_PORT=5333

    export KEYCLOAK_REALM_NAME=

    # override URLs for multitenant MS
    export API_ROLES_BASE_URL=http://api-roles:8080
    export API_AUTH_BASE_URL=http://api-auth:8080
    export API_REGISTRY_BASE_URL=http://api-registry:8080

    # point all singletenant MSs to LMS Router and start multitenant containers
    lms_router_url=http://lms-router:8080
    export API_USERS_BASE_URL=$lms_router_url/api/users
    export API_NOTIF_BASE_URL=$lms_router_url/api/notif
    export API_SIGNER_BASE_URL=$lms_router_url/api/signer
    export API_BLOCKCHAIN_SIGNER_BASE_URL=$lms_router_url/api/blockchain-signer
    export API_DOCUMENTS_BASE_URL=$lms_router_url/api/docs
    export API_COVERAGE_BASE_URL=$lms_router_url/api/coverage
  fi
}

multitenant_services=lms-router,api-auth,keycloak,client,api-gateway,mongo,api-roles,api-users,api-coverage,api-notif,api-registry,api-signer,api-blockchain-signer,ws-server,rabbitmq-internal,api-documents
singletenant_services=mongo,api-users,api-coverage,api-notif,api-signer,api-blockchain-signer,event-management,blockchain-event-management,api-documents


lms-up () {
  export LMS_MODE=on

  export MEMBER_ID=1
  docker_compose_proxy up $singletenant_services

  export MEMBER_ID=2
  docker_compose_proxy up $singletenant_services

  export MEMBER_ID=3
  docker_compose_proxy up $multitenant_services
}

lms-down () {
  export MEMBER_ID=1
  docker_compose_proxy down $singletenant_services

  export MEMBER_ID=2
  docker_compose_proxy down $singletenant_services

  export MEMBER_ID=3
  docker_compose_proxy down $multitenant_services
}

lms-update-app-state () {
  REALM_NAME=$(get-company-static-id 1)
  docker exec komgo-member-3-keycloak sh -c \
    "KEYCLOAK_REALM_NAME=$REALM_NAME /opt/jboss/keycloak/bin/scripts/keycloak-init.sh"

  REALM_NAME=$(get-company-static-id 2)
  docker exec komgo-member-3-keycloak sh -c \
    "KEYCLOAK_REALM_NAME=$REALM_NAME /opt/jboss/keycloak/bin/scripts/keycloak-init.sh"
}

get-company-static-id () {
  cat onboarding-files/member-$1/member-package.json | jq -r '.[0].staticId'
}

env-from-single-to-multitenant () {
  tenant_id=$1
  local_lms_router_url=http://$DOCKER_HOST_MACHINE:5330/multitenant/$tenant_id
  export API_ROLES_BASE_URL=$local_lms_router_url/roles
  export API_AUTH_BASE_URL=$local_lms_router_url/auth
  export API_REGISTRY_BASE_URL=$local_lms_router_url/registry
}
