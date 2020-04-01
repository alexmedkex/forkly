#!/bin/sh

set -ex

if [[ "$@" = "komgo" ]]; then
    exec node dist/main.js
fi

exec "$@"