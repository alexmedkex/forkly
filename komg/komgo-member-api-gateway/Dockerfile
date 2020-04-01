FROM node:8 as swagger-iu

WORKDIR /swagger-iu

RUN npm install swagger-ui-dist@3.18.2

COPY swagger-ui-overrides ./node_modules/swagger-ui-dist/


FROM alpine:3.10

WORKDIR /komgo

EXPOSE 8080

ENV RESOLVER_ADDR=127.0.0.11
RUN apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/testing \
      openresty=1.15.8.1-r0
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf
COPY 404.html /usr/local/openresty/nginx/html/404.html
COPY entrypoint.sh .
COPY --from=swagger-iu /swagger-iu/node_modules/swagger-ui-dist ./swagger-ui/


# Fix CVE-2018-20679, CVE-2018-20679, CVE-2019-5747, CVE-2019-5747
RUN apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main \
      busybox=1.31.0-r0 \
      bzip2 \
      libpng && \
    mkdir -p /var/lib/nginx/nginx/logs/ && \
    chown -R 1000 /var/lib/nginx/ && \
    chown -R 1000 /etc/nginx/conf.d/ && \
    chown -R 1000 /var/log/nginx/ && \
    chown -R 1000 /var/run/nginx/

USER 1000

ENTRYPOINT ["/komgo/entrypoint.sh"]
