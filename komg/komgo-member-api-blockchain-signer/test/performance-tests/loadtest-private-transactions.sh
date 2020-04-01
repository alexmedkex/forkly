#!/bin/bash -ex
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function usage() {
    echo "Usage: ./$(basename "$0") <mode> [-u|--wtf] [-i|--interaction] [-d|--duration]"
    echo "  - modes: --local-quorum OR --kaleido"
    echo "  - "
}

function main() {
    echo "$@"
    # argument parsing
    for i in "$@"
    do
        case $i in
            --local-quorum)        MODE="local-quorum";      shift ;;
            --kaleido)             MODE="kaleido";           shift ;;
            -u|--users)            USERS="$2";               shift; shift ;;
            -i|--iterations)       ITERATIONS="$2";          shift; shift ;;
            -d|--duration)         DURATION="$2";            shift; shift ;;
            --private-participant) PRIVATE_PARTICIPANT="$2"; shift; shift ;;
            --contract-address)    CONTRACT_ADDRESS="$2";    shift; shift ;;
            *) ;;
        esac
    done

    # argument testing
    [ -z "$MODE" ]  && echo "Missing mandatory parameter [--local-quorum|--kaleido]" && exit 1
    [ -z "$USERS" ] && echo "Missing mandatory parameter [-u|--users]" && exit 1
    [ -z "$ITERATIONS" ] && [ -z "$DURATION" ] && echo "Missing mandatory parameter [-i|--interaction] OR [-d|--duration]" && exit 1

    case "$MODE" in
        local-quorum) local_quorum ;;
        kaleido)      kaleido ;;
        *) usage ;;
    esac
}

function local_quorum() {
    if [ -z "$PRIVATE_PARTICIPANT" ]; then
        echo "Flag --private-participant not provided, trying to load constellation keys from local quorum..."
        PRIVATE_PARTICIPANT=$(cat ../../../.db/qdata_2/keys/tm.pub)
        if [ -z "$PRIVATE_PARTICIPANT" ]; then
            echo "Failed to load constellation keys from .db/qdata_2/keys/tm.pub"
            exit 1
        else
            echo "Resolved private participant value: $PRIVATE_PARTICIPANT"
        fi
    fi
    run_load_test
}

function kaleido() {
    if [ -z "$PRIVATE_PARTICIPANT" ]; then
        echo "Missing mandatory parameter --private-participant" && exit 1
    fi
    run_load_test
}

function run_load_test() {
    if [ ! -z "$ITERATIONS" ]; then
        RUN_MODE="--iterations"
        RUN_VALUE="$ITERATIONS"
    else
        RUN_MODE="--duration"
        RUN_VALUE="$DURATION"
    fi
    docker run \
        --volume $BASE_DIR:/src \
        --network=komgo-1 \
        --interactive loadimpact/k6 run \
        --vus $USERS \
        $RUN_MODE $RUN_VALUE \
        --env contract_address=$CONTRACT_ADDRESS \
        --env private_participant=$PRIVATE_PARTICIPANT \
        /src/loadtest-private-transactions.js
}

main $@
