FROM hbr.solutions.consensys-uk.net/komgo/komgo-nodejs-base-image:node-10-alpine as builder

ENV REACT_APP_API_GATEWAY_URL %REACT_APP_API_GATEWAY_URL%
ENV REACT_APP_KEYCLOAK_REALM_NAME %REACT_APP_KEYCLOAK_REALM_NAME%
ENV REACT_APP_KEYCLOAK_AUTH_URL %REACT_APP_KEYCLOAK_AUTH_URL%
ENV REACT_APP_KEYCLOAK_CLIENT_ID %REACT_APP_KEYCLOAK_CLIENT_ID%
ENV REACT_APP_ZENDESK_CLIENT_ID %REACT_APP_ZENDESK_CLIENT_ID%
ENV REACT_APP_ZENDESK_REDIRECT_URI %REACT_APP_ZENDESK_REDIRECT_URI%
ENV REACT_APP_ZENDESK_BASE_URL %REACT_APP_ZENDESK_BASE_URL%
ENV REACT_APP_ZENDESK_SEVERITY_FIELD_ID %REACT_APP_ZENDESK_SEVERITY_FIELD_ID%
ENV REACT_APP_ZENDESK_STEPS_FIELD_ID %REACT_APP_ZENDESK_STEPS_FIELD_ID%
ENV REACT_APP_ALLOW_FEATURE_TOGGLES %REACT_APP_ALLOW_FEATURE_TOGGLES%
ENV REACT_APP_IS_KOMGO_NODE %REACT_APP_IS_KOMGO_NODE%
ENV REACT_APP_IS_LMS_NODE %REACT_APP_IS_LMS_NODE%
ENV REACT_APP_METRICS_AND_EMAIL_NOTIFICATIONS %REACT_APP_METRICS_AND_EMAIL_NOTIFICATIONS%
ENV REACT_APP_BUILD_ID %REACT_APP_BUILD_ID%

# npm install expects NPM_TOKEN env var with a valid token to Nexus
# https://consensys-komgo.atlassian.net/wiki/spaces/KO/pages/50561076/Nexus
ARG NPM_TOKEN

COPY .npmrc package.json package-lock.json* ./
RUN npm install

# copy in our source code last, as it changes the most
COPY . .

# Disable map files generation for react-scripts-ts
ENV GENERATE_SOURCEMAP false

# Build static files
RUN [ "npm", "run", "build" ]

FROM nginx:1.17-alpine
WORKDIR /var/www/app

EXPOSE 8080

# Copy static files from the build stage to a location from which nginx will serve the web app
COPY --from=builder /opt/app/build .
COPY docker-entrypoint/entrypoint.sh /opt/entrypoint.sh
ENTRYPOINT ["sh", "/opt/entrypoint.sh"]
COPY nginx-config/webapp.conf /etc/nginx/conf.d/default.conf

RUN touch /var/run/nginx.pid && \
    chown -R 1000 /var/run/nginx.pid && \
    chown -R 1000 /var/cache/nginx && \
    chown -R 1000 /var/www/app
USER 1000

CMD ["nginx-fe"]