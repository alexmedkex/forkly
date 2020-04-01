# KomGo project


## Requirements

The recommended setup includes the next tools:

* Git 2.16.2 (including SSH setup):

    Follow the [next guidelines](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to start the submodules once you have cloned the repo.

* Docker 18.03.1-ce

* Docker-compose 1.23.2

* Harbor account (Ask to devops or your tech lead)

* Login to harbor with `docker login https://hbr.solutions.consensys-uk.net`


## Install
* _Git clone komgo-member_: Clone the parent folder called komgo-member.

```bash
$ git clone git@gitlab.com:ConsenSys/client/uk/KomGo/komgo-member.git
```

* _Git submodule init_: Initialise the submodules (komgo-member-*).

```bash
$ git submodule init
```

* _Git submodule update_: Update (clone) the submodules (komgo-member-*).

```bash
$ git submodule update
```

* `./kg cde` will switch all the GIT submodules to develop and prepare the env

* `./kg pull-develop-images`

* `./kg get-single-coffee`

## update
In **komgo-member**

- `git pull`
- `./kg cde && ./kg pull-develop-images`
- `./kg get-single-coffee`

## Use `kg` script to start the application (or part of it)

Before you begin, make sure that docker wokrs without sudo by running `docker run --rm hello-world`

`kg` can start apps in two modes: Prod and Dev.
As a QA you don't need Dev mode.
As a developer you might want to run the whole set of containers in Prod mode and then stop one, which you want to develop, and run it in Dev mode.

Continue reading to see how to use `kg` script

### How it works

When you run `./kg up api-auth,keycloak` it will
1. Split comma separated service groups
2. Will generate and execute command like this
   ```
   docker-compose run -f docker-compose.api-auth.yml && docker-compose run -f docker-compose.keycloak.yml
   ```
All docker-compose files here use the same docker network (named 'komgo') in which all containers will run in order to be connected with each other.

### Differences between Prod and Dev modes

| Prod | Dev |
|-|-|
| is a default mode | specify `--dev` flag when running `kg up ...` <br /> likes this: `./kg up all --dev` |
| less CPU and MEM usage | more CPU and MEM usage because `npm run start:dev` also runs file watcher. <br /> And for frontend you need nodejs too, whereas in Prod mode a lightweight nginx server will serve static files |
| for api-* and client containers it builds a docker image using Dockerfile in a submodule | uses nodejs as a base image and adds a few minor things |
| doesn't map source code into containers | maps source code into containers so it's possible to edit files locally while using npm in the containers |
| apps in containers start as if in production (simply follows instructions in Dockerfiles) | starts a container but doesn't start an app <br /> it runs `tail -F /none` just so the container keeps running |
|-|in order to start an app in a container 1) enter the container with `./kg sh <service-name>`; 2) run whatever you want to run (e.g. `npm run start:dev`) |
|-|maps project folders to containers so it's possible to edit files locally while using npm in the containers|

### Usage

See `./kg` output

### Multinode setup for 2 nodes on localhost

*Pre-setup*

* make sure all submodules are initialized and updated: `git submodule init`, `git submodule update`
* If you are trying to run multinode env for the first time, it's highly recommended that you stop and remove all the containers (`kg stop-and-cleanup`), make sure develop branches are up-to-date (`kg cde`) and then run `./kg pull-develop-images` to pull images from Harbor.

*Setup steps*

