#!/bin/bash -e
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
source $BASE_DIR/functions.sh

# argument defaults
NUMBER_OF_REQUEST=10
CONCURRENT_REQUESTS=10
PAYLOAD_SIZE=20 #megabytes
RABBITMQ_USERNAME="KomgoCommonUser"
RABBITMQ_PASSWORD="Tostoresomewhere"
RABBITMQ_HOST="http://localhost:15673"
VUS=1
ITERATIONS=30

# argument parsing
while [[ $# -gt 0 ]]
do
    case "$1" in
        -r|--number-of-requests)
            NUMBER_OF_REQUEST="$2"
            shift
            shift
            ;;
        -c|--concurrent-requests)
            CONCURRENT_REQUESTS="$2"
            shift
            shift
            ;;
        -s|--payload-size)
            PAYLOAD_SIZE="$2"
            shift
            shift
            ;;
        -u|--username)
            RABBITMQ_USERNAME="$2"
            shift
            shift
            ;;
        -p|--password)
            RABBITMQ_PASSWORD="$2"
            shift
            shift
            ;;
        -h|--host)
            RABBITMQ_HOST="$2"
            shift
            shift
            ;;
        -v|--vus)
            VUS="$2"
            shift
            shift
            ;;
        -i|--iterations)
            ITERATIONS="$2"
            shift
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# constants
TMP_DIR="$BASE_DIR/tmp"
PAYLOAD_SENT="$TMP_DIR/perftest-${PAYLOAD_SIZE}m-payload-generated.txt"
MESSAGE_SENT="$TMP_DIR/perftest-${PAYLOAD_SIZE}m-message-sent.json"

TEST_QUEUE="komgo-2904-http-bigfiles-perftest"

# prepare directory to hold validation files and clean up old received files
mkdir -p $TMP_DIR

# 1) create random ascii payload if necessary
header "Prepare message to be sent"
prepare_message_to_send $TEST_QUEUE $PAYLOAD_SIZE $PAYLOAD_SENT $MESSAGE_SENT

# 2) ensure test queue exists
header "ASSERT test queue: $TEST_QUEUE"
rmq_assert_queue $RABBITMQ_USERNAME $RABBITMQ_PASSWORD $RABBITMQ_HOST $TEST_QUEUE

# 3) purge queue first to ensure we don't get any old request stuck in the queue
header "PURGE test queue: $TEST_QUEUE"
rmq_purge_queue $RABBITMQ_USERNAME $RABBITMQ_PASSWORD $RABBITMQ_HOST $TEST_QUEUE

header "RUNNING LOAD TESTS"
docker run \
       -v $PAYLOAD_SENT:/mnt/payload.json \
       -i loadimpact/k6 run \
       --no-connection-reuse \
       --no-vu-connection-reuse \
       --insecure-skip-tls-verify \
       -e HOST=$RABBITMQ_HOST \
       -e USERNAME=$RABBITMQ_USERNAME \
       -e PASSWORD=$RABBITMQ_PASSWORD \
       -e QUEUE=$TEST_QUEUE \
       --vus $VUS --iterations $ITERATIONS -< $BASE_DIR/k6-perftest.js 2>&1 | tee $TMP_DIR/perftest.log

header "ANALYSIS"
# analysis works by checking the perftest.log for the seqnum entries with unique id's
# for each single test, we send and fetch a message from rabbitmq. on logs we see this:
# - time="2019-01-24T20:13:19Z" level=info msg="seqnum-9-19 sent"
# - time="2019-01-24T20:13:19Z" level=info msg="seqnum-9-19 received"
# our analysis works as follows:
# 1) capture all sent/fetch pairs by grepping 'seqnum'
# 2) from the whole log line, extract this bit: seqnum-9-19
# 3) sort and count unique elements and since we have a pair (sent, received)
#    the good results are those that counted 2
# 4.1) grep good results, the unique values that counted twice (sent, received)
# 4.2) grep bad results, the unique values that were NOT counted twice
number_of_ok_tests=$(grep 'seqnum' $TMP_DIR/perftest.log |\
                         cut -d' ' -f 3 |\
                         sort | uniq -c |\
                         grep '2 msg="seqnum' | wc -l)
number_of_nok_tests=$(grep 'seqnum' $TMP_DIR/perftest.log |\
                          cut -d' ' -f 3 |\
                          sort | uniq -c |\
                          grep -v '2 msg="seqnum' | wc -l)

echo "Verifying load test log: $TMP_DIR/perftest.log"
echo " - uniqueID sent and received (expected: $ITERATIONS): $number_of_ok_tests"
echo " - uniqueID received twice or missing (expected: 0): $number_of_nok_tests"
