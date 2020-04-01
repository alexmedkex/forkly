FROM openresty/openresty:1.13.6.2-alpine

WORKDIR /komgo

EXPOSE 8080

ENV RESOLVER_ADDR=127.0.0.11

COPY default.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY entrypoint.sh .

ENTRYPOINT ["/komgo/entrypoint.sh"]
