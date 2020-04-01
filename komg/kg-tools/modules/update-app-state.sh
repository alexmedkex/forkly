run-db-migration-for-ms () {
  container_name=$1
  if [[ -n `docker ps | grep $container_name` ]]; then
    log-h1 "Run DB migrations in $container_name"
    docker exec $container_name sh -c "npm run migration:up"
  else
    log-warn "Container '$container_name' is not running. Skipping migration"
  fi
}

update-app-state () {
  set -e

  if [[ -z `docker ps | grep komgo-member-$MEMBER_ID-mongo` ]]; then
    log-error "No mongodb running, exiting"
    exit 1
  fi

  run-db-migration-for-ms komgo-member-$MEMBER_ID-api-roles
  run-db-migration-for-ms komgo-member-$MEMBER_ID-api-documents
  run-db-migration-for-ms komgo-member-$MEMBER_ID-api-trade-cargo
  run-db-migration-for-ms komgo-member-$MEMBER_ID-api-receivable-finance
  run-db-migration-for-ms komgo-member-$MEMBER_ID-api-rfp
  run-db-migration-for-ms komgo-member-$MEMBER_ID-api-signer
  run-db-migration-for-ms komgo-member-$MEMBER_ID-api-products
  run-db-migration-for-ms komgo-member-$MEMBER_ID-api-template

  if [[ -n `docker ps | grep komgo-member-$MEMBER_ID-keycloak` ]]; then
    log-h1 "Configure Keycloak and add pre-defined roles and users"
    docker exec komgo-member-$MEMBER_ID-keycloak /opt/jboss/keycloak/bin/scripts/keycloak-init.sh
  else
    log-warn "Keycloak is not running. Skipping configuration"
  fi

  echo
  log-success "Migrations complete!"
}
