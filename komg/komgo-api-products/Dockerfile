FROM node:8-alpine as builder


RUN apk update && apk upgrade && \
    apk add --no-cache bash git python make g++

WORKDIR /opt/app

# npm install expects NPM_TOKEN env var with a valid token to Nexus
# https://consensys-komgo.atlassian.net/wiki/spaces/KO/pages/50561076/Nexus
ARG NPM_TOKEN


COPY .npmrc package.json package-lock.json* ./
RUN npm i -g npm@^6.1.0 && \
    npm install

COPY . .

RUN npm run build && \
    rm -rf node_modules && \
    npm install --production


# use multistage builds to remove devDependencies
FROM node:8-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache bash

WORKDIR /opt/app

# default to port 8080 for node, and 9229 for debug
ARG PORT=8080
ENV PORT $PORT
EXPOSE $PORT 9229

COPY --from=builder /opt/app .
COPY docker-entrypoint .

# Remove .npmrc so we can run npm commands in a container without having to pass NPM_TOKEN env var
RUN rm .npmrc

RUN chown -R 1000 /opt/app
USER 1000

ENTRYPOINT [ "/opt/app/entrypoint.sh" ]
CMD [ "komgo" ]
