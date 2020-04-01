# Komgo api signer

Module resposnbile for the host company's key management, signing & encryption

# API

## Encrypting Data

- Needs a payload (data to encrypt)
- Receivers public key

### Request:

``` 
curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
   "payload": "hello world", \ 
   "publicKey": "e704a1a54e1f235164580f292c4c01011180cf8700d0a9e0b459ffe44f2836004cc5cab127a7bb6152d76fb0cbad8820e3f8b3e8a621fbe6cf45756f24da8e7c" \ 
 }' 'http://localhost:3107/v0/signer/encrypt' 
 ```

### Response:
```

{
  "iv": "c1ebed59952ee8e93cf6593feeb07c13",
  "ephemPublicKey": "0435151c6c721d531d18a43e3e7db6337b7380a5171b62b56c372c56678dc639a441e426742a508e375e8552b6731e00f5fdc1764c1d4c703205ad07b49d135f27",
  "ciphertext": "2243030fbc08b91c451fbec7f5a6f5c3",
  "mac": "35f8622742fb09b0c8ff1743a36c627fc04783596c2bb95c567260eb93028135"
}

```

## Signing 

- Requires payload (content to sign)

### Request:
```
curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
   "payload": "hello world" \ 
 }' 'http://localhost:3107/v0/signer/sign'
```

### Response:

```
"0x0d6e3cbee8e8d7680e7c6ba05084b51428afc32e2abc0113a9579af417ee0de31afba78dae83290fec3246f9d0a3cd84cf9e4ca554b545e56ec0d16ed818efc61c"

```

## Decrypt


- Needs payload (encryption keys, iv , cipher, mac)
- signature to be verified 

### Request:

```


curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
   "payload": { \ 
   "iv": "c1ebed59952ee8e93cf6593feeb07c13", \ 
   "ephemPublicKey": "0435151c6c721d531d18a43e3e7db6337b7380a5171b62b56c372c56678dc639a441e426742a508e375e8552b6731e00f5fdc1764c1d4c703205ad07b49d135f27", \ 
   "ciphertext": "2243030fbc08b91c451fbec7f5a6f5c3", \ 
   "mac": "35f8622742fb09b0c8ff1743a36c627fc04783596c2bb95c567260eb93028135" \ 
 }, \ 
   "signature": "0x14da69b5a5982fbfc6caa40eb4e1e137949163ed02a5aa724554c5c09cb8fbf534a66548ff957a3221e123c53238b18cd65749c66fc689f54365874e090bbf891b" \ 
 }' 'http://localhost:3107/v0/signer/decrypt'curl

```

### Response:

```
rawdata
```

## Verify

- Needs payload (Message content, possibly after decryption)
- signature to be verified 

### Request:

```

curl -X POST --header 'Content-Type: application/json' --header 'Accept: application/json' -d '{ \ 
   "payload": "hello world", \ 
   "signature": "0x14da69b5a5982fbfc6caa40eb4e1e137949163ed02a5aa724554c5c09cb8fbf534a66548ff957a3221e123c53238b18cd65749c66fc689f54365874e090bbf891b" \ 
 }' 'http://localhost:3107/v0/signer/verify'

```

### Response:

```
{
  "isValid": true
}
```

## Port
- 3107

## Important Note

- If signer is a dependency to your module / MS, as it should be added to the same default docker network,
remember to replace all the calls to http://localhost:3017 -> http://api-signer