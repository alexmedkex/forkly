check-readiness () {
  grep PORT_1:-3 docker-compose.api* | while read -r line ; do
    container=$(echo "$line" | grep -oP 'api-[-\w]+')
    [[ "$container" == "api-gateway" ]] && continue

    port=$(echo "$line" | grep -Po 'PORT_1:-\K(\d+)')
    port=`expr $port + \( $MEMBER_ID - 1 \) \* 1000`
    echo "[ ${cyan}${container}${normal} ]"
    base_url=http://localhost:$port/v0
    [[ "$container" == "api-auth" ]] && base_url=http://localhost:$port
    if curl -f $base_url/healthz &>/dev/null; then
      if curl -f $base_url/ready &>/dev/null; then
        echo OK
      else
        curl $base_url/ready 2>/dev/null | jq
      fi
    else
      echo "${yellow}Not running${normal}"
    fi
    echo
  done

  service_containers="event-management blockchain-event-management"
  for container in $service_containers; do
    echo "[ ${cyan}${container}${normal} ]"
    docker exec "komgo-member-${MEMBER_ID}-${container}" sh -c "npm run is-ready | grep context" || true
    echo
  done
}
