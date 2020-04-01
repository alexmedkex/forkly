FROM node:8-alpine
RUN apk add git gcc python make g++
WORKDIR /opt/app/
ARG NPM_TOKEN=$NPM_TOKEN
COPY . /opt/app/
RUN npm i
ENTRYPOINT ["npm", "run", "test:integration"]
