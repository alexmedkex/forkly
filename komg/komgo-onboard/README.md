# @komgo/onboard
Onboarding tool for setting up common node.

## Release Notes
* **2.9.2** Fixed vakt only onboard // by Serhii Rozdorozhnii
* **2.9.1** Updated `smart-contract` package version to use fixed `2.8.0` (to prevent using smart contracts that are not integrated with the backend) //KOMGO-6595 by Miguel Rojo
* **2.9.0** Added a new config parameter to override realm name // KOMGO-6646 by Oleksandr Gornostal
* **2.8.1** Updated onboarding in ENS according to smart contract chages //KOMGO-6811 by Serhii Rozdorozhnii
* **2.7.0** Updated onboarding files with a new product "Credit Appetite" // KOMGO-6149 by Oleksandr Gornostal
* **2.5.1** Removed adding user //KOMGO-5738 by Lorenzo Urbini
* **2.5.0** Add email notification setup for RMQ with `./onboard platform configure-email-notification email-notification.json` //KOMGO-5738 by Lorenzo Urbini
* **2.4.0** Add montoring setup for RMQ with `./onboard platform configure-monitoring monitoring.json` //KOMGO-5094 by Serhii Rozdorozhnii
* **2.3.1** Skip setting up RMQ permissions if run with `--skip-user-creation` // KOMGO-5185 by Oleksandr Gornostal
* **2.3.0** Added flag `--skip-user-creation` to command `./onboard member add-broker <mnid>` // KOMGO-5185 by Vitalii Panko
* **2.2.2** Added RD product to the address book example // KOMGO-3172 by Oleksandr Gornostal
* **2.2.1** Publish the onboard package to the main channel in npm; added release notes to readme.md; Fixed audit issues // by Oleksandr Gornostal
* **2.2.0** Fixed a bug with updating products in ENS // KOMGO-3172 by Serhii Rozdorozhnii
* **2.1.0** `./onboard member add-general` and `./onboard member add-ens` now also enable KYC and LC products in ENS // KOMGO-3172 by Serhii Rozdorozhnii
* **2.0.0** Added `keys.blockchainsigner.url` to the config // KOMGO-3529 by Andrey Orlov
* **1.2.1** Keycloak integration added to get-keys command // KOMGO-3383 by Miguel Rojo
* **1.2.0** Added alternate exchange policy for queues // KOMGO-3250 by Serhii Rozdorozhnii

