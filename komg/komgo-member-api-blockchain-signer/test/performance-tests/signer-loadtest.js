import { check } from "k6";
import http from "k6/http";

// Randomly generate characters
function makeid(length) {
    var result           = '';
    var characters       = 'abcdef0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

export default function () {

    // Change "to" field to match your environments DocumentRegistry contract address
    // data field, 0x304fb1a0 is publishDocumentHash encoded signature
    // randomly generate the next 128 characters to make sure every transaction is unique
    let res = http.post("http://api-blockchain-signer:8080/v0/signer/send-tx",
        { "to": "0xF4Bd094799a2FF7b1aeA186Ac62D91DaeB01Bbfd", "value": "0x0", "data": `0x304fb1a0${makeid(128)}` }); 
    check(res, {
        "is status 200": (r) => r.status === 200
    });
};