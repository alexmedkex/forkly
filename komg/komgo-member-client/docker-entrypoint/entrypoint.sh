#!/bin/sh

set -ex

replace_var() {
    # $1 var name
    # $2 file name
    eval "value=\$$1"
    if [ -z "$value" ]; then
        echo "WARN: Undefined variable $1"
        sed -i "s,%$1%,,g" $2
    else
        echo "Setting variable $1"
        sed -i "s,%$1%,$value,g" $2
    fi
}

if [[ "$@" = 'nginx-fe' ]]; then

    # go through all JS files and replace %VAR_NAME% with VAR_NAME value from env variables
    find /var/www/app -type f -name "*.js" | while read filename; do
        replace_var REACT_APP_API_GATEWAY_URL $filename
        replace_var REACT_APP_KEYCLOAK_REALM_NAME $filename
        replace_var REACT_APP_KEYCLOAK_AUTH_URL $filename
        replace_var REACT_APP_KEYCLOAK_CLIENT_ID $filename
        replace_var REACT_APP_ZENDESK_CLIENT_ID $filename
        replace_var REACT_APP_ZENDESK_REDIRECT_URI $filename
        replace_var REACT_APP_ZENDESK_BASE_URL $filename
        replace_var REACT_APP_ZENDESK_STEPS_FIELD_ID $filename
        replace_var REACT_APP_ZENDESK_SEVERITY_FIELD_ID $filename
        replace_var REACT_APP_ALLOW_FEATURE_TOGGLES $filename
        replace_var REACT_APP_IS_KOMGO_NODE $filename
        replace_var REACT_APP_IS_LMS_NODE $filename
        replace_var REACT_APP_METRICS_AND_EMAIL_NOTIFICATIONS $filename
        replace_var REACT_APP_BUILD_ID $filename
    done

    exec nginx -g "daemon off;"
fi

exec "$@"
