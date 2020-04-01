# if you're doing anything beyond your local machine, please pin this to a specific version at https://hub.docker.com/_/node/
FROM hbr.solutions.consensys-uk.net/komgo/komgo-nodejs-base-image:node-10-alpine as builder

ARG NPM_TOKEN

# install app dependencies first, in a different location for easier app bind mounting for local development
COPY .npmrc package.json package-lock.json* ./
RUN npm i -g npm@^6.1.0 && \
    npm install

COPY . .

RUN npm run build

# use multistage builds to hide NPM_TOKEN
FROM hbr.solutions.consensys-uk.net/komgo/komgo-nodejs-base-image:node-10-alpine

# default to port 80 for node, and 5858 or 9229 for debug
ARG PORT=8080
ENV PORT $PORT
EXPOSE $PORT 9229

COPY --from=builder /opt/app .

RUN chown -R 1000 /opt/app/
USER 1000

ENTRYPOINT [ "/opt/app/docker-entrypoint/entrypoint.sh" ]
CMD [ "komgo" ]
