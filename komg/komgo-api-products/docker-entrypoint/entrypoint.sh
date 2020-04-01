#!/bin/sh

set -ex

if echo $BLOCKCHAIN_HOST | grep -q kaleido.io; then
    export KALEIDO_USER=$BLOCKCHAIN_USER
    export KALEIDO_PASSWORD=$BLOCKCHAIN_PASSWORD
fi

if [[ "$@" = "komgo" ]]; then
    exec node dist/run-server.js
fi

exec "$@"
