#!/bin/sh

set -ex

if [[ "$@" = "komgo" ]]; then
    exec node dist/start.js
fi

exec "$@"
