FROM node:8-alpine as builder

WORKDIR /opt/app

ARG NPM_TOKEN

COPY .npmrc package.json package-lock.json* ./
RUN npm i -g npm@^6.1.0 && \
  npm install

COPY . .

RUN npm run build && \
  rm -rf node_modules && \
  npm install --production


FROM node:8-alpine

RUN apk add --no-cache "busybox=1.31.0-r1" --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main

WORKDIR /opt/app

ARG PORT=8080
ENV PORT $PORT
EXPOSE $PORT 9229

COPY --from=builder /opt/app .
COPY docker-entrypoint .

# Remove .npmrc so we can run npm commands in a container without having to pass NPM_TOKEN env var
# cleanup private keys from node modules (test subfolders only)
RUN rm .npmrc && \
  find ./ -path './node_modules/*/test/*' -type f \( -iname \*.key -o -iname \*.pem -o -iname \*.priv \) -delete


RUN chown -R 1000 /opt/app
USER 1000

ENTRYPOINT [ "/opt/app/entrypoint.sh" ]
CMD [ "komgo" ]
