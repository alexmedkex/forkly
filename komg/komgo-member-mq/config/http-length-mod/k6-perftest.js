import encoding from "k6/encoding";
import crypto from 'k6/crypto';
import http from "k6/http";
import { check, sleep } from "k6";

// =============================================================================
//   CONSTANTS
// =============================================================================
// common
const headers = {
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + encoding.b64encode(`${__ENV.USERNAME}:${__ENV.PASSWORD}`)
    }
}

// publish message related constants
const publishUrl = `${__ENV.HOST}/api/exchanges/%2f/amq.default/publish`
const publishPayload = open('/mnt/payload.json')
const publishPayloadChecksum = crypto.md5(publishPayload, "hex");

// get message related constants
const getUrl = `${__ENV.HOST}/api/queues/%2f/${__ENV.QUEUE}/get`
const getBody = '{"count":1,"ackmode":"ack_requeue_false","encoding":"auto"}'

// =============================================================================
//   TEST EXECUTION
// =============================================================================
// this will be called by each VU (Virtual User)
// the test procedure is, for each VU:
// 1) generate a unique ID for each message sent
// 2) prepare message to be sent with embeded unique ID
// 3) publish message to rabbit mq
// 4) get message from rabbit mq
// 5) extract/caclulate from message:
// 5.1) unique ID
// 5.2) message payload checksum
// 6) assert received message
// 6.1) ensure message payload checksum matches with the one sent
//      (pre-calculated in publishPayloadChecksum)
// 6.2) ensure unique ID is defined
// big caveat:
// - with concurrent VU it is not guaranteed that the message received is the
//   same as message sent, i.e. this can happen uniqueID != collectedUniqueID
// - to ensure all messages were sent and received, an external script should
//   verify the console.logs from a given execution and conclude if all messages
//   were received without duplication
export default function() {
    console.log('beginning test')
    const uniqueID = `${__VU}-${__ITER}`
    console.log(`seqnum-${uniqueID} sent`)

    // publish message to rabbit mq
    const publishBody = `{"routing_key":"${__ENV.QUEUE}","payload":"${publishPayload}","payload_encoding":"string","properties":{"timestamp":1544541254210,"message_id":"ab571b4e-a7c3-445c-b106-9c00cc630576","content_type":"application/json","content_encoding":"utf-8","delivery_mode":2,"headers":{"uniqueID":"${uniqueID}","recipient-mnid":"65c51eba-7c65-4b14-aaac-d469a292a7fc","sender-mnid":"b0ce2579-2c5f-4d05-94a5-0b720afa4f43","sender-platform":"komgo","sender-staticid":"87381232-31ca-4b78-9ca5-5820d07160d5","envelope-version":"0001"}}}`
    let res = http.post(publishUrl, publishBody, headers);
    check(res, {
        "publish message status was 200": (r) => r.status == 200
    });

    // get message from rabbitmq & verify if checksum matches
    res = http.post(getUrl, getBody, headers)

    const collectedUniqueID = res.json()[0].properties.headers.uniqueID
    const getPayloadChecksum = crypto.md5(res.json()[0].payload, "hex")
    console.log(`seqnum-${collectedUniqueID} received`)

    check(res, {
        "get message status was 200": (r) => r.status == 200,
        "checksum matches": (r) => getPayloadChecksum === publishPayloadChecksum,
        "sequence number is defined": (r) => collectedUniqueID !== false
    });
}
