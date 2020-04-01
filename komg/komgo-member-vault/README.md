Hashicorp vault
===============

kg support - should be easy to bring up a vault container:

```
 ./kg down vault && ./kg up vault && ./kg logs vault
```

Note we're bringing a vault in development mode which runs in-memory is already initialized and unsealed. That means once it's up we can use it's CLI and HTTP API - using --header "X-Vault-Token: vault-development-insecure-token"

Example using API call:
```
$ curl \
      --header "X-Vault-Token: vault-development-insecure-token" \
      http://127.0.0.1:8200/v1/sys/init
```

For testing purposes you can sh to the docker container and use vault CLI directly.
Example using CLI:
```
$ docker exec -it $(docker ps --filter='Name=komgo-member-1-vault$' -q) /bin/sh
# now inside container, you can use vault
$ export VAULT_ADDR=http://127.0.0.1:8200
$ vault operator init
```

For convenience, there's a wrapper script under `./vault/` folder to access the container and run a command. The above example, assuming you have `cd vault/` folder, would be as simple as:
```
$ ./vault-cli.sh operation init
```

To interact with vault, there's a small script that uses cURL. For example, to put and get a secret in K/V, it can be used:
```
$ ./vault-api.sh kv-put-secret key=value
$ ./vault-api.sh kv-get-secret key
HTTP/1.1 200 OK        
Cache-Control: no-store
Content-Type: application/json
Date: Fri, 10 May 2019 19:32:21 GMT
Content-Length: 179

{
  "request_id": "a2e5421e-969e-58c0-5fca-f98070628e02",
  "lease_id": "",
  "renewable": false,
  "lease_duration": 2764800,
  "data": {
    "key": "value"
  },
  "wrap_info": null,
  "warnings": null,
  "auth": null
}

```

# Vault AUTH, ROLES & POLICIES
// sample role in dev config : api-read

* First what role do we have? Find id!
* * Each role can have a set of policies attach to it (Think of it as permissions)

* Request a secret for our Role
* * We use this to authenticate with vault

* Request client token with our role id and secret id

* Login
* * Given our Role and Policy attached 

### vault read auth/approle/role/api-read/role-id
remember the role id

### vault write -force auth/approle/role/api-read/secret-id
remeber the secret id

### vault write auth/approle/login role_id=[ROLE_ID] secret_id=[SECRET_ID]
remember token

### vault login [TOKEN]
// LOGGED IN 

# TRANSIT ENGINE
Attempt with not enough permissions: 
### vault write transit/keys/sample-rsa type="rsa-4096"
Fails

Login with higher permissions and retry

### vault write transit/encrypt/sample-rsa plaintext="VGVzdCA="

## ROTATE KEY & RETRY



Notes on docker compose
-----------------------

The docker-compose for vault is `docker-compose.vault.yml`:
- most fields are hardcoded and should be parameterized
- the vault container initializes in dev mode which runs in-memory is already initialized and unsealed
- there's a config container running - `configure-dev-vault` that will:
 - wait for vault interface to be up
 - execute the script in `./vault/config/dev-config` script >> **this script should be extended to configure vault via HTTP**.
 
Other notes, there might be some residual files in the MR, I didn't had time to clean up :'( and some bad code written.
