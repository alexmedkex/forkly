#!/bin/bash -e
if [ -z "$VAULT_BASE_DIR" ]; then
    BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/../.db/vaultdata/member-1/provision/" >/dev/null 2>&1 && pwd )"
else
    BASE_DIR="$VAULT_BASE_DIR"
fi
[ -z "$VAULT_ADDR" ] && VAULT_ADDR='http://localhost:8200'
VAULT_TOKEN='vault-development-insecure-token'
VAULT_INIT_CFG="$BASE_DIR/init-cfg.json"
ENV_DIR="$BASE_DIR/env"
TMP_WORKDIR=$(mktemp -d -t vault-api.XXXXXXXXXX)

function finish {
    rm -rf "$TMP_WORKDIR"
}
trap finish EXIT

# ==============================================================================
#  GENERIC FUNCTIONS
# ==============================================================================
function echoerr() {
    echo "[ERROR] $@" > /dev/stderr
}

function jq_has_key() {
    local jsonfile="$1"
    local path=${2:-.}
    set +e # disable temporarily exit immediately on non-zero status
    jq -e "$path" $jsonfile 1> /dev/null 2> $TMP_WORKDIR/jq-error.log
    local res=$?
    set -e # enabling exit immediately on non-zero status
    return $res
}

function jq_query() {
    local jsonfile="$1"
    local path=${2:-.}
    jq -e -r "$path" $jsonfile
}

function jq_upsert_value() {
    local file="$1"
    jq ". | .$2=\"$3\"" $file > ${file}.new
    mv ${file}.new ${file}
}

# ==============================================================================
#  VAULT HTTP API FUNCTIONS
# ==============================================================================
function print_statuscode() {
    grep "^HTTP/[1-9].[0-9]" "$TMP_WORKDIR/last-http-headers"
}

function assert_statuscode() {
    if grep -q -E "^HTTP/[1-9](\.[0-9])? $expected_statuscode" "$TMP_WORKDIR/last-http-headers"; then
        return 0
    else
        local http_statuscode=$(print_statuscode)
        echoerr "HTTP GET failed - expected HTTP $expected_statuscode but got $http_statuscode"
        return 1
    fi
}

function http_get() {
    local path="$1"
    local expected_statuscode="$2"
    curl $HTTP_ARGS -sS -D "$TMP_WORKDIR/last-http-headers" \
        --header "X-Vault-Token: $VAULT_TOKEN" \
        $VAULT_ADDR/$1
    res=$?
    if [ ! -z "$expected_statuscode" ]; then
        assert_statuscode $expected_statuscode
    else
        return $res
    fi
}

function http_post() {
    local path="$1"
    local payload="$2"
    local expected_statuscode="$3"
    curl $HTTP_ARGS -sS -D "$TMP_WORKDIR/last-http-headers" \
        --header "X-Vault-Token: $VAULT_TOKEN" \
        --request POST \
        --data "$payload" \
        $VAULT_ADDR/$1
    res=$?
    if [ ! -z "$expected_statuscode" ]; then
        assert_statuscode $expected_statuscode
    else
        return $res
    fi
}

function http_put() {
    local path="$1"
    local payload="$2"
    local expected_statuscode="$3"
    curl $HTTP_ARGS -sS -D "$TMP_WORKDIR/last-http-headers" \
        --header "X-Vault-Token: $VAULT_TOKEN" \
        --request POST \
        --data "$payload" \
        $VAULT_ADDR/$1
    res=$?
    if [ ! -z "$expected_statuscode" ]; then
        assert_statuscode $expected_statuscode
    else
        return $res
    fi
}


# ==============================================================================
# HIGH ORDER FUNCTIONS
# ==============================================================================
function load_config() {
    # 1) sanitize configuration file
    # 1.1) ensure file exists
    if ! [ -f $VAULT_INIT_CFG ]; then
        echoerr "configuration file not found: $VAULT_INIT_CFG"
        return 1
    fi
    # 1.2) ensure the following keys exist
    if ! jq_has_key $VAULT_INIT_CFG '.root_token'; then
        echoerr "JSON key 'root_token' is missing from $VAULT_INIT_CFG"
        return 1
    fi
    if ! jq_has_key $VAULT_INIT_CFG '.keys'; then
        echoerr "JSON key 'keys' is missing from $VAULT_INIT_CFG"
        return 1
    fi
    if ! jq_has_key $VAULT_INIT_CFG '.keys_base64'; then
        echoerr "JSON key 'keys_base64' is missing from $VAULT_INIT_CFG"
        return 1
    fi
    # 1.3) ensure keys + keys_base64 have the same and positive length
    local keys_len=$(jq_query $VAULT_INIT_CFG '.keys | length')
    local keys_base64_len=$(jq_query $VAULT_INIT_CFG '.keys_base64 | length')
    if [ $keys_len -le 0 ]; then
        echoerr "JSON 'keys' array is empty from $VAULT_INIT_CFG"
        return 1
    fi
    if [ $keys_base64_len -le 0 ]; then
        echoerr "JSON 'keys_base64' array is empty from $VAULT_INIT_CFG"
        return 1
    fi
    if ! [ $keys_len -eq $keys_base64_len ]; then
        echoerr "JSON 'keys' and 'keys_base64' array length mismatch from $VAULT_INIT_CFG"
        return 1
    fi

    # 2) load root token
    VAULT_TOKEN=$(jq_query $VAULT_INIT_CFG '.root_token')
}

