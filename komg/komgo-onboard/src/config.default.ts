export default {
  aws: {
    enabled: false,
    env: {
      type: 'qa',
      name: 'qa-london'
    },
    config: {
      region: 'eu-west-1',
      id: '',
      key: ''
    }
  },
  addressbook: {
    version: '1',
    outputfilename: 'Komgo-address-book.json'
  },
  common: {
    schema: 'http',
    hostname: 'localhost',
    port: '15673',
    username: 'KomgoCommonUser',
    password: 'Tostoresomewhere'
  },
  routing: {
    username: 'KomgoInternalUser',
    password: 'Tostoresomewhere'
  },
  keycloak: {
    url: 'http://localhost:8070',
    realm: 'KOMGO',
    user: 'superuser',
    password: 'z2L"Y!vYja>='
  },
  keys: {
    enabled: false,
    signer: {
      url: 'http://localhost:3107'
    },
    blockchainsigner: {
      url: 'http://localhost:3112'
    }
  },
  api: {
    registry: {
      url: 'http://localhost:3333/api/registry'
    }
  },
  delay: 1000,
  ens: {
    vaktonly: false,
    address: '0x4a6fa0250e074e3765e6a726f8ae11c3c00e42f4',
    gas: 804247552,
    from: '0x8304cb99e989ee34af465db1cf15e369d8402870',
    domain: {
      komgoresolver: 'komgoresolver.contract.komgo',
      komgoregistrar: 'komgoregistrar.contract.komgo',
      komgometaresolver: 'komgometaresolver.contract.komgo',
      komgoonboarder: 'komgoonboarder.contract.komgo'
    }
  },
  harbor: {
    enabled: false,
    url: 'https://harbor.local',
    username: 'HarborUser',
    password: 'HarborPassword',
    project: 'SomeProjectId'
  }
}
