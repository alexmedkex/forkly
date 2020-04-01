# Expected Env Vars

* `KEYCLOAK_REALM_NAME`
* `KEYCLOAK_CLIENT_ID`
* `KEYCLOAK_AUTH_URL` - Public Keycloak server URL e.g. http://localhost:8070/auth
* `KEYCLOAK_SERVER_AUTH_URL` - Keycloak server URL (public or within a private network. That doesn't matter). Example: http://keycloak:8080/auth
* `NODE_TLS_REJECT_UNAUTHORIZED` - (optional) set to "0" if Keycloak uses self-signed TLS certificates