function is_vault_initialized() {
    local is_initialized=$(http_get v1/sys/init | jq -r '.initialized')
    if [ "$is_initialized" = 'true' ]; then
        return 0
    elif [ "$is_initialized" = 'false' ]; then
        return 1
    else
        echoerr "unable to determine if vault is initialized, vault returned: $is_initialized"
        exit 1
    fi
}

function is_vault_sealed() {
    local is_sealed=$(http_get v1/sys/seal-status | jq -r '.sealed')
    if [ "$is_sealed" = 'true' ]; then
        return 0
    elif [ "$is_sealed" = 'false' ]; then
        return 1
    else
        echoerr "unable to determine if vault is sealed, vault returned: $is_sealed"
        exit 1
    fi
}

function add_approle() {
    role_name="$1"
    path_name="$2"
    env_var_prefix="$3"

    # as of now, it just adds approle if it doesn't exist
    if http_get "v1/auth/approle/role/$role_name" 404 > /dev/null 2>&1; then
        echo "[auth] creating new approle ${role_name}..."

        # generate role_id
        local payload='{"token_ttl": "0m","token_max_ttl": "0m","policies": ["default"],"period": 0,"bind_secret_id": true}'
        http_post v1/auth/approle/role/$role_name "$payload"
        local reply=$(http_get v1/auth/approle/role/$role_name/role-id)
        local role_id=$(echo "$reply" | jq -e -r '.data.role_id')

        # generate secret_id
        local payload="{}"
        local reply=$(http_post v1/auth/approle/role/$role_name/secret-id "$payload")
        local secret_id=$(echo "$reply" | jq -e -r '.data.secret_id')

        # generate source files + env.json
        echo "${env_var_prefix}_VAULT_ROLE_ID=$role_id" > $BASE_DIR/env/${role_name}.source
        echo "${env_var_prefix}_VAULT_SECRET_ID=$secret_id" >> $BASE_DIR/env/${role_name}.source
        jq_upsert_value "$ENV_DIR/env.json" "vaultCredentials.${path_name}.envVarPrefix" "$env_var_prefix"
        jq_upsert_value "$ENV_DIR/env.json" "vaultCredentials.${path_name}.roleId"       "$role_id"
        jq_upsert_value "$ENV_DIR/env.json" "vaultCredentials.${path_name}.secretId"     "$secret_id"
        echo "[auth] added new approle $role_name to $BASE_DIR/env/$role_name"
    elif http_get "v1/auth/approle/role/$role_name" 200 > /dev/null 2>&1; then
        echo "[auth] skipping, approle $role_name already exists"
    else
        echoerr "Failed to add approle $role_name:"
        print_statuscode > /dev/stderr
        http_get "v1/auth/approle/role/$role_name" > /dev/stderr
    fi
}

function add_policy_to_role() {
    role_name="$1"
    path="$2"

    # create policy for create/read
    app_create_policy_payload="{
        \"policy\": \"path \\\"${path}\\\" { capabilities = [\\\"create\\\", \\\"update\\\", \\\"read\\\"] }\"
    }"

    if http_put v1/sys/policies/acl/$role_name "$app_create_policy_payload" 204; then
        echo "[policy] create/read policy added ${path} created successfully"
    else
        echo "[policy] failed to create policy ${path}"
        print_statuscode
        exit 1
    fi

    app_read_role_payload="{
        \"policies\": \"${role_name}\"
    }"

    if http_post v1/auth/approle/role/$role_name "$app_read_role_payload" 204; then
        echo "[policy] create/read policy added ${path} to $role_name successfully"
    else
        echo "[policy] failed to add policy ${path} to $role_name"
        print_statuscode
        exit 1
    fi
}

function register_plugin() {
    #set -x
    sha256="$(cat $BASE_DIR/plugins/keymgmt.sha)"
    payload="{ \"sha256\": \"${sha256}\", \"command\": \"keymgmt\" }"

    reply=$(http_get  v1/sys/plugins/catalog 200)
    if [[ $(echo "$reply" | jq -r '.data.secret[] | select(contains("keymgmt"))') ]]; then
        echo "[plugins] skipping, plugin keymgmt already registered"
    else
        echo "[plugins] enabling plugin keymgmt"
        if http_post v1/sys/plugins/catalog/secret/keymgmt "$payload" 204; then
            echo "[plugins] plugin keymgmt was registered successfully"
        else
            echoerr "[plugins] failed to register keymgmt plugin"
            exit 1
        fi
    fi
}

