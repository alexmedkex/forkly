# if you're doing anything beyond your local machine, please pin this to a specific version at https://hub.docker.com/_/node/
FROM hbr.solutions.consensys-uk.net/komgo/komgo-nodejs-base-image:node-10-alpine as builder


ARG NPM_TOKEN

# install app dependencies first, in a different location for easier app bind mounting for local development
COPY .npmrc package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build && \
  rm -rf node_modules && \
  npm install --production

# use multistage builds to hide NPM_TOKEN
FROM hbr.solutions.consensys-uk.net/komgo/komgo-nodejs-base-image:node-10-alpine

# default to port 8080 for node, and 5858 or 9229 for debug
ARG PORT=8080
ENV PORT $PORT
EXPOSE $PORT 9229

COPY --from=builder /opt/app .
COPY docker-entrypoint .
RUN chmod 0755 entrypoint.sh

# Remove .npmrc so we can run npm commands in a container without having to pass NPM_TOKEN env var
RUN rm .npmrc

# cleanup private keys from node modules (test subfolders only)
RUN find ./ -path './node_modules/*/test/*' -type f \( -iname \*.key -o -iname \*.pem -o -iname \*.priv \) -delete

RUN chown -R 1000 /opt/app
USER 1000

ENTRYPOINT [ "/opt/app/entrypoint.sh" ]
CMD [ "komgo" ]
