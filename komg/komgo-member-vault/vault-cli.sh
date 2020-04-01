#!/bin/bash
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
VAULT_ADDR='http://127.0.0.1:8200'
MEMBER="${MEMBER:-1}"

function run_in_container() {
    echo -e "\n===== $@ ====="
    docker exec -it --env VAULT_ADDR=$VAULT_ADDR komgo-member-$MEMBER-vault vault $@
}

#run_in_container vault status
#run_in_container vault operator init
#run_in_container vault unseal

function extract_root_token() {
    if [ -f "$1" ]; then
        echo "$(cat "$1" | jq -r '.root_token')"
    fi
}

case "$1" in
    login)
        root_token="$(extract_root_token $BASE_DIR/../.db/vaultdata/member-$MEMBER/provision/init-cfg.json)"
        run_in_container login $root_token
        ;;
    *) run_in_container $@;;
esac
