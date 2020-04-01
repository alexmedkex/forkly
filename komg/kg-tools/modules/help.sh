
kg-help () {
  echo "Usage:
  ${bold}./kg update-app-state
    ${dim}Run this command after you start all containers to populate DB with pre-defined data${normal}

  ${bold}./kg install
    ${dim}install 'kg' into the system so you can run it from anywhere
    (Doesn't work on OS X)${normal}

  ${bold}./kg COMMAND SERVICE_GROUP[,SERVICE_GROUP,...] [OPTIONS]
    ${dim}COMMAND
      One of the following docker-compose commands: up, down, ps, logs, restart, config

    SERVICE_GROUP
      is the string from docker-compose file names that is in between 'docker-compose.' and '.yml'
      'all' is an alias for all groups for member node
      'multinode-min' is an alias for keycloak,mongo,rabbitmq-internal,api-auth,api-coverage,api-notif,api-registry,api-roles,api-signer,api-blockchain-signer,api-users,client,event-management,api-gateway,blockchain-event-management,ws-server
      'common' is an alias for rabbitmq-vakt,rabbitmq-common,mq-router,quorum-common,blockchain
      'common-min' is an alias for rabbitmq-common,quorum-common,blockchain

      It proxies CMD to docker-compose using a specified file name(s)
      For example
        ./kg ps client,api-users
      will be translated to
        docker-compose -f docker-compose.client.yml ps && docker-compose -f docker-compose.api-users.yml ps

    OPTIONS
      --dev
        if it is supplied when running './kg up ...', it won't start an app automatically.
        You will have to enter a container with './kg sh ...' and then run the app using 'npm run ...'

      --kaleido
        if it is supplied when running './kg up ...', it will set BLOCKCHAIN_HOST to point to Kaleido node

      --rebuild
        if it is supplied when running './kg up ...', it will rebuild docker images

      --member=member_id
      if it is supplied when running './kg ...', it will apply command to specified member node on your local env
        member_id is integer (default is 1)${normal}

  ${bold}./kg onboard
    ${dim}This will register member node in ens and configure common exchanges
    By default it will connect member 1 local common node,
    You can override it by specifying --member

      --ssl
        use mutual mongo ssl connection

  ${bold}./kg sh APP_NAME
    ${dim}Enters bash shell in a APP_NAME
    App name is what follows after 'komgo-' in a container name (e.g., api-users).${normal}

  ${bold}./kg stop-and-cleanup
    ${dim}This will:
      * remove all Docker containers
      * remove Keycloak, Mongo, and blockchain database files${normal}

  ${bold}./kg checkout-develop-everywhere ${dim}or${normal}${bold} ./kg cde
    ${dim}This will:
      * delete all uncommitted changes
      * checkout develop branch and do 'git pull' in each submodule${normal}

  ${bold}./kg checkout-branch-everywhere BRANCH_NAME ${dim}or${normal}${bold} ./kg cbe BRANCH_NAME
    ${dim}This will:
      * delete all uncommitted changes
      * checkout BRANCH_NAME branch and do 'git pull' in each submodule${normal}

  ${bold}./kg pull-develop-images
    ${dim}This will:
      * Attempt to pull images from $DOCKER_REGISTRY and tag them as image:latest
      for each submodule where the following criteria are satisfied:
        * You are logged in to $DOCKER_REGISTRY
        * You are on the develop branch
        * You have added no additional files and have made no changes to files
        * Submodule is not komgo-onboard${normal}

  ${bold}./kg jira TASK_NUMBER
    ${dim}This will:
      * open the jira task number you typed in your default browser${normal}

  ${bold}./kg build BUILD_ID
    ${dim}This will:
      * show the build information associated with that build id: commitId for each repository, if CI/CI-RE was healthy, date, etc.

    BUILD_ID: dev+1234, 0.10.0+50, etc.${normal}

  ${bold}./kg gitlab PARTIAL_GITLAB_PATH
    ${dim}This will:
      * open the Komgo gitlab repository you typed in your default browser${normal}

  ${bold}./kg check-readiness
    ${dim}This will run HTTP requests to /v0/healthz and /v0/ready and show the result
    For MS that do not expose HTTP API it will run 'npm run is-ready' in a docker contaienr${normal}

  ${bold}./kg cloud-api-connect ENV_NAME NODE_NAME --dev
    ${dim}This will
      * run komgo-member-client in a dev mode
      * start HTTPS nginx proxy server on localhost:443
      * output a string that will have to be added to /etc/hosts
    in order to use local UI server, but remote API in the env of your choice

    ENV_NAME: dev-005, ci-test, qa, etc.
    NODE_NAME: ing-ams, bp-london, komgo, etc.${normal}

  ${bold}./kg generate-cert
    ${dim}This will:
      * create mongossl directory and generate everything that is needed for secure SSL connection
  ${normal}

  ${bold}./kg wait-for-blockchain
    ${dim}This will:
      * block while the blockchain container is running until it finishes smart contracts migration
      * update the the komgo-member-blockchain/address.txt file with deployed ENS Registry
  ${normal}

  ${bold}./kg add-counterparty [--member=N]
    ${dim}This will:
      * add counterparty automatically to the selected member.
      * this avoids the manual step of sending a couterparty request and accept it
  ${normal}

  ${bold}./kg pull-develop-images [SERVICE_NAME]
    ${dim}Pulls images from Harbor (Docker registry) using commit ID from your local develop branch as an image tag.
    Optionally you can pull only one image by providing service name (e.g. komgo-member-api-users)
  ${normal}

  ${bold}./kg get-single-coffee [--rebuild]
    ${dim}This will:
      * perform ./kg stop-and-clean to ensure we start a new environment from scratch
      * starts common components and a single komgo member
      * using the flag --rebuild will force rebuild of 'common' and 'all'
  ${normal}

  ${bold}./kg get-double-coffee [--rebuild]
    ${dim}This will:
      * perform ./kg stop-and-clean to ensure we start a new environment from scratch
      * starts common components and two komgo members
      * using the flag --rebuild will force rebuild of 'common' and 'all'
  ${normal}

  ${bold}./kg configure-common-mq
    ${dim}This will configure Common MQ with exchanges, queus, users for the following things:
      * VAKT
      * monitoring
      * email-notifications
  ${normal}"
}
