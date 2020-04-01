#!/bin/bash -e

# -------------------------------
# Required environment variables:
# -------------------------------
# KEYCLOAK_USER - master username
# KEYCLOAK_PASSWORD - master password
# KEYCLOAK_REALM_NAME
# KEYCLOAK_CLIENT_ID
# KEYCLOAK_ALLOWED_CORS_ORIGIN - Allowed origin
# SMTP_HOST - hostname or IP of SMTP server
# SMTP_PORT - (optional)
# MAIL_FROM - email address from whom Keycloak will send emails
# KEYCLOAK_USER_DEFAULT_PASSWORD - secret

KEYCLOAK_ADMIN_AUTH_URL=http://localhost:8080/auth
KEYCLOAK_HOME=/opt/jboss/keycloak/bin
REALM_NAME=$KEYCLOAK_REALM_NAME
CLIENT_ID=$KEYCLOAK_CLIENT_ID

main () {
  attempt_counter=0
  max_attempts=120
  initlialization_log=$KEYCLOAK_HOME/keycloak-init.log
  until $(curl --output /dev/null --silent --head --fail $KEYCLOAK_ADMIN_AUTH_URL); do
   if [ ${attempt_counter} -eq ${max_attempts} ];then
    echo "Max attempts reached"
    exit 1
   fi
   echo 'Waiting for keycloak to start' >> $initlialization_log
   attempt_counter=$(($attempt_counter+1))
   sleep 5
  done

  cd $KEYCLOAK_HOME
  check_env_vars
  login
  if $(./kcadm.sh get realms/$REALM_NAME &> /dev/null); then
    echo "Realm $REALM_NAME already exists. Exiting..."
    exit 0
  fi
  create_realm
  create_roles
  create_users
  create_client
}

check_env_vars () {
  # Check that we have all necessary variables
  requiredEnvVars=( KEYCLOAK_USER KEYCLOAK_PASSWORD KEYCLOAK_REALM_NAME KEYCLOAK_CLIENT_ID KEYCLOAK_ALLOWED_CORS_ORIGIN SMTP_HOST MAIL_FROM )
  ok=true
  for i in "${requiredEnvVars[@]}"; do
      if [ -z "${!i}" ]; then
          echo "$i is not set"
          ok=false
      fi
  done

  [ "$ok" = true ] || exit 1
}

login () {
  set +x
  ./kcadm.sh config credentials --server $KEYCLOAK_ADMIN_AUTH_URL --realm master --user $KEYCLOAK_USER --password $KEYCLOAK_PASSWORD
  set -x
}

create_realm () {
  if [ $KEYCLOAK_SSL = 'true' ]; then
    ssl_flag='-s sslRequired="all"'
  fi

  ./kcadm.sh create realms \
    -s realm=$REALM_NAME \
    -s enabled=true \
    -s resetPasswordAllowed=false \
    -s registrationAllowed=false \
    $ssl_flag \
    -s verifyEmail=true \
    -s passwordPolicy="length(12) and specialChars(1) and upperCase(1) and lowerCase(1) and digits(1)"\
    -s loginTheme=komgo \
    -s emailTheme=komgo \
    -s loginWithEmailAllowed=true \
    -s smtpServer.host="$SMTP_HOST" \
    -s smtpServer.port="$SMTP_PORT" \
    -s smtpServer.auth="${SMTP_AUTH:-false}" \
    -s smtpServer.user="$SMTP_AUTH_USER" \
    -s smtpServer.password="$SMTP_AUTH_PASS" \
    -s smtpServer.ssl="${SMTP_SSL:-false}" \
    -s smtpServer.starttls="${SMTP_TLS:-false}" \
    -s smtpServer.from="$MAIL_FROM"


  # uncomment to see all settings
  # ./kcadm.sh get realms/$REALM_NAME

  # Enable logging of all events. Set expiration for events to 1 year
  ./kcadm.sh update events/config -r $REALM_NAME \
    -s eventsEnabled=true \
    -s adminEventsEnabled=true \
    -s adminEventsDetailsEnabled=true \
    -s eventsExpiration=31536000
}

create_roles () {
declare -a roles=(
	"userAdmin"
  "kycAnalyst"
  "complianceOfficer"
  "tradeFinanceOfficer"
  "relationshipManager"
  "middleAndBackOfficer"
  "kapsuleAdmin"
  )

  for role in "${roles[@]}"
  do
    ./kcadm.sh create roles -r $REALM_NAME -s name=$role
  done

  echo "[ Updating userAdmin roles with 'manage-users' permissions ]"
  realm_mgt_client_id=$(./kcadm.sh get realms/$REALM_NAME/clients |jq '.[] |select(.clientId == "realm-management")| .id ' | tr -d '"')
  ./kcadm.sh get realms/$REALM_NAME/clients/$realm_mgt_client_id/roles/manage-users | jq '[.]'> /tmp/query_role.json
  role_to_update=$(./kcadm.sh get realms/$REALM_NAME/roles |jq '.[] |select(.name == "userAdmin")| .id ' | tr -d '"')
  ./kcadm.sh create realms/$REALM_NAME/roles-by-id/$role_to_update/composites -f /tmp/query_role.json
  unset realm_mgt_client_id
  unset role_to_update
  rm /tmp/query_role.json
  echo "[ Done ]"
}

create_users () {
  if [ "$SET_TEMP_PASSWORDS" = "true" ]; then isTemporary="-t"; fi

  while IFS=, read -r username firstName lastName email rolename password
  do
    if [ "$username" = "Username" ] || [ -z "$username" ]; then
      continue # skip the header or an empty row
    fi

    ./kcadm.sh create users -r $REALM_NAME \
      -s username="$username" \
      -s enabled=true \
      -s emailVerified=true \
      -s firstName="$firstName" \
      -s lastName="$lastName" \
      -s email="$email"

    if [ -z "$password" ] && [ ! -z "$KEYCLOAK_USER_DEFAULT_PASSWORD" ]; then
      password=$KEYCLOAK_USER_DEFAULT_PASSWORD
    fi

    if [ "$username" = "kapsuleadmin" ]; then
      ./kcadm.sh set-password -r $REALM_NAME --username "$username" --new-password $password
    else
      ./kcadm.sh set-password -r $REALM_NAME --username "$username" $isTemporary --new-password $password
    fi

    IFS="|" read -ra ADDR <<< "${rolename}"
    for i in "${ADDR[@]}"
    do
      :
      ./kcadm.sh add-roles -r $REALM_NAME --uusername "$username" --rolename "$i"
    done

  done < scripts/users.csv
}

create_client () {
  CID=$(./kcadm.sh create clients -r $REALM_NAME \
    -s "redirectUris=[\"$KEYCLOAK_ALLOWED_CORS_ORIGIN/*\"]" \
    -s "webOrigins=[\"$KEYCLOAK_ALLOWED_CORS_ORIGIN\"]" \
    -s directAccessGrantsEnabled=true \
    -s publicClient=true \
    -s clientId=$CLIENT_ID \
    -i)
  echo "Client ID: $CID"

  ./kcadm.sh get clients/$CID -r $REALM_NAME --fields 'webOrigins,redirectUris'
}

main
