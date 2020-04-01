# if you're doing anything beyond your local machine, please pin this to a specific version at https://hub.docker.com/_/node/
FROM node:8

RUN mkdir -p /opt/app

# default to port 8080 for node, and 5858 or 9229 for debug
ARG PORT=8080
ARG NPM_TOKEN
ENV PORT $PORT
EXPOSE $PORT 9229

# Komgo Address
# defaults to account[0] generated with nmemonic:
# suffer stereo mail face prefer entire flock divert party convince pond craft

# install app dependencies first, in a different location for easier app bind mounting for local development
WORKDIR /opt/app
COPY .npmrc package.json package-lock.json* ./
RUN npm install && npm cache clean --force

ENV PATH /opt/app/node_modules/.bin:$PATH

# copy in our source code last, as it changes the most
COPY . /opt/app

RUN rm -f .npmrc

RUN chown -R 1000 /opt/app

USER 1000

# if you want to use npm start instead, then use `docker run --init in production`
# so that signals are passed properly. Note the code in index.js is needed to catch Docker signals
# using node here is still more graceful stopping then npm with --init afaik
# I still can't come up with a good production way to run with npm and graceful shutdown
CMD [ "npm", "run", "deploy" ]
