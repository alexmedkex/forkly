#!/bin/sh

if [ -z "$RESOLVER_ADDR" ]; then
  echo "Undefined variable RESOLVER_ADDR"
  exit 1
fi

sed -i "s,%RESOLVER_ADDR%,$RESOLVER_ADDR,g" /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
