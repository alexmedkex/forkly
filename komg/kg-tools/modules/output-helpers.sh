# define fonts
normal=$'\e[0m'
bold=$'\e[1m'
dim=$'\e[2m'
underline=$'\e[4m'
red=$'\e[31m'
green=$'\e[32m'
yellow=$'\e[33m'
blue=$'\e[34m'
tan=$'\e[91m'
cyan=$'\e[96m'
white=$'\e[97m'


log-underline() {
    printf "${underline}${bold}%s${normal}\n" "$@"
}

log-h1() {
    printf "\n${underline}${bold}${cyan}%s${normal}\n" "$@"
}

log-h2() {
    printf "\n${underline}${bold}${white}%s${normal}\n" "$@"
}

log-debug() {
    printf "${white}%s${normal}\n" "$@"
}

log-info() {
    printf "${white}➜ %s${normal}\n" "$@"
}

log-success() {
    printf "${green}✔ %s${normal}\n" "$@"
}

log-error() {
    printf "${tan}✖ %s${normal}\n" "$@"
}

log-warn() {
    printf "${yellow}➜ %s${normal}\n" "$@"
}

log-bold() {
    printf "${bold}%s${normal}\n" "$@"
}

log-note() {
    printf "\n${underline}${bold}${blue}Note:${normal} ${blue}%s${normal}\n" "$@"
}