function enable_plugin() {
    plugin_name="$1"
    payload="$2"
    local mounts_list=$(http_get v1/sys/mounts)
    if echo "$mounts_list" | jq -e ".\"${plugin_name}/\"" > /dev/null; then
        echo "[plugins] skipping, $plugin_name plugin is already enabled"
    else
        echo "[plugins] enabling $plugin_name..."
        http_post v1/sys/mounts/$plugin_name "$payload"
        echo "[plugins] enabled plugin $plugin_name successfully"
    fi
}

function base_config() {
    # initialize vault if necessary
    if ! is_vault_initialized; then
        echo "[init] initializing vault..."
        local payload='{"secret_shares": 10,"secret_threshold": 5}'
        local reply=$(http_put v1/sys/init "$payload" 200)
        if [ $? -eq 0 ]; then
            echo "$reply" | jq -r '.' > $VAULT_INIT_CFG
        else
            echoerr "Failed to initialize vault: $reply"
            exit 1
        fi
        mkdir -p $ENV_DIR
        rm -f $ENV_DIR/*
        echo "{}" > $ENV_DIR/env.json
        echo "[init] initialized vault successfully"
    else
        echo "[init] skipping, vault is already initialized"
    fi

    # ensure configuration file is valid and loads VAULT_TOKEN variable
    load_config

    # unseal vault if necessary
    if is_vault_sealed; then
        echo "[seal] unsealing vault..."
        for key in $(jq_query $VAULT_INIT_CFG '.keys[]'); do
            echo "[seal] - submitting unseal key: $(printf "%0.s*" {1..24})${key:60}"
            local payload="{\"key\": \"$key\"}"
            local reply=$(http_put v1/sys/unseal "$payload")
            local is_sealed=$(echo "$reply" | jq -r '.sealed')
            local progress=$(echo "$reply" | jq -r '.progress')
            local threshold=$(echo "$reply" | jq -r '.t')
            if [ "$is_sealed" = 'false' ]; then
                break;
            else
                echo "[seal] - vault is still sealed (progress: ${progress}/${threshold}), using next key"
            fi
        done
        echo "[seal] vault was unsealed successfully"
    else
        echo "[seal] skipping, vault is already unsealed"
    fi

    # enable secret engine K/V on secret/ path
    enable_plugin "secret" '{
        "type": "kv",
        "description": "Komgo K/V",
        "options": {
            "version": "2"
        }
    }'

    if http_post v1/secret/config '{"max_versions": -1}'; then
        echo "[secret] configured secrets engine successfully"
    else
        echo "[secret] failed to configure secrets engine"
        print_statuscode
        exit 1
    fi

    # enable auth/approle
    local auth_list=$(http_get v1/sys/auth)
    if echo "$auth_list" | jq -e '."approle/"' > /dev/null; then
        echo "[auth] skipping, approle is already enabled"
    else
        echo "[auth] enabling approle..."
        local payload='{"type":"approle"}'
        http_post v1/sys/auth/approle "$payload"
        echo "[auth] enabled approle successfully"
    fi

    # enable secret/keymgmt
    register_plugin
    enable_plugin "keymgmt" '{ "type": "keymgmt" }'

    # provision approles + policies
    add_approle        'companyEthKey' 'apiBlockchainSigner' 'API_BLOCKCHAIN_SIGNER'
    add_policy_to_role 'companyEthKey' 'secret/data/*'

    add_approle        'companyRsaKey' 'apiSigner' 'API_SIGNER'
    add_policy_to_role 'companyRsaKey' 'secret/data/rsa-key'

}

# script entry point
if ! [ "$1" = 'base-config' ]; then
    load_config
fi
case $1 in
    init) http_get v1/sys/init ;;
    get-mounts) http_get v1/sys/mounts | jq;;
    keymgmt-enable)
        payload='{ "type": "keymgmt" }'
        http_post v1/sys/mounts/keymgmt "$payload"
        ;;
    kv-enable)
        payload='{"type":"kv", "description":"trolorololo", "options": {"version": "1"}}'
        http_post v1/sys/mounts/kv "$payload"
        ;;
    kv-put-secret)
        key=$(echo $2 | cut -d'=' -f1)
        value=$(echo $2 | cut -d'=' -f2)
        payload="{ \"$key\": \"$value\" }"
        echo $payload
        http_post v1/kv/lol "$payload"
        ;;
    kv-get-secret)
        http_get v1/kv/lol
        ;;
    base-config) base_config;;
    approle-read) http_get v1/auth/approle/role/$2 200 | jq;;
    *) echo "Unexpected operation: $1" && exit 1;;
esac
