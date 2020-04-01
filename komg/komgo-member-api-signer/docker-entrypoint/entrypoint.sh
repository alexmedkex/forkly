#!/bin/sh

set -ex

if [[ "$@" = "komgo" ]]; then
    exec node dist/run-server.js
fi

exec "$@"
