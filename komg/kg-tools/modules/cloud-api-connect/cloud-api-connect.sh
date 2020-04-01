cloud-api-connect () {
  env="$1"
  node="$2"
  if [ -z "$env" ]; then
    echo "${red}[!] First argument must be env name (e.g. dev-005)${normal}"
    exit 1
  fi
  if [ -z "$node" ]; then
    echo "${red}[!] Second argument must be node name (e.g. ing-ams)${normal}"
    exit 1
  fi


  export CLOUD_API_CONNECT=true
  docker_compose_proxy down client
  docker_compose_proxy down https-proxy
  docker_compose_proxy up https-proxy

  base_host=${node}-$env.gmk.solutions.consensys-uk.net

  BUILD_ID=cloud-api-connect \
  API_GATEWAY_SCHEME=https \
  API_GATEWAY_HOST=api.$base_host \
  API_GATEWAY_PORT=443 \
  KEYCLOAK_AUTH_URL=https://keycloak.$base_host/auth \
  ZENDESK_REDIRECT_URI=https://www.$base_host/error-report/new \
  docker_compose_proxy up client

  echo
  echo "Add this to your /etc/hosts"
  echo
  echo "   ${bold}127.0.0.1 www.$base_host${normal}"
  echo
  echo "Then open this URL: https://www.$base_host"
  echo
  echo "${yellow}You may need to clear HSTS in your browser${normal}"
  echo "See here to find out how: https://really-simple-ssl.com/knowledge-base/clear-hsts-browser/"
  echo
}