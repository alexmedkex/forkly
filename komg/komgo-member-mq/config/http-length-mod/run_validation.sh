#!/bin/bash -e
BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
source $BASE_DIR/functions.sh

# argument defaults
PAYLOAD_SIZE=20 #megabytes
RABBITMQ_USERNAME="KomgoCommonUser"
RABBITMQ_PASSWORD="Tostoresomewhere"
RABBITMQ_HOST="http://localhost:15673"

# argument parsing
while [[ $# -gt 0 ]]
do
    case "$1" in
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
        *)
            shift
            ;;
    esac
done

# constants
TMP_DIR="$BASE_DIR/tmp"
PAYLOAD_SENT="$TMP_DIR/validation-${PAYLOAD_SIZE}m-payload-generated.txt"
MESSAGE_SENT="$TMP_DIR/validation-${PAYLOAD_SIZE}m-message-sent.json"
MESSAGE_RECEIVED="$TMP_DIR/validation-${PAYLOAD_SIZE}m-message-received.json"
PAYLOAD_RECEIVED="$TMP_DIR/validation-${PAYLOAD_SIZE}m-payload-received.txt"

TEST_QUEUE="komgo-2719-http-bigfiles-validation"

# prepare directory to hold validation files and clean up old received files
mkdir -p $TMP_DIR
rm -f $MESSAGE_RECEIVED
rm -f $PAYLOAD_RECEIVED


# 1) create random ascii payload if necessary
header "Prepare message to be sent"
if [ ! -f "$PAYLOAD_SENT" ]; then
    echo "creating a random ascii message of ${PAYLOAD_SIZE}mb, this may take a while..."
    size=$(($PAYLOAD_SIZE * 1024 * 1024))
    base64 --wrap=0 /dev/urandom | head -c $size > $PAYLOAD_SENT

    echo '{"routing_key":"'"$TEST_QUEUE"'","payload":"'"$(cat $PAYLOAD_SENT)"'","payload_encoding":"string","properties":{"timestamp":1544541254210,"message_id":"ab571b4e-a7c3-445c-b106-9c00cc630576","content_type":"application/json","content_encoding":"utf-8","delivery_mode":2,"headers":{"recipient-mnid":"65c51eba-7c65-4b14-aaac-d469a292a7fc","sender-mnid":"b0ce2579-2c5f-4d05-94a5-0b720afa4f43","sender-platform":"komgo","sender-staticid":"87381232-31ca-4b78-9ca5-5820d07160d5","envelope-version":"0001"}}}' > $MESSAGE_SENT
fi

echo "Files are ready:"
ls -la $PAYLOAD_SENT $MESSAGE_SENT

# 2) ensure test queue exists
header "ASSERT test queue: $TEST_QUEUE"
rmq_assert_queue $RABBITMQ_USERNAME $RABBITMQ_PASSWORD $RABBITMQ_HOST $TEST_QUEUE

# 3) purge queue first to ensure we don't get any old request stuck in the queue
header "PURGE test queue: $TEST_QUEUE"
rmq_purge_queue $RABBITMQ_USERNAME $RABBITMQ_PASSWORD $RABBITMQ_HOST $TEST_QUEUE

# 4) post message with payload to the test queue
header "POST message to $TEST_QUEUE"
time curl -vvv \
     --fail \
     --insecure \
     -u "$RABBITMQ_USERNAME:$RABBITMQ_PASSWORD" \
     -H "content-type:application/json" \
     -X POST -d @"$MESSAGE_SENT" \
     "$RABBITMQ_HOST/api/exchanges/%2f/amq.default/publish"

echo "waiting 5s... let the rabbit chill a little..."
sleep 5

# 5) get message from the test queue
header "GET message from $TEST_QUEUE"
time curl -vvv \
     --fail \
     --insecure \
     -u "$RABBITMQ_USERNAME:$RABBITMQ_PASSWORD" \
     -H "content-type:application/json" \
     -X POST -d'{"count":1,"ackmode":"ack_requeue_false","encoding":"auto"}' \
     "$RABBITMQ_HOST/api/queues/%2f/$TEST_QUEUE/get" \
     -o $MESSAGE_RECEIVED

# 6) validation - compare sent payload with received payload
# 6.1) parse message from the queue to extract its payload
# 6.2) sent payload and received payload has to be the same! compare md5sum
header "Validation - compare sent and received payloads (must be equal)"
cat $MESSAGE_RECEIVED | jq -j '.[0].payload' > $PAYLOAD_RECEIVED
md5sum $PAYLOAD_SENT $PAYLOAD_RECEIVED
