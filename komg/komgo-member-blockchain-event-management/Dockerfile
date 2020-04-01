FROM hbr.solutions.consensys-uk.net/komgo/komgo-nodejs-base-image:node-10-alpine as builder

ARG NPM_TOKEN=NpmToken.8bb479e3-3fbc-3ee0-94f3-f4f40d7cddf5
ENV NPM_TOKEN $NPM_TOKEN

ARG NPM_REGISTRY_URL=https://nexus.solutions.consensys-uk.net/repository/komgo-npm-hosted/
ENV NPM_REGISTRY_URL $NPM_REGISTRY_URL

COPY .npmrc package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build && \
  rm -rf node_modules && \
  npm install --production

# use multistage builds to remove devDependencies
FROM hbr.solutions.consensys-uk.net/komgo/komgo-nodejs-base-image:node-10-alpine

# set our node environment, either development or production
# defaults to production, compose overrides this to development on build and run (used for logging)
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY --from=builder /opt/app .

# Remove .npmrc so we can run npm commands in a container without having to pass NPM_TOKEN env var
# cleanup private keys from node modules (test subfolders only)
RUN rm .npmrc && \
  find ./ -path './node_modules/*/test/*' -type f \( -iname \*.key -o -iname \*.pem -o -iname \*.priv \) -delete


RUN chown -R 1000 /opt/app
USER 1000

ENTRYPOINT [ "/opt/app/docker-entrypoint/entrypoint.sh" ]
CMD [ "komgo" ]