## Installation:
In order to use compiled package you need to [configure Nexus](https://consensys-komgo.atlassian.net/wiki/spaces/KO/pages/50561076/Nexus) first. Then you can install it using NPM:
```
npm install -g @komgo/onboard
onboard --help
```

Alternatively, you can pull this repository and use .sh startup script:
```
git clone https://gitlab.com/ConsenSys/client/uk/KomGo/komgo-onboard.git
cd komgo-onboard
npm run build
./onboard --help
```

## Configuring AWS:
In order to store all onboarded member credentials in the AWS storage you need to configure it first:
```
onboard config aws.enabled true
onboard config aws.config.region eu-west-1
onboard config aws.config.id  <YOUR AWS ACCESS KEY ID GOES HERE>
onboard config aws.config.key <YOUR AWS ACCESS SECRET KEY GOES HERE>
```

## Checking input JSON file and Keys integration
In order to store the data informed in the JSON file and post the keys in the api-signer, you will need to run this:
```
onboard member add-keys files/input.json -c keycloak.url=http://localhost:8070/auth/realms/KOMGO/protocol/openid-connect/token/ -c keys.signer.url=http://localhost:3333/api/signer

* -c values refered above are being taken by default, so you can just run locally as indicated right below this line.

Other files you could use to test:

onboard member add-keys files/QA_data.json => It is an array. It includes the file informed by Adrien.
onboard member add-keys files/input_qa.json
onboard member add-keys files/input_no_keys.json
onboard member add-keys files/input_with_errors.json

In order to retrieve the keys stored in the api-signer and append them into the input.json, you will need to run this:
onboard member get-keys files/input.json
```

## Checking input JSON file and ENS integration
In order to store the data informed in the JSON file and post it in the ENS, you will need to run this:
```
onboard member add-ens files/input.json -c ens.address=0x4a6fa0250e074e3765e6a726f8ae11c3c00e42f4

* -c values refered above are being taken by default, so you can just run locally as indicated right below this line.

Other files you could use to test:

onboard member add-ens files/QA_data.json => It is an array. It includes the file informed by Adrien.
onboard member add-ens files/input_qa.json
onboard member add-ens files/input_no_keys.json
onboard member add-ens files/input_with_errors.json
onboard member add-ens -c ens.vaktonly=true files/vakt_only_data.json => To inject vakt only infos

```

## Checking input JSON file and Keys + ENS integration
In order to store the data informed in the JSON file and post it in the ENS, you will need to run this:
```
onboard member add-general files/input.json -c keycloak.url=http://localhost:8070/auth/realms/KOMGO/protocol/openid-connect/token/ -c keys.signer.url=http://localhost:3333/api/signer -c ens.address=0x4a6fa0250e074e3765e6a726f8ae11c3c00e42f4

* -c values refered above are being taken by default, so you can just run locally as indicated right below this line.

Other files you could use to test:

onboard member add-general files/QA_data.json => It is an array. It includes the file informed by Adrien.
onboard member add-general files/input_qa.json
onboard member add-general files/input_no_keys.json
onboard member add-general files/input_with_errors.json
```

## The whole thing: Sample setup:
Now it is possible to setup basic VAKT platform and some members:
1. Setting up VAKT: `onboard platform add files/platform.json`

2. Setting up the common broker + AWS secrets (this second step is optional): `onboard member add <mnid>`. Please add `NODE_TLS_REJECT_UNAUTHORIZED=0` in the call if you want to run it against https.

3. Posting the keys and the attributes of the company in ENS: `onboard member add-general files/input.json -c keycloak.url=http://localhost:8070/auth/realms/KOMGO/protocol/openid-connect/token/ -c keys.signer.url=http://localhost:3333/api/signer -c ens.address=0x4a6fa0250e074e3765e6a726f8ae11c3c00e42f4`

**Instead of step 3, you can run keys integration + ENS integration in two steps, using `add-keys` and `add-ens` respectively**

**The next environment variables should be exported in order to run the script for posting the keys + ENS attributes in Production**
* KALEIDO_USER
* KALEIDO_PASSWORD
* BLOCKCHAIN_HOST
* BLOCKCHAIN_PORT
* KEYCLOAK_USER
* KEYCLOAK_PASSWORD
* NODE_TLS_REJECT_UNAUTHORIZED=0

So, an example would be:
`KALEIDO_USER=<user> KALEIDO_PASSWORD=<password> BLOCKCHAIN_HOST=<host> BLOCKCHAIN_PORT=<port> KEYCLOAK_USER=<user> KEYCLOAK_PASSWORD=<password> NODE_TLS_REJECT_UNAUTHORIZED=0 onboard member add-general <input JSON file> -c keys.signer.url=<API_SIGNER_BASE_URL> -c keycloak.url=<KEYCLOAK_URL> -c ens.address=<ENS_ADDRESS>`

## Advanced configuration:
Complete list of configurational parameters:
```
common.hostname   [HOST]     - Common broker host name
common.port       [PORT]     - Common broker host port
common.username   [USERNAME] - Common broker admin username
common.password   [PASSWORD] - Common broker admin password
routing.username  [USERNAME] - Routing username
routing.password  [PASSWORD] - Routing password
harbor.enabled    [boolean]  - Enable or disable Harbor features
harbor.url        [URL]      - Target Harbor URL
harbor.username   [USERNAME] - Harbor admin username
harbor.password   [PASSWORD] - Harbor admin password
harbor.project    [ID]       - Harbor project ID
aws.enabled       [boolean]  - Enable or disable AWS features
aws.env.type      [TYPE]     - AWS environment type
aws.env.name      [NAME]     - AWS environment name
aws.config.region [REGION]   - AWS config region
aws.config.id     [KEYID]    - AWS secret ID
aws.config.key    [KEY]      - AWS secret key
keys.enabled      [boolean]  - Enables the addition of the public key data from the signer call
keys.signer.url   [URL]      - (OPTIONAL) For development purposes, URL with the api-signer (i.e., http://localhost:3107)
keys.signer.delay [INT]      - Delay in order to wait for a response from the api-signer
keys.blockchainsigner.url [URL] - (OPTIONAL) For development purposes, URL with the api-blockchain-signer (i.e., http://localhost:3112)
ens.address       [STRING]   - **IT IS MANDATORY TO UPDATE ONCE ENS SMART CONTRACT HAS BEEN DEPLOYED** Ethereum address where the ENS Registry Smart Contract is deployed
ens.gas           [INT]      - Gas for running the Smart Contracts
ens.from          [STRING]   - Owner of the contracts
ens.domain.*:     [STRING]   - Name of the Smart Contract domain
{
      "komgoresolver": "komgoresolver.contract.komgo",
      "komgoregistrar": "komgoregistrar.contract.komgo",
      "komgometaresolver": "komgometaresolver.contract.komgo",
      "companydata": "companydata.contract.komgo"
}
api.registry.url  [STRING]  - The api registry url (i.e. http://localhost:3333/api/registry)
```

Configuration can be stored into the ```config.json``` file:
```
onboard config some.options somevalue
onboard config
```

Or overriden for a single session using ```-c``` key-value flags:
```
onboard config -c some.option=somevalue -c some.other.option=someothervalue
```

## Generate member onboarding package

1. Create a pre-package file using an example below and save it to a file
    ```
    [
      {
        "x500Name": {
          "CN":"Gunvor",
          "O": "Gunvor SA",
          "C": "CH",
          "L": "Geneva",
          "STREET": "80-84 Rue du Rhône",
          "PC": "1204"
        },
        "hasSWIFTKey": false,
        "isFinancialInstitution": false,
        "isMember":true,
        "isFMS": false
      }
    ]
    ```
2. Run this command
    ```
    ./onboard member generate-member-package <pre-package file>
    ```
3. Member package will be saved to `member-package.json`

## Override credentials:

In some cases you can override automatically generated Harbor credentials by passing desired value as environment values:

```
ONBOARD_HARBOR_USER
ONBOARD_HARBOR_EMAIL
ONBOARD_HARBOR_PASSWORD
```

Same applies to the common broker member credentials:

```
ONBOARD_COMMON_BROKER_USER
ONBOARD_COMMON_BROKER_PASSWORD
```

## Export Komgo address book from ENS into a json file to share with Vakt
```
onboard gen-addr-book -c api.registry.url= -c keycloak.url= (optional with specified defaults -c addressbook.version=1 -c addressbook.outputfilename=Komgo-address-book.json)
e.g.
NODE_TLS_REJECT_UNAUTHORIZED=0
./onboard gen-addr-book
-c api.registry.url=https://api.bp-qa-london-047.gmk.solutions.consensys-uk.net/api/registry
-c keycloak.url=https://keycloak.bp-qa-london-047.gmk.solutions.consensys-uk.net/auth/realms/KOMGO/protocol/openid-connect/token/
```

## Create a user, exchange, queue, and binding for monitoring messages

The following command will connect to Common MQ via RabbitMQ Management plugin HTTP API
using admin credentials and create a new user, exchnages, queues, and bindings
for monitoring messages.

The monitoring exchange will be created with Dead-letter-exchange policy.
Also, an alternate exchange will be created for unrouted messages.
In total 3 exchanges.

As well as 3 queues: monitoring messages, dead messages, unrouted messages.

Only the new user (created by this command) will be able to read monitoring messages from the new queue.

```
./onboard platform configure-monitoring platform-monitoring.json \
  -c common.hostname=commonMQHostname \
  -c common.port=commonMQPort \
  -c common.username=commonMQUsername \
  -c common.schema=commonMQSchema \
  -c common.password=comonMQPassword
```

* `commonMQHostname` - example: `mq-admin.komgo-qa.gmk.solutions.consensys-uk.net`
* `commonMQPort` - usually 443 for cloud environments
* `commonMQSchema` - http or https

[platform-monitoring.json example](https://gitlab.com/ConsenSys/client/uk/KomGo/komgo-onboard/blob/develop/files/platform-monitoring.json)

## Create a user, exchange, queue, and binding for email notification messages

The following command will connect to Common MQ via RabbitMQ Management plugin HTTP API
using admin credentials and create a new user, queue, and binding re-using existing monitoring exchange
for email notification messages.

Only the new user (created by this command) will be able to read email notification messages from the new queue.

```
./onboard platform configure-email-notification platform-email-notification.json \
  -c common.hostname=commonMQHostname \
  -c common.port=commonMQPort \
  -c common.username=commonMQUsername \
  -c common.schema=commonMQSchema \
  -c common.password=comonMQPassword
```

* `commonMQHostname` - example: `mq-admin.komgo-qa.gmk.solutions.consensys-uk.net`
* `commonMQPort` - usually 443 for cloud environments
* `commonMQSchema` - http or https

[platform-email-notification.json example](https://gitlab.com/ConsenSys/client/uk/KomGo/komgo-onboard/blob/develop/files/platform-email-notification.json)