1. `./kg up common` or `./kg up common --rebuild`
2. Wait until the contracts are deployed (check `./kg logs blockchain`). This may take about ~5-10 min. If contract migration failed due to blockchain connection issues, try `kg restart blockchain`
3. [bug workaround] ENS contract address is not saved to `address.txt` automatically, so copy it from the blockchain logs (line that starts with `ENSRegistry:`) and save to `komgo-member-blockchain/address.txt`
4. [bug workaround] If you cannot log to Common MQ (http://localhost:15673) using username `KomgoCommonUser` and password from `.env`, try `docker restart komgo-common-mq-config`
5. `./kg configure-vakt`
6. `./kg up vault
7. `./kg up pre-onboard`
8. `./kg update-app-state` (check that you are able to log in as a 'kapsuleadmin' user to both nodes)
9. `./kg onboard`
10. `./kg up multinode-min`
11. `./kg update-app-state` (run it again in order to run DB migrations for all the MSs)
12. Make sure all containers are UP and there are no errors in api-registry logs. Restart failing containers if necessary
13. Repeat steps 6-11 with `--member=2` option
14. Member 1 is available via http://localhost:3010, member 2 via http://localhost:4010
15. Log in as a superuser to one member and send a counterparty request to another one. Then accept the request on the other node. If request doesn't appears on the other node, check if the message was senth through the Common MQ and event-management MS.


### Onboarding the other counterparties

If you want to register more members that are defined in `komgo-onboard/files/QA_data.json`, do the following:

* `./kg onboard-configured member add-ens komgo-onboard/files/QA_data.json`
* Add all of them as counterparties via API request http://localhost:3110/docs/#/counterparties/AutoAddList
    ```
    {
      "companyIds":[
        "ecc3b179-00bc-499c-a2f9-f8d1cc58e9db",
        "a28b8dc3-8de9-4559-8ca1-272ccef52b47",
        "08e9f8e3-94e5-459e-8458-ab512bee6e2c",
        "cf63c1f8-1165-4c94-a8f8-9252eb4f0016",
        "1bc05a66-1eba-44f7-8f85-38204e4d3516",
        "a3d82ae6-908c-49da-95b3-ba1ebe7e5f85",
        "0b5ad248-6159-47ca-9ac7-610c22877186"
      ]
    }
    ```
* Log in as superuser and check Counterparty Management page. You should see a list of all members

### Use Common MQ and Blockchain (Quorum) node on a remote host

`env-overrides.sh.sample` describes how you can use Common MQ or/and Blockchain node on a remote host.

This may be useful especially for Mac users where we have issues with persistence of blockchain data.

Follow the instructions in the file.


### Use Cases and Troubleshooting

* As a **QA** I want to start everything
  * `./kg up all`
  * Run `./kg ps all` and make sure everything has status "Up"
  * `./kg update-app-state` -- will run all initialization scripts (Keycloak, DB migrations)
* When I open http://localhost:3010 it doesn't get past "Checking authorization..."
  * You probably forgot to run `./kg update-app-state`
* Something isn't working
  * Check that containers have status "Up" by running `./kg ps all`
  * If a container is in state Restarting, see its logs (`./kg logs <service-group>`)
  * If API returns HTTP 500, check logs for API Gateway (`./kg logs api-gateway`) and api-auth (`./kg logs api-auth`) services
* I probably did something wrong. I want to reset and rebuild everything
  * `./kg stop-and-cleanup` -- will kill all containers, remove uncommitted changes, remove databases
  * `./kg up all --rebuild` -- will rebuild komgo-* containers and start everything
* I want to make sure I'm using the latest code base
  * `./kg down all` -- stop everything first
  * `./kg checkout-develop-everywhere` -- will do `git checkout` in each submodule of the `develop` branch
  * `./kg checkout-branch-everywhere BRANCH_NAME` -- will do `git checkout` in each submodule of the `BRANCH_NAME` specified e.g. `./kg checkout-branch-everywhere release-0.5.0`
  * `./kg up all`
* As a **developer** I want to work on `api-notif` implementation and I **don't need Frontend (React app)**
  * `./kg up api-notif --dev` -- will start api-notif container with mapped source coude using docker volumes
  * `./kg sh api-notif` -- you now entered a container
  * [only once] `rm -rf node_modules && npm install` -- node_modules are mapped from host machine to a container so you may want to remove that dir to avoid some issues, and then do `npm install` to install everything
  * `npm start` or `npm run start:dev` or `npm run test` or ...
  * Hit `Ctrl+C` if you want to stop the process (just like you do without containers)
* As a **developer** I want to work on `api-notif` implementation and I **need Frontend**
  * `./kg up keycloak,mongo,client,api-gateway,api-users,api-roles,api-auth` -- this is a minimum set of services that must be run if you want API Gateway and Frontend
  * `./kg update-app-state`
  * *Now follow the instructions from the use case above*
* As a **developer** I want to use mutual MongoDB SSL locally
  * `./kg generate-cert` to generate required certificates
  * `./kg up mongo --ssl` to start MongoDB in SSL mode
  * `./kg up [all | min | service-name] --ssl` to start related services
* As a **developer** I want to work on the **Frontend app**
  * see above, but run `./kg up client --dev` then `./kg sh client`
* Error **EADDRINUSE** when I run `npm run start:dev` in a container
  Most likely you've started container in Prod mode where the server is already running in the container.
  Try stopping it (e.g. `./kg down api-users`) and then running in Dev mode (e.g. `./kg up api-users --dev`)
* `npm install` fails with `npm ERR! Error while executing: npm ERR! /usr/bin/git ls-remote -h -t https://github.com/...`
  or if you see `npm ERR! fatal: Not a git repository: ../.git/modules/komgo-member-api-documents`
  that is a bug in some package that tries to `cd` level up in directories, but because we mount only submodule,
  there's no `.git` directrory on the upper level.
  **Solution**: rename `.git` then run `npm install`: `mv .git _git; npm i; mv _git .git`


## LMS

Local LMS node consists of three parts:
1. Multitenant services (lms-router, api-gateway, api-auth, client)
2. Singletenant services for member 1 (api-users, api-roles, etc.)
2. Singletenant services for member 2 (api-users, api-roles, etc.)

The multitenant services are ran in member=3 scope, meaning that you should add `--member=3` if you want to (re)start, a microservices or see its logs.

In order to run the LMS env run `./kg lms-up`.
Also, set env var `LMS_MODE` to `on` in your local environment before running any LMS-related commands.

Then onboard the nodes:
* `./kg lms-update-app-state`
* `./kg onboard --member=1`
* `./kg onboard --member=2`

## Keycloak Configuration

Once all services are up and running (using `./iwantto.sh start ganache` for example)
you can configure Keycloak instance automatically by running `keycloak-init.sh` like this:

```
docker exec komgo-member_keycloak_1 /opt/jboss/keycloak/bin/scripts/keycloak-init.sh
```

This will create a new realm, will add new roles and test users, configure audit and logging.

## Application URLs

Once you run the `Default mode`, the next applications will be available:

* Frontend (Whole application): http://localhost:3010
* Users API: http://localhost:3101
* Notifications API: http://localhost:3102
* Roles & Products API: http://localhost:3101
* KeyCloak Admin: http://localhost:8070
  Login: _admin_, password: _keycloakadmin_
* Swagger Docs: http://localhost:3000/docs
* Dashboard: http://localhost:3002
* Explorer: http://localhost:5000
* Mailcatcher (SMTP server and Web UI that catches outgoing emails): http://localhost:1080

If your prefer to run the `API mock mode`, the next applications will be available:

* Swagger Editor: http://localhost:3001
* Mock API: http://localhost:3000
