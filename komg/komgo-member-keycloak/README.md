# Expected Env Vars

Here https://consensys-komgo.atlassian.net/wiki/spaces/KO/pages/56983902/Dependencies+and+Environment+Variables#DependenciesandEnvironmentVariables-keycloak-IdentityManagementandAuthenticationService

# Initialize KOMGO realm

```
/opt/jboss/keycloak/bin/scripts/keycloak-init.sh
```

If KOMGO realm already exists it will exit with code 0

# Liveness command

```
/opt/jboss/keycloak/bin/scripts/is-alive.sh
```

Exits with non-zero code if KOMGO realm is not created or DB is not available

