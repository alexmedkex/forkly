#!/bin/bash

function header() {
    echo
    echo "======================================================================"
    echo "  $1"
    echo "======================================================================"
}

function prepare_message_to_send() {
    local routing_key="$1"
    local payload_size="$2"
    local payload_sent="$3"
    local message_sent="$4"

    if [ ! -f "$payload_sent" ]; then
        echo "creating a random ascii message of ${payload_size}mb, this may take a while..."
        size=$(($payload_size * 1024 * 1024))
        base64 --wrap=0 /dev/urandom | head -c $size > $payload_sent

        echo '{"routing_key":"'"$routing_key"'","payload":"'"$(cat $payload_sent)"'","payload_encoding":"string","properties":{"timestamp":1544541254210,"message_id":"ab571b4e-a7c3-445c-b106-9c00cc630576","content_type":"application/json","content_encoding":"utf-8","delivery_mode":2,"headers":{"recipient-mnid":"65c51eba-7c65-4b14-aaac-d469a292a7fc","sender-mnid":"b0ce2579-2c5f-4d05-94a5-0b720afa4f43","sender-platform":"komgo","sender-staticid":"87381232-31ca-4b78-9ca5-5820d07160d5","envelope-version":"0001"}}}' > $message_sent
    fi

    echo "Files are ready:"
    ls -la $payload_sent $message_sent
}

function rmq_assert_queue() {
    local username="$1"
    local password="$2"
    local host="$3"
    local queue_name="$4"
    curl -vvv \
         --fail \
         --insecure \
         -u "$username:$password" \
         -H "content-type:application/json" \
         -XPUT -d'{"type":"direct","durable":true}' \
         "$host/api/queues/%2f/$queue_name"
}

function rmq_purge_queue() {
    local username="$1"
    local password="$2"
    local host="$3"
    local queue_name="$4"
    curl -vvv \
         --fail \
         --insecure \
         -u "$username:$password" \
         -H "content-type:application/json" \
         -XDELETE \
         "$host/api/queues/%2f/$queue_name/contents"
}
