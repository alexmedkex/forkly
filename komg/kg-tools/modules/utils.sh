contains() {
  [[ $1 =~ (^|[[:space:]])$2($|[[:space:]]) ]] && exit 0 || exit 1
}

md5sum1 () {
  # polyfill for OS X
  md5sum < "${1:-/dev/stdin}" || md5 < "${1:-/dev/stdin}"
}

command_exists () {
  type "$1" &> /dev/null ;
}

override_env_vars() {
  if [[ -f env-overrides.sh ]]; then
    source env-overrides.sh
  fi
}