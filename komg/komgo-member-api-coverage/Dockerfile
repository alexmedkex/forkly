FROM hbr.solutions.consensys-uk.net/komgo/komgo-nodejs-base-image:node-10-alpine as builder

# npm install expects NPM_TOKEN env var with a valid token to Nexus
# https://consensys-komgo.atlassian.net/wiki/spaces/KO/pages/50561076/Nexus
ARG NPM_TOKEN

COPY .npmrc package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build && \
  rm -rf node_modules && \
  npm install --production

# use multistage builds to remove devDependencies
FROM hbr.solutions.consensys-uk.net/komgo/komgo-nodejs-base-image:node-10-alpine

# default to port 8080 for node, and 5858 or 9229 for debug
ARG PORT=8080
ENV PORT $PORT
EXPOSE $PORT 9229

COPY --from=builder /opt/app .

# Remove .npmrc so we can run npm commands in a container without having to pass NPM_TOKEN env var
# cleanup private keys from node modules (test subfolders only)
RUN rm .npmrc && \
  find ./ -path './node_modules/*/test/*' -type f \( -iname \*.key -o -iname \*.pem -o -iname \*.priv \) -delete

RUN chown -R 1000 /opt/app/
USER 1000

ENTRYPOINT [ "/opt/app/docker-entrypoint/entrypoint.sh" ]
CMD [ "komgo" ]
