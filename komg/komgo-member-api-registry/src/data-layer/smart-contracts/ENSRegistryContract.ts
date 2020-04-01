const contractData = {
  contractName: 'ENSRegistry',
  abi: [
    {
      inputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'node',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'label',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'owner',
          type: 'address'
        }
      ],
      name: 'NewOwner',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'node',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'owner',
          type: 'address'
        }
      ],
      name: 'Transfer',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'node',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'resolver',
          type: 'address'
        }
      ],
      name: 'NewResolver',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'node',
          type: 'bytes32'
        },
        {
          indexed: false,
          name: 'ttl',
          type: 'uint64'
        }
      ],
      name: 'NewTTL',
      type: 'event'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'node',
          type: 'bytes32'
        },
        {
          name: 'owner',
          type: 'address'
        }
      ],
      name: 'setOwner',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'node',
          type: 'bytes32'
        },
        {
          name: 'label',
          type: 'bytes32'
        },
        {
          name: 'owner',
          type: 'address'
        }
      ],
      name: 'setSubnodeOwner',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'node',
          type: 'bytes32'
        },
        {
          name: 'resolver',
          type: 'address'
        }
      ],
      name: 'setResolver',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'node',
          type: 'bytes32'
        },
        {
          name: 'ttl',
          type: 'uint64'
        }
      ],
      name: 'setTTL',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: 'node',
          type: 'bytes32'
        }
      ],
      name: 'owner',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: 'node',
          type: 'bytes32'
        }
      ],
      name: 'resolver',
      outputs: [
        {
          name: '',
          type: 'address'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
    {
      constant: true,
      inputs: [
        {
          name: 'node',
          type: 'bytes32'
        }
      ],
      name: 'ttl',
      outputs: [
        {
          name: '',
          type: 'uint64'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    }
  ],
  bytecode:
    '0x608060405234801561001057600080fd5b503360008080600102815260200190815260200160002060000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610b41806100776000396000f3fe608060405260043610610083576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630178b8bf1461008857806302571be31461010357806306ab59231461017e57806314ab9038146101e357806316a25cbd146102325780631896f70a146102955780635b0fc9c3146102f0575b600080fd5b34801561009457600080fd5b506100c1600480360360208110156100ab57600080fd5b810190808035906020019092919050505061034b565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561010f57600080fd5b5061013c6004803603602081101561012657600080fd5b810190808035906020019092919050505061038a565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561018a57600080fd5b506101e1600480360360608110156101a157600080fd5b810190808035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506103c9565b005b3480156101ef57600080fd5b506102306004803603604081101561020657600080fd5b8101908080359060200190929190803567ffffffffffffffff1690602001909291905050506105c9565b005b34801561023e57600080fd5b5061026b6004803603602081101561025557600080fd5b810190808035906020019092919050505061075c565b604051808267ffffffffffffffff1667ffffffffffffffff16815260200191505060405180910390f35b3480156102a157600080fd5b506102ee600480360360408110156102b857600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061078f565b005b3480156102fc57600080fd5b506103496004803603604081101561031357600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610952565b005b600080600083815260200190815260200160002060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b600080600083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b823373ffffffffffffffffffffffffffffffffffffffff1660008083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415156104c8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f4f6e6c79206f776e657220616c6c6f77656420746f2063616c6c2066756e637481526020017f696f6e2e0000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b6000848460405160200180838152602001828152602001925050506040516020818303038152906040528051906020012090507fce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82858585604051808481526020018381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001935050505060405180910390a18260008083815260200190815260200160002060000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050505050565b813373ffffffffffffffffffffffffffffffffffffffff1660008083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415156106c8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f4f6e6c79206f776e657220616c6c6f77656420746f2063616c6c2066756e637481526020017f696f6e2e0000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b7f1d4f9bbfc9cab89d66e1a1562f2233ccbf1308cb4f63de2ead5787adddb8fa688383604051808381526020018267ffffffffffffffff1667ffffffffffffffff1681526020019250505060405180910390a18160008085815260200190815260200160002060010160146101000a81548167ffffffffffffffff021916908367ffffffffffffffff160217905550505050565b600080600083815260200190815260200160002060010160149054906101000a900467ffffffffffffffff169050919050565b813373ffffffffffffffffffffffffffffffffffffffff1660008083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614151561088e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f4f6e6c79206f776e657220616c6c6f77656420746f2063616c6c2066756e637481526020017f696f6e2e0000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b7f335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a08383604051808381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a18160008085815260200190815260200160002060010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505050565b813373ffffffffffffffffffffffffffffffffffffffff1660008083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141515610a51576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f4f6e6c79206f776e657220616c6c6f77656420746f2063616c6c2066756e637481526020017f696f6e2e0000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b7fd4735d920b0f87494915f556dd9b54c8f309026070caea5c737245152564d2668383604051808381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a18160008085815260200190815260200160002060000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050505056fea165627a7a72305820997bf92a780cce5e32d780147f00006867e97d0554665de44743707a9ebd71380029',
  deployedBytecode:
    '0x608060405260043610610083576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680630178b8bf1461008857806302571be31461010357806306ab59231461017e57806314ab9038146101e357806316a25cbd146102325780631896f70a146102955780635b0fc9c3146102f0575b600080fd5b34801561009457600080fd5b506100c1600480360360208110156100ab57600080fd5b810190808035906020019092919050505061034b565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561010f57600080fd5b5061013c6004803603602081101561012657600080fd5b810190808035906020019092919050505061038a565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34801561018a57600080fd5b506101e1600480360360608110156101a157600080fd5b810190808035906020019092919080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506103c9565b005b3480156101ef57600080fd5b506102306004803603604081101561020657600080fd5b8101908080359060200190929190803567ffffffffffffffff1690602001909291905050506105c9565b005b34801561023e57600080fd5b5061026b6004803603602081101561025557600080fd5b810190808035906020019092919050505061075c565b604051808267ffffffffffffffff1667ffffffffffffffff16815260200191505060405180910390f35b3480156102a157600080fd5b506102ee600480360360408110156102b857600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061078f565b005b3480156102fc57600080fd5b506103496004803603604081101561031357600080fd5b8101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610952565b005b600080600083815260200190815260200160002060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b600080600083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b823373ffffffffffffffffffffffffffffffffffffffff1660008083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415156104c8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f4f6e6c79206f776e657220616c6c6f77656420746f2063616c6c2066756e637481526020017f696f6e2e0000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b6000848460405160200180838152602001828152602001925050506040516020818303038152906040528051906020012090507fce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82858585604051808481526020018381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001935050505060405180910390a18260008083815260200190815260200160002060000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050505050565b813373ffffffffffffffffffffffffffffffffffffffff1660008083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff161415156106c8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f4f6e6c79206f776e657220616c6c6f77656420746f2063616c6c2066756e637481526020017f696f6e2e0000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b7f1d4f9bbfc9cab89d66e1a1562f2233ccbf1308cb4f63de2ead5787adddb8fa688383604051808381526020018267ffffffffffffffff1667ffffffffffffffff1681526020019250505060405180910390a18160008085815260200190815260200160002060010160146101000a81548167ffffffffffffffff021916908367ffffffffffffffff160217905550505050565b600080600083815260200190815260200160002060010160149054906101000a900467ffffffffffffffff169050919050565b813373ffffffffffffffffffffffffffffffffffffffff1660008083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614151561088e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f4f6e6c79206f776e657220616c6c6f77656420746f2063616c6c2066756e637481526020017f696f6e2e0000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b7f335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a08383604051808381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a18160008085815260200190815260200160002060010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550505050565b813373ffffffffffffffffffffffffffffffffffffffff1660008083815260200190815260200160002060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141515610a51576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260248152602001807f4f6e6c79206f776e657220616c6c6f77656420746f2063616c6c2066756e637481526020017f696f6e2e0000000000000000000000000000000000000000000000000000000081525060400191505060405180910390fd5b7fd4735d920b0f87494915f556dd9b54c8f309026070caea5c737245152564d2668383604051808381526020018273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019250505060405180910390a18160008085815260200190815260200160002060000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050505056fea165627a7a72305820997bf92a780cce5e32d780147f00006867e97d0554665de44743707a9ebd71380029',
  sourceMap:
    '84:2915:9:-;;;536:69;8:9:-1;5:2;;;30:1;27;20:12;5:2;536:69:9;588:10;567:7;:12;575:3;567:12;;;;;;;;;;;;;:18;;;:31;;;;;;;;;;;;;;;;;;84:2915;;;;;;',
  deployedSourceMap:
    '84:2915:9:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2623:108;;8:9:-1;5:2;;;30:1;27;20:12;5:2;2623:108:9;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;2623:108:9;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2348:102;;8:9:-1;5:2;;;30:1;27;20:12;5:2;2348:102:9;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;2348:102:9;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1307:251;;8:9:-1;5:2;;;30:1;27;20:12;5:2;1307:251:9;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;1307:251:9;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2050:138;;8:9:-1;5:2;;;30:1;27;20:12;5:2;2050:138:9;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;2050:138:9;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2899:97;;8:9:-1;5:2;;;30:1;27;20:12;5:2;2899:97:9;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;2899:97:9;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1733:169;;8:9:-1;5:2;;;30:1;27;20:12;5:2;1733:169:9;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;1733:169:9;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;844:151;;8:9:-1;5:2;;;30:1;27;20:12;5:2;844:151:9;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;844:151:9;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2623:108;2676:7;2702;:13;2710:4;2702:13;;;;;;;;;;;:22;;;;;;;;;;;;2695:29;;2623:108;;;:::o;2348:102::-;2398:7;2424;:13;2432:4;2424:13;;;;;;;;;;;:19;;;;;;;;;;;;2417:26;;2348:102;;;:::o;1307:251::-;1394:4;401:10;378:33;;:7;:13;386:4;378:13;;;;;;;;;;;:19;;;;;;;;;;;;:33;;;370:82;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1410:15;1455:4;1461:5;1438:29;;;;;;;;;;;;;;;;;;;;;49:4:-1;39:7;30;26:21;22:32;13:7;6:49;1438:29:9;;;1428:40;;;;;;1410:58;;1483:28;1492:4;1498:5;1505;1483:28;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1546:5;1521:7;:16;1529:7;1521:16;;;;;;;;;;;:22;;;:30;;;;;;;;;;;;;;;;;;462:1;1307:251;;;;:::o;2050:138::-;2110:4;401:10;378:33;;:7;:13;386:4;378:13;;;;;;;;;;;:19;;;;;;;;;;;;:33;;;370:82;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2131:17;2138:4;2144:3;2131:17;;;;;;;;;;;;;;;;;;;;;;;;;;;;2178:3;2158:7;:13;2166:4;2158:13;;;;;;;;;;;:17;;;:23;;;;;;;;;;;;;;;;;;2050:138;;;:::o;2899:97::-;2947:6;2972:7;:13;2980:4;2972:13;;;;;;;;;;;:17;;;;;;;;;;;;2965:24;;2899:97;;;:::o;1733:169::-;1804:4;401:10;378:33;;:7;:13;386:4;378:13;;;;;;;;;;;:19;;;;;;;;;;;;:33;;;370:82;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;1825:27;1837:4;1843:8;1825:27;;;;;;;;;;;;;;;;;;;;;;;;;;;;1887:8;1862:7;:13;1870:4;1862:13;;;;;;;;;;;:22;;;:33;;;;;;;;;;;;;;;;;;1733:169;;;:::o;844:151::-;909:4;401:10;378:33;;:7;:13;386:4;378:13;;;;;;;;;;;:19;;;;;;;;;;;;:33;;;370:82;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;930:21;939:4;945:5;930:21;;;;;;;;;;;;;;;;;;;;;;;;;;;;983:5;961:7;:13;969:4;961:13;;;;;;;;;;;:19;;;:27;;;;;;;;;;;;;;;;;;844:151;;;:::o',
  source:
    'pragma solidity ^0.5.0;\n\nimport "./ENS.sol";\n\n/**\n * The ENS registry contract.\n */\ncontract ENSRegistry is ENS {\n    struct Record {\n        address owner;\n        address resolver;\n        uint64 ttl;\n    }\n\n    mapping (bytes32 => Record) records;\n\n    // Permits modifications only by the owner of the specified node.\n    modifier only_owner(bytes32 node) {\n        require(records[node].owner == msg.sender, "Only owner allowed to call function.");\n        _;\n    }\n\n    /**\n     * @dev Constructs a new ENS registrar.\n     */\n    constructor() public {\n        records[0x0].owner = msg.sender;\n    }\n\n    /**\n     * @dev Transfers ownership of a node to a new address. May only be called by the current owner of the node.\n     * @param node The node to transfer ownership of.\n     * @param owner The address of the new owner.\n     */\n    function setOwner(bytes32 node, address owner) public only_owner(node) {\n        emit Transfer(node, owner);\n        records[node].owner = owner;\n    }\n\n    /**\n     * @dev Transfers ownership of a subnode keccak256(node, label) to a new address. May only be called by the owner of the parent node.\n     * @param node The parent node.\n     * @param label The hash of the label specifying the subnode.\n     * @param owner The address of the new owner.\n     */\n    function setSubnodeOwner(bytes32 node, bytes32 label, address owner) public only_owner(node) {\n        bytes32 subnode = keccak256(abi.encodePacked(node, label));\n        emit NewOwner(node, label, owner);\n        records[subnode].owner = owner;\n    }\n\n    /**\n     * @dev Sets the resolver address for the specified node.\n     * @param node The node to update.\n     * @param resolver The address of the resolver.\n     */\n    function setResolver(bytes32 node, address resolver) public only_owner(node) {\n        emit NewResolver(node, resolver);\n        records[node].resolver = resolver;\n    }\n\n    /**\n     * @dev Sets the TTL for the specified node.\n     * @param node The node to update.\n     * @param ttl The TTL in seconds.\n     */\n    function setTTL(bytes32 node, uint64 ttl) public only_owner(node) {\n        emit NewTTL(node, ttl);\n        records[node].ttl = ttl;\n    }\n\n    /**\n     * @dev Returns the address that owns the specified node.\n     * @param node The specified node.\n     * @return address of the owner.\n     */\n    function owner(bytes32 node) public view returns (address) {\n        return records[node].owner;\n    }\n\n    /**\n     * @dev Returns the address of the resolver for the specified node.\n     * @param node The specified node.\n     * @return address of the resolver.\n     */\n    function resolver(bytes32 node) public view returns (address) {\n        return records[node].resolver;\n    }\n\n    /**\n     * @dev Returns the TTL of a node, and any records associated with it.\n     * @param node The specified node.\n     * @return ttl of the node.\n     */\n    function ttl(bytes32 node) public view returns (uint64) {\n        return records[node].ttl;\n    }\n\n}\n',
  sourcePath: '/home/alexmedkex/komgo-member-blockchain/contracts/lib/ENSRegistry.sol',
  ast: {
    absolutePath: '/home/alexmedkex/komgo-member-blockchain/contracts/lib/ENSRegistry.sol',
    exportedSymbols: {
      ENSRegistry: [2108]
    },
    id: 2109,
    nodeType: 'SourceUnit',
    nodes: [
      {
        id: 1920,
        literals: ['solidity', '^', '0.5', '.0'],
        nodeType: 'PragmaDirective',
        src: '0:23:9'
      },
      {
        absolutePath: '/home/alexmedkex/komgo-member-blockchain/contracts/lib/ENS.sol',
        file: './ENS.sol',
        id: 1921,
        nodeType: 'ImportDirective',
        scope: 2109,
        sourceUnit: 1919,
        src: '25:19:9',
        symbolAliases: [],
        unitAlias: ''
      },
      {
        baseContracts: [
          {
            arguments: null,
            baseName: {
              contractScope: null,
              id: 1922,
              name: 'ENS',
              nodeType: 'UserDefinedTypeName',
              referencedDeclaration: 1918,
              src: '108:3:9',
              typeDescriptions: {
                typeIdentifier: 't_contract$_ENS_$1918',
                typeString: 'contract ENS'
              }
            },
            id: 1923,
            nodeType: 'InheritanceSpecifier',
            src: '108:3:9'
          }
        ],
        contractDependencies: [1918],
        contractKind: 'contract',
        documentation: 'The ENS registry contract.',
        fullyImplemented: true,
        id: 2108,
        linearizedBaseContracts: [2108, 1918],
        name: 'ENSRegistry',
        nodeType: 'ContractDefinition',
        nodes: [
          {
            canonicalName: 'ENSRegistry.Record',
            id: 1930,
            members: [
              {
                constant: false,
                id: 1925,
                name: 'owner',
                nodeType: 'VariableDeclaration',
                scope: 1930,
                src: '142:13:9',
                stateVariable: false,
                storageLocation: 'default',
                typeDescriptions: {
                  typeIdentifier: 't_address',
                  typeString: 'address'
                },
                typeName: {
                  id: 1924,
                  name: 'address',
                  nodeType: 'ElementaryTypeName',
                  src: '142:7:9',
                  stateMutability: 'nonpayable',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  }
                },
                value: null,
                visibility: 'internal'
              },
              {
                constant: false,
                id: 1927,
                name: 'resolver',
                nodeType: 'VariableDeclaration',
                scope: 1930,
                src: '165:16:9',
                stateVariable: false,
                storageLocation: 'default',
                typeDescriptions: {
                  typeIdentifier: 't_address',
                  typeString: 'address'
                },
                typeName: {
                  id: 1926,
                  name: 'address',
                  nodeType: 'ElementaryTypeName',
                  src: '165:7:9',
                  stateMutability: 'nonpayable',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  }
                },
                value: null,
                visibility: 'internal'
              },
              {
                constant: false,
                id: 1929,
                name: 'ttl',
                nodeType: 'VariableDeclaration',
                scope: 1930,
                src: '191:10:9',
                stateVariable: false,
                storageLocation: 'default',
                typeDescriptions: {
                  typeIdentifier: 't_uint64',
                  typeString: 'uint64'
                },
                typeName: {
                  id: 1928,
                  name: 'uint64',
                  nodeType: 'ElementaryTypeName',
                  src: '191:6:9',
                  typeDescriptions: {
                    typeIdentifier: 't_uint64',
                    typeString: 'uint64'
                  }
                },
                value: null,
                visibility: 'internal'
              }
            ],
            name: 'Record',
            nodeType: 'StructDefinition',
            scope: 2108,
            src: '118:90:9',
            visibility: 'public'
          },
          {
            constant: false,
            id: 1934,
            name: 'records',
            nodeType: 'VariableDeclaration',
            scope: 2108,
            src: '214:35:9',
            stateVariable: true,
            storageLocation: 'default',
            typeDescriptions: {
              typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
              typeString: 'mapping(bytes32 => struct ENSRegistry.Record)'
            },
            typeName: {
              id: 1933,
              keyType: {
                id: 1931,
                name: 'bytes32',
                nodeType: 'ElementaryTypeName',
                src: '223:7:9',
                typeDescriptions: {
                  typeIdentifier: 't_bytes32',
                  typeString: 'bytes32'
                }
              },
              nodeType: 'Mapping',
              src: '214:27:9',
              typeDescriptions: {
                typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                typeString: 'mapping(bytes32 => struct ENSRegistry.Record)'
              },
              valueType: {
                contractScope: null,
                id: 1932,
                name: 'Record',
                nodeType: 'UserDefinedTypeName',
                referencedDeclaration: 1930,
                src: '234:6:9',
                typeDescriptions: {
                  typeIdentifier: 't_struct$_Record_$1930_storage_ptr',
                  typeString: 'struct ENSRegistry.Record'
                }
              }
            },
            value: null,
            visibility: 'internal'
          },
          {
            body: {
              id: 1950,
              nodeType: 'Block',
              src: '360:110:9',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        commonType: {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        },
                        id: 1945,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        leftExpression: {
                          argumentTypes: null,
                          expression: {
                            argumentTypes: null,
                            baseExpression: {
                              argumentTypes: null,
                              id: 1939,
                              name: 'records',
                              nodeType: 'Identifier',
                              overloadedDeclarations: [],
                              referencedDeclaration: 1934,
                              src: '378:7:9',
                              typeDescriptions: {
                                typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                                typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                              }
                            },
                            id: 1941,
                            indexExpression: {
                              argumentTypes: null,
                              id: 1940,
                              name: 'node',
                              nodeType: 'Identifier',
                              overloadedDeclarations: [],
                              referencedDeclaration: 1936,
                              src: '386:4:9',
                              typeDescriptions: {
                                typeIdentifier: 't_bytes32',
                                typeString: 'bytes32'
                              }
                            },
                            isConstant: false,
                            isLValue: true,
                            isPure: false,
                            lValueRequested: false,
                            nodeType: 'IndexAccess',
                            src: '378:13:9',
                            typeDescriptions: {
                              typeIdentifier: 't_struct$_Record_$1930_storage',
                              typeString: 'struct ENSRegistry.Record storage ref'
                            }
                          },
                          id: 1942,
                          isConstant: false,
                          isLValue: true,
                          isPure: false,
                          lValueRequested: false,
                          memberName: 'owner',
                          nodeType: 'MemberAccess',
                          referencedDeclaration: 1925,
                          src: '378:19:9',
                          typeDescriptions: {
                            typeIdentifier: 't_address',
                            typeString: 'address'
                          }
                        },
                        nodeType: 'BinaryOperation',
                        operator: '==',
                        rightExpression: {
                          argumentTypes: null,
                          expression: {
                            argumentTypes: null,
                            id: 1943,
                            name: 'msg',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 2700,
                            src: '401:3:9',
                            typeDescriptions: {
                              typeIdentifier: 't_magic_message',
                              typeString: 'msg'
                            }
                          },
                          id: 1944,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          lValueRequested: false,
                          memberName: 'sender',
                          nodeType: 'MemberAccess',
                          referencedDeclaration: null,
                          src: '401:10:9',
                          typeDescriptions: {
                            typeIdentifier: 't_address_payable',
                            typeString: 'address payable'
                          }
                        },
                        src: '378:33:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bool',
                          typeString: 'bool'
                        }
                      },
                      {
                        argumentTypes: null,
                        hexValue: '4f6e6c79206f776e657220616c6c6f77656420746f2063616c6c2066756e6374696f6e2e',
                        id: 1946,
                        isConstant: false,
                        isLValue: false,
                        isPure: true,
                        kind: 'string',
                        lValueRequested: false,
                        nodeType: 'Literal',
                        src: '413:38:9',
                        subdenomination: null,
                        typeDescriptions: {
                          typeIdentifier:
                            't_stringliteral_7564981d91702f2b55ae12026036be8620127651d3c1ceaff33efe75dd238408',
                          typeString: 'literal_string "Only owner allowed to call function."'
                        },
                        value: 'Only owner allowed to call function.'
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bool',
                          typeString: 'bool'
                        },
                        {
                          typeIdentifier:
                            't_stringliteral_7564981d91702f2b55ae12026036be8620127651d3c1ceaff33efe75dd238408',
                          typeString: 'literal_string "Only owner allowed to call function."'
                        }
                      ],
                      id: 1938,
                      name: 'require',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [2703, 2704],
                      referencedDeclaration: 2704,
                      src: '370:7:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$',
                        typeString: 'function (bool,string memory) pure'
                      }
                    },
                    id: 1947,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '370:82:9',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 1948,
                  nodeType: 'ExpressionStatement',
                  src: '370:82:9'
                },
                {
                  id: 1949,
                  nodeType: 'PlaceholderStatement',
                  src: '462:1:9'
                }
              ]
            },
            documentation: null,
            id: 1951,
            name: 'only_owner',
            nodeType: 'ModifierDefinition',
            parameters: {
              id: 1937,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 1936,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 1951,
                  src: '346:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 1935,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '346:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '345:14:9'
            },
            src: '326:144:9',
            visibility: 'internal'
          },
          {
            body: {
              id: 1962,
              nodeType: 'Block',
              src: '557:48:9',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    id: 1960,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        baseExpression: {
                          argumentTypes: null,
                          id: 1954,
                          name: 'records',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1934,
                          src: '567:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                            typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                          }
                        },
                        id: 1956,
                        indexExpression: {
                          argumentTypes: null,
                          hexValue: '307830',
                          id: 1955,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          kind: 'number',
                          lValueRequested: false,
                          nodeType: 'Literal',
                          src: '575:3:9',
                          subdenomination: null,
                          typeDescriptions: {
                            typeIdentifier: 't_rational_0_by_1',
                            typeString: 'int_const 0'
                          },
                          value: '0x0'
                        },
                        isConstant: false,
                        isLValue: true,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: 'IndexAccess',
                        src: '567:12:9',
                        typeDescriptions: {
                          typeIdentifier: 't_struct$_Record_$1930_storage',
                          typeString: 'struct ENSRegistry.Record storage ref'
                        }
                      },
                      id: 1957,
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: true,
                      memberName: 'owner',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: 1925,
                      src: '567:18:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        id: 1958,
                        name: 'msg',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2700,
                        src: '588:3:9',
                        typeDescriptions: {
                          typeIdentifier: 't_magic_message',
                          typeString: 'msg'
                        }
                      },
                      id: 1959,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: 'sender',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: null,
                      src: '588:10:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address_payable',
                        typeString: 'address payable'
                      }
                    },
                    src: '567:31:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  id: 1961,
                  nodeType: 'ExpressionStatement',
                  src: '567:31:9'
                }
              ]
            },
            documentation: '@dev Constructs a new ENS registrar.',
            id: 1963,
            implemented: true,
            kind: 'constructor',
            modifiers: [],
            name: '',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 1952,
              nodeType: 'ParameterList',
              parameters: [],
              src: '547:2:9'
            },
            returnParameters: {
              id: 1953,
              nodeType: 'ParameterList',
              parameters: [],
              src: '557:0:9'
            },
            scope: 2108,
            src: '536:69:9',
            stateMutability: 'nonpayable',
            superFunction: null,
            visibility: 'public'
          },
          {
            body: {
              id: 1985,
              nodeType: 'Block',
              src: '915:80:9',
              statements: [
                {
                  eventCall: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        id: 1974,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1965,
                        src: '939:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      {
                        argumentTypes: null,
                        id: 1975,
                        name: 'owner',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1967,
                        src: '945:5:9',
                        typeDescriptions: {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        },
                        {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      ],
                      id: 1973,
                      name: 'Transfer',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1854,
                      src: '930:8:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_event_nonpayable$_t_bytes32_$_t_address_$returns$__$',
                        typeString: 'function (bytes32,address)'
                      }
                    },
                    id: 1976,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '930:21:9',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 1977,
                  nodeType: 'EmitStatement',
                  src: '925:26:9'
                },
                {
                  expression: {
                    argumentTypes: null,
                    id: 1983,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        baseExpression: {
                          argumentTypes: null,
                          id: 1978,
                          name: 'records',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1934,
                          src: '961:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                            typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                          }
                        },
                        id: 1980,
                        indexExpression: {
                          argumentTypes: null,
                          id: 1979,
                          name: 'node',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1965,
                          src: '969:4:9',
                          typeDescriptions: {
                            typeIdentifier: 't_bytes32',
                            typeString: 'bytes32'
                          }
                        },
                        isConstant: false,
                        isLValue: true,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: 'IndexAccess',
                        src: '961:13:9',
                        typeDescriptions: {
                          typeIdentifier: 't_struct$_Record_$1930_storage',
                          typeString: 'struct ENSRegistry.Record storage ref'
                        }
                      },
                      id: 1981,
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: true,
                      memberName: 'owner',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: 1925,
                      src: '961:19:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      id: 1982,
                      name: 'owner',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1967,
                      src: '983:5:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    src: '961:27:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  id: 1984,
                  nodeType: 'ExpressionStatement',
                  src: '961:27:9'
                }
              ]
            },
            documentation:
              '@dev Transfers ownership of a node to a new address. May only be called by the current owner of the node.\n@param node The node to transfer ownership of.\n@param owner The address of the new owner.',
            id: 1986,
            implemented: true,
            kind: 'function',
            modifiers: [
              {
                arguments: [
                  {
                    argumentTypes: null,
                    id: 1970,
                    name: 'node',
                    nodeType: 'Identifier',
                    overloadedDeclarations: [],
                    referencedDeclaration: 1965,
                    src: '909:4:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  }
                ],
                id: 1971,
                modifierName: {
                  argumentTypes: null,
                  id: 1969,
                  name: 'only_owner',
                  nodeType: 'Identifier',
                  overloadedDeclarations: [],
                  referencedDeclaration: 1951,
                  src: '898:10:9',
                  typeDescriptions: {
                    typeIdentifier: 't_modifier$_t_bytes32_$',
                    typeString: 'modifier (bytes32)'
                  }
                },
                nodeType: 'ModifierInvocation',
                src: '898:16:9'
              }
            ],
            name: 'setOwner',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 1968,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 1965,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 1986,
                  src: '862:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 1964,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '862:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                },
                {
                  constant: false,
                  id: 1967,
                  name: 'owner',
                  nodeType: 'VariableDeclaration',
                  scope: 1986,
                  src: '876:13:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 1966,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '876:7:9',
                    stateMutability: 'nonpayable',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '861:29:9'
            },
            returnParameters: {
              id: 1972,
              nodeType: 'ParameterList',
              parameters: [],
              src: '915:0:9'
            },
            scope: 2108,
            src: '844:151:9',
            stateMutability: 'nonpayable',
            superFunction: 1889,
            visibility: 'public'
          },
          {
            body: {
              id: 2021,
              nodeType: 'Block',
              src: '1400:158:9',
              statements: [
                {
                  assignments: [1999],
                  declarations: [
                    {
                      constant: false,
                      id: 1999,
                      name: 'subnode',
                      nodeType: 'VariableDeclaration',
                      scope: 2021,
                      src: '1410:15:9',
                      stateVariable: false,
                      storageLocation: 'default',
                      typeDescriptions: {
                        typeIdentifier: 't_bytes32',
                        typeString: 'bytes32'
                      },
                      typeName: {
                        id: 1998,
                        name: 'bytes32',
                        nodeType: 'ElementaryTypeName',
                        src: '1410:7:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      value: null,
                      visibility: 'internal'
                    }
                  ],
                  id: 2007,
                  initialValue: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        arguments: [
                          {
                            argumentTypes: null,
                            id: 2003,
                            name: 'node',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 1988,
                            src: '1455:4:9',
                            typeDescriptions: {
                              typeIdentifier: 't_bytes32',
                              typeString: 'bytes32'
                            }
                          },
                          {
                            argumentTypes: null,
                            id: 2004,
                            name: 'label',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 1990,
                            src: '1461:5:9',
                            typeDescriptions: {
                              typeIdentifier: 't_bytes32',
                              typeString: 'bytes32'
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: 't_bytes32',
                              typeString: 'bytes32'
                            },
                            {
                              typeIdentifier: 't_bytes32',
                              typeString: 'bytes32'
                            }
                          ],
                          expression: {
                            argumentTypes: null,
                            id: 2001,
                            name: 'abi',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 2687,
                            src: '1438:3:9',
                            typeDescriptions: {
                              typeIdentifier: 't_magic_abi',
                              typeString: 'abi'
                            }
                          },
                          id: 2002,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          lValueRequested: false,
                          memberName: 'encodePacked',
                          nodeType: 'MemberAccess',
                          referencedDeclaration: null,
                          src: '1438:16:9',
                          typeDescriptions: {
                            typeIdentifier: 't_function_abiencodepacked_pure$__$returns$_t_bytes_memory_ptr_$',
                            typeString: 'function () pure returns (bytes memory)'
                          }
                        },
                        id: 2005,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: 'functionCall',
                        lValueRequested: false,
                        names: [],
                        nodeType: 'FunctionCall',
                        src: '1438:29:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes_memory_ptr',
                          typeString: 'bytes memory'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bytes_memory_ptr',
                          typeString: 'bytes memory'
                        }
                      ],
                      id: 2000,
                      name: 'keccak256',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 2694,
                      src: '1428:9:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_keccak256_pure$_t_bytes_memory_ptr_$returns$_t_bytes32_$',
                        typeString: 'function (bytes memory) pure returns (bytes32)'
                      }
                    },
                    id: 2006,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '1428:40:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  nodeType: 'VariableDeclarationStatement',
                  src: '1410:58:9'
                },
                {
                  eventCall: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        id: 2009,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1988,
                        src: '1492:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      {
                        argumentTypes: null,
                        id: 2010,
                        name: 'label',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1990,
                        src: '1498:5:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      {
                        argumentTypes: null,
                        id: 2011,
                        name: 'owner',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1992,
                        src: '1505:5:9',
                        typeDescriptions: {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        },
                        {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        },
                        {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      ],
                      id: 2008,
                      name: 'NewOwner',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1848,
                      src: '1483:8:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_event_nonpayable$_t_bytes32_$_t_bytes32_$_t_address_$returns$__$',
                        typeString: 'function (bytes32,bytes32,address)'
                      }
                    },
                    id: 2012,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '1483:28:9',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 2013,
                  nodeType: 'EmitStatement',
                  src: '1478:33:9'
                },
                {
                  expression: {
                    argumentTypes: null,
                    id: 2019,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        baseExpression: {
                          argumentTypes: null,
                          id: 2014,
                          name: 'records',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1934,
                          src: '1521:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                            typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                          }
                        },
                        id: 2016,
                        indexExpression: {
                          argumentTypes: null,
                          id: 2015,
                          name: 'subnode',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1999,
                          src: '1529:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_bytes32',
                            typeString: 'bytes32'
                          }
                        },
                        isConstant: false,
                        isLValue: true,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: 'IndexAccess',
                        src: '1521:16:9',
                        typeDescriptions: {
                          typeIdentifier: 't_struct$_Record_$1930_storage',
                          typeString: 'struct ENSRegistry.Record storage ref'
                        }
                      },
                      id: 2017,
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: true,
                      memberName: 'owner',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: 1925,
                      src: '1521:22:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      id: 2018,
                      name: 'owner',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1992,
                      src: '1546:5:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    src: '1521:30:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  id: 2020,
                  nodeType: 'ExpressionStatement',
                  src: '1521:30:9'
                }
              ]
            },
            documentation:
              '@dev Transfers ownership of a subnode keccak256(node, label) to a new address. May only be called by the owner of the parent node.\n@param node The parent node.\n@param label The hash of the label specifying the subnode.\n@param owner The address of the new owner.',
            id: 2022,
            implemented: true,
            kind: 'function',
            modifiers: [
              {
                arguments: [
                  {
                    argumentTypes: null,
                    id: 1995,
                    name: 'node',
                    nodeType: 'Identifier',
                    overloadedDeclarations: [],
                    referencedDeclaration: 1988,
                    src: '1394:4:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  }
                ],
                id: 1996,
                modifierName: {
                  argumentTypes: null,
                  id: 1994,
                  name: 'only_owner',
                  nodeType: 'Identifier',
                  overloadedDeclarations: [],
                  referencedDeclaration: 1951,
                  src: '1383:10:9',
                  typeDescriptions: {
                    typeIdentifier: 't_modifier$_t_bytes32_$',
                    typeString: 'modifier (bytes32)'
                  }
                },
                nodeType: 'ModifierInvocation',
                src: '1383:16:9'
              }
            ],
            name: 'setSubnodeOwner',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 1993,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 1988,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2022,
                  src: '1332:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 1987,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '1332:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                },
                {
                  constant: false,
                  id: 1990,
                  name: 'label',
                  nodeType: 'VariableDeclaration',
                  scope: 2022,
                  src: '1346:13:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 1989,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '1346:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                },
                {
                  constant: false,
                  id: 1992,
                  name: 'owner',
                  nodeType: 'VariableDeclaration',
                  scope: 2022,
                  src: '1361:13:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 1991,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '1361:7:9',
                    stateMutability: 'nonpayable',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '1331:44:9'
            },
            returnParameters: {
              id: 1997,
              nodeType: 'ParameterList',
              parameters: [],
              src: '1400:0:9'
            },
            scope: 2108,
            src: '1307:251:9',
            stateMutability: 'nonpayable',
            superFunction: 1875,
            visibility: 'public'
          },
          {
            body: {
              id: 2044,
              nodeType: 'Block',
              src: '1810:92:9',
              statements: [
                {
                  eventCall: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        id: 2033,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2024,
                        src: '1837:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      {
                        argumentTypes: null,
                        id: 2034,
                        name: 'resolver',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2026,
                        src: '1843:8:9',
                        typeDescriptions: {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        },
                        {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      ],
                      id: 2032,
                      name: 'NewResolver',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1860,
                      src: '1825:11:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_event_nonpayable$_t_bytes32_$_t_address_$returns$__$',
                        typeString: 'function (bytes32,address)'
                      }
                    },
                    id: 2035,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '1825:27:9',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 2036,
                  nodeType: 'EmitStatement',
                  src: '1820:32:9'
                },
                {
                  expression: {
                    argumentTypes: null,
                    id: 2042,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        baseExpression: {
                          argumentTypes: null,
                          id: 2037,
                          name: 'records',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1934,
                          src: '1862:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                            typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                          }
                        },
                        id: 2039,
                        indexExpression: {
                          argumentTypes: null,
                          id: 2038,
                          name: 'node',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 2024,
                          src: '1870:4:9',
                          typeDescriptions: {
                            typeIdentifier: 't_bytes32',
                            typeString: 'bytes32'
                          }
                        },
                        isConstant: false,
                        isLValue: true,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: 'IndexAccess',
                        src: '1862:13:9',
                        typeDescriptions: {
                          typeIdentifier: 't_struct$_Record_$1930_storage',
                          typeString: 'struct ENSRegistry.Record storage ref'
                        }
                      },
                      id: 2040,
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: true,
                      memberName: 'resolver',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: 1927,
                      src: '1862:22:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      id: 2041,
                      name: 'resolver',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 2026,
                      src: '1887:8:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    src: '1862:33:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  id: 2043,
                  nodeType: 'ExpressionStatement',
                  src: '1862:33:9'
                }
              ]
            },
            documentation:
              '@dev Sets the resolver address for the specified node.\n@param node The node to update.\n@param resolver The address of the resolver.',
            id: 2045,
            implemented: true,
            kind: 'function',
            modifiers: [
              {
                arguments: [
                  {
                    argumentTypes: null,
                    id: 2029,
                    name: 'node',
                    nodeType: 'Identifier',
                    overloadedDeclarations: [],
                    referencedDeclaration: 2024,
                    src: '1804:4:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  }
                ],
                id: 2030,
                modifierName: {
                  argumentTypes: null,
                  id: 2028,
                  name: 'only_owner',
                  nodeType: 'Identifier',
                  overloadedDeclarations: [],
                  referencedDeclaration: 1951,
                  src: '1793:10:9',
                  typeDescriptions: {
                    typeIdentifier: 't_modifier$_t_bytes32_$',
                    typeString: 'modifier (bytes32)'
                  }
                },
                nodeType: 'ModifierInvocation',
                src: '1793:16:9'
              }
            ],
            name: 'setResolver',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 2027,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2024,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2045,
                  src: '1754:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 2023,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '1754:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                },
                {
                  constant: false,
                  id: 2026,
                  name: 'resolver',
                  nodeType: 'VariableDeclaration',
                  scope: 2045,
                  src: '1768:16:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 2025,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '1768:7:9',
                    stateMutability: 'nonpayable',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '1753:32:9'
            },
            returnParameters: {
              id: 2031,
              nodeType: 'ParameterList',
              parameters: [],
              src: '1810:0:9'
            },
            scope: 2108,
            src: '1733:169:9',
            stateMutability: 'nonpayable',
            superFunction: 1882,
            visibility: 'public'
          },
          {
            body: {
              id: 2067,
              nodeType: 'Block',
              src: '2116:72:9',
              statements: [
                {
                  eventCall: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        id: 2056,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2047,
                        src: '2138:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      {
                        argumentTypes: null,
                        id: 2057,
                        name: 'ttl',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2049,
                        src: '2144:3:9',
                        typeDescriptions: {
                          typeIdentifier: 't_uint64',
                          typeString: 'uint64'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        },
                        {
                          typeIdentifier: 't_uint64',
                          typeString: 'uint64'
                        }
                      ],
                      id: 2055,
                      name: 'NewTTL',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1866,
                      src: '2131:6:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_event_nonpayable$_t_bytes32_$_t_uint64_$returns$__$',
                        typeString: 'function (bytes32,uint64)'
                      }
                    },
                    id: 2058,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '2131:17:9',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 2059,
                  nodeType: 'EmitStatement',
                  src: '2126:22:9'
                },
                {
                  expression: {
                    argumentTypes: null,
                    id: 2065,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        baseExpression: {
                          argumentTypes: null,
                          id: 2060,
                          name: 'records',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1934,
                          src: '2158:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                            typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                          }
                        },
                        id: 2062,
                        indexExpression: {
                          argumentTypes: null,
                          id: 2061,
                          name: 'node',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 2047,
                          src: '2166:4:9',
                          typeDescriptions: {
                            typeIdentifier: 't_bytes32',
                            typeString: 'bytes32'
                          }
                        },
                        isConstant: false,
                        isLValue: true,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: 'IndexAccess',
                        src: '2158:13:9',
                        typeDescriptions: {
                          typeIdentifier: 't_struct$_Record_$1930_storage',
                          typeString: 'struct ENSRegistry.Record storage ref'
                        }
                      },
                      id: 2063,
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: true,
                      memberName: 'ttl',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: 1929,
                      src: '2158:17:9',
                      typeDescriptions: {
                        typeIdentifier: 't_uint64',
                        typeString: 'uint64'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      id: 2064,
                      name: 'ttl',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 2049,
                      src: '2178:3:9',
                      typeDescriptions: {
                        typeIdentifier: 't_uint64',
                        typeString: 'uint64'
                      }
                    },
                    src: '2158:23:9',
                    typeDescriptions: {
                      typeIdentifier: 't_uint64',
                      typeString: 'uint64'
                    }
                  },
                  id: 2066,
                  nodeType: 'ExpressionStatement',
                  src: '2158:23:9'
                }
              ]
            },
            documentation:
              '@dev Sets the TTL for the specified node.\n@param node The node to update.\n@param ttl The TTL in seconds.',
            id: 2068,
            implemented: true,
            kind: 'function',
            modifiers: [
              {
                arguments: [
                  {
                    argumentTypes: null,
                    id: 2052,
                    name: 'node',
                    nodeType: 'Identifier',
                    overloadedDeclarations: [],
                    referencedDeclaration: 2047,
                    src: '2110:4:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  }
                ],
                id: 2053,
                modifierName: {
                  argumentTypes: null,
                  id: 2051,
                  name: 'only_owner',
                  nodeType: 'Identifier',
                  overloadedDeclarations: [],
                  referencedDeclaration: 1951,
                  src: '2099:10:9',
                  typeDescriptions: {
                    typeIdentifier: 't_modifier$_t_bytes32_$',
                    typeString: 'modifier (bytes32)'
                  }
                },
                nodeType: 'ModifierInvocation',
                src: '2099:16:9'
              }
            ],
            name: 'setTTL',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 2050,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2047,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2068,
                  src: '2066:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 2046,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '2066:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                },
                {
                  constant: false,
                  id: 2049,
                  name: 'ttl',
                  nodeType: 'VariableDeclaration',
                  scope: 2068,
                  src: '2080:10:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_uint64',
                    typeString: 'uint64'
                  },
                  typeName: {
                    id: 2048,
                    name: 'uint64',
                    nodeType: 'ElementaryTypeName',
                    src: '2080:6:9',
                    typeDescriptions: {
                      typeIdentifier: 't_uint64',
                      typeString: 'uint64'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2065:26:9'
            },
            returnParameters: {
              id: 2054,
              nodeType: 'ParameterList',
              parameters: [],
              src: '2116:0:9'
            },
            scope: 2108,
            src: '2050:138:9',
            stateMutability: 'nonpayable',
            superFunction: 1896,
            visibility: 'public'
          },
          {
            body: {
              id: 2080,
              nodeType: 'Block',
              src: '2407:43:9',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    expression: {
                      argumentTypes: null,
                      baseExpression: {
                        argumentTypes: null,
                        id: 2075,
                        name: 'records',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1934,
                        src: '2424:7:9',
                        typeDescriptions: {
                          typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                          typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                        }
                      },
                      id: 2077,
                      indexExpression: {
                        argumentTypes: null,
                        id: 2076,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2070,
                        src: '2432:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: false,
                      nodeType: 'IndexAccess',
                      src: '2424:13:9',
                      typeDescriptions: {
                        typeIdentifier: 't_struct$_Record_$1930_storage',
                        typeString: 'struct ENSRegistry.Record storage ref'
                      }
                    },
                    id: 2078,
                    isConstant: false,
                    isLValue: true,
                    isPure: false,
                    lValueRequested: false,
                    memberName: 'owner',
                    nodeType: 'MemberAccess',
                    referencedDeclaration: 1925,
                    src: '2424:19:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  functionReturnParameters: 2074,
                  id: 2079,
                  nodeType: 'Return',
                  src: '2417:26:9'
                }
              ]
            },
            documentation:
              '@dev Returns the address that owns the specified node.\n@param node The specified node.\n@return address of the owner.',
            id: 2081,
            implemented: true,
            kind: 'function',
            modifiers: [],
            name: 'owner',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 2071,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2070,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2081,
                  src: '2363:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 2069,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '2363:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2362:14:9'
            },
            returnParameters: {
              id: 2074,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2073,
                  name: '',
                  nodeType: 'VariableDeclaration',
                  scope: 2081,
                  src: '2398:7:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 2072,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '2398:7:9',
                    stateMutability: 'nonpayable',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2397:9:9'
            },
            scope: 2108,
            src: '2348:102:9',
            stateMutability: 'view',
            superFunction: 1903,
            visibility: 'public'
          },
          {
            body: {
              id: 2093,
              nodeType: 'Block',
              src: '2685:46:9',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    expression: {
                      argumentTypes: null,
                      baseExpression: {
                        argumentTypes: null,
                        id: 2088,
                        name: 'records',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1934,
                        src: '2702:7:9',
                        typeDescriptions: {
                          typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                          typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                        }
                      },
                      id: 2090,
                      indexExpression: {
                        argumentTypes: null,
                        id: 2089,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2083,
                        src: '2710:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: false,
                      nodeType: 'IndexAccess',
                      src: '2702:13:9',
                      typeDescriptions: {
                        typeIdentifier: 't_struct$_Record_$1930_storage',
                        typeString: 'struct ENSRegistry.Record storage ref'
                      }
                    },
                    id: 2091,
                    isConstant: false,
                    isLValue: true,
                    isPure: false,
                    lValueRequested: false,
                    memberName: 'resolver',
                    nodeType: 'MemberAccess',
                    referencedDeclaration: 1927,
                    src: '2702:22:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  functionReturnParameters: 2087,
                  id: 2092,
                  nodeType: 'Return',
                  src: '2695:29:9'
                }
              ]
            },
            documentation:
              '@dev Returns the address of the resolver for the specified node.\n@param node The specified node.\n@return address of the resolver.',
            id: 2094,
            implemented: true,
            kind: 'function',
            modifiers: [],
            name: 'resolver',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 2084,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2083,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2094,
                  src: '2641:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 2082,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '2641:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2640:14:9'
            },
            returnParameters: {
              id: 2087,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2086,
                  name: '',
                  nodeType: 'VariableDeclaration',
                  scope: 2094,
                  src: '2676:7:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 2085,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '2676:7:9',
                    stateMutability: 'nonpayable',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2675:9:9'
            },
            scope: 2108,
            src: '2623:108:9',
            stateMutability: 'view',
            superFunction: 1910,
            visibility: 'public'
          },
          {
            body: {
              id: 2106,
              nodeType: 'Block',
              src: '2955:41:9',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    expression: {
                      argumentTypes: null,
                      baseExpression: {
                        argumentTypes: null,
                        id: 2101,
                        name: 'records',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1934,
                        src: '2972:7:9',
                        typeDescriptions: {
                          typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                          typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                        }
                      },
                      id: 2103,
                      indexExpression: {
                        argumentTypes: null,
                        id: 2102,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2096,
                        src: '2980:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: false,
                      nodeType: 'IndexAccess',
                      src: '2972:13:9',
                      typeDescriptions: {
                        typeIdentifier: 't_struct$_Record_$1930_storage',
                        typeString: 'struct ENSRegistry.Record storage ref'
                      }
                    },
                    id: 2104,
                    isConstant: false,
                    isLValue: true,
                    isPure: false,
                    lValueRequested: false,
                    memberName: 'ttl',
                    nodeType: 'MemberAccess',
                    referencedDeclaration: 1929,
                    src: '2972:17:9',
                    typeDescriptions: {
                      typeIdentifier: 't_uint64',
                      typeString: 'uint64'
                    }
                  },
                  functionReturnParameters: 2100,
                  id: 2105,
                  nodeType: 'Return',
                  src: '2965:24:9'
                }
              ]
            },
            documentation:
              '@dev Returns the TTL of a node, and any records associated with it.\n@param node The specified node.\n@return ttl of the node.',
            id: 2107,
            implemented: true,
            kind: 'function',
            modifiers: [],
            name: 'ttl',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 2097,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2096,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2107,
                  src: '2912:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 2095,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '2912:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2911:14:9'
            },
            returnParameters: {
              id: 2100,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2099,
                  name: '',
                  nodeType: 'VariableDeclaration',
                  scope: 2107,
                  src: '2947:6:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_uint64',
                    typeString: 'uint64'
                  },
                  typeName: {
                    id: 2098,
                    name: 'uint64',
                    nodeType: 'ElementaryTypeName',
                    src: '2947:6:9',
                    typeDescriptions: {
                      typeIdentifier: 't_uint64',
                      typeString: 'uint64'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2946:8:9'
            },
            scope: 2108,
            src: '2899:97:9',
            stateMutability: 'view',
            superFunction: 1917,
            visibility: 'public'
          }
        ],
        scope: 2109,
        src: '84:2915:9'
      }
    ],
    src: '0:3000:9'
  },
  legacyAST: {
    absolutePath: '/home/alexmedkex/komgo-member-blockchain/contracts/lib/ENSRegistry.sol',
    exportedSymbols: {
      ENSRegistry: [2108]
    },
    id: 2109,
    nodeType: 'SourceUnit',
    nodes: [
      {
        id: 1920,
        literals: ['solidity', '^', '0.5', '.0'],
        nodeType: 'PragmaDirective',
        src: '0:23:9'
      },
      {
        absolutePath: '/home/alexmedkex/komgo-member-blockchain/contracts/lib/ENS.sol',
        file: './ENS.sol',
        id: 1921,
        nodeType: 'ImportDirective',
        scope: 2109,
        sourceUnit: 1919,
        src: '25:19:9',
        symbolAliases: [],
        unitAlias: ''
      },
      {
        baseContracts: [
          {
            arguments: null,
            baseName: {
              contractScope: null,
              id: 1922,
              name: 'ENS',
              nodeType: 'UserDefinedTypeName',
              referencedDeclaration: 1918,
              src: '108:3:9',
              typeDescriptions: {
                typeIdentifier: 't_contract$_ENS_$1918',
                typeString: 'contract ENS'
              }
            },
            id: 1923,
            nodeType: 'InheritanceSpecifier',
            src: '108:3:9'
          }
        ],
        contractDependencies: [1918],
        contractKind: 'contract',
        documentation: 'The ENS registry contract.',
        fullyImplemented: true,
        id: 2108,
        linearizedBaseContracts: [2108, 1918],
        name: 'ENSRegistry',
        nodeType: 'ContractDefinition',
        nodes: [
          {
            canonicalName: 'ENSRegistry.Record',
            id: 1930,
            members: [
              {
                constant: false,
                id: 1925,
                name: 'owner',
                nodeType: 'VariableDeclaration',
                scope: 1930,
                src: '142:13:9',
                stateVariable: false,
                storageLocation: 'default',
                typeDescriptions: {
                  typeIdentifier: 't_address',
                  typeString: 'address'
                },
                typeName: {
                  id: 1924,
                  name: 'address',
                  nodeType: 'ElementaryTypeName',
                  src: '142:7:9',
                  stateMutability: 'nonpayable',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  }
                },
                value: null,
                visibility: 'internal'
              },
              {
                constant: false,
                id: 1927,
                name: 'resolver',
                nodeType: 'VariableDeclaration',
                scope: 1930,
                src: '165:16:9',
                stateVariable: false,
                storageLocation: 'default',
                typeDescriptions: {
                  typeIdentifier: 't_address',
                  typeString: 'address'
                },
                typeName: {
                  id: 1926,
                  name: 'address',
                  nodeType: 'ElementaryTypeName',
                  src: '165:7:9',
                  stateMutability: 'nonpayable',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  }
                },
                value: null,
                visibility: 'internal'
              },
              {
                constant: false,
                id: 1929,
                name: 'ttl',
                nodeType: 'VariableDeclaration',
                scope: 1930,
                src: '191:10:9',
                stateVariable: false,
                storageLocation: 'default',
                typeDescriptions: {
                  typeIdentifier: 't_uint64',
                  typeString: 'uint64'
                },
                typeName: {
                  id: 1928,
                  name: 'uint64',
                  nodeType: 'ElementaryTypeName',
                  src: '191:6:9',
                  typeDescriptions: {
                    typeIdentifier: 't_uint64',
                    typeString: 'uint64'
                  }
                },
                value: null,
                visibility: 'internal'
              }
            ],
            name: 'Record',
            nodeType: 'StructDefinition',
            scope: 2108,
            src: '118:90:9',
            visibility: 'public'
          },
          {
            constant: false,
            id: 1934,
            name: 'records',
            nodeType: 'VariableDeclaration',
            scope: 2108,
            src: '214:35:9',
            stateVariable: true,
            storageLocation: 'default',
            typeDescriptions: {
              typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
              typeString: 'mapping(bytes32 => struct ENSRegistry.Record)'
            },
            typeName: {
              id: 1933,
              keyType: {
                id: 1931,
                name: 'bytes32',
                nodeType: 'ElementaryTypeName',
                src: '223:7:9',
                typeDescriptions: {
                  typeIdentifier: 't_bytes32',
                  typeString: 'bytes32'
                }
              },
              nodeType: 'Mapping',
              src: '214:27:9',
              typeDescriptions: {
                typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                typeString: 'mapping(bytes32 => struct ENSRegistry.Record)'
              },
              valueType: {
                contractScope: null,
                id: 1932,
                name: 'Record',
                nodeType: 'UserDefinedTypeName',
                referencedDeclaration: 1930,
                src: '234:6:9',
                typeDescriptions: {
                  typeIdentifier: 't_struct$_Record_$1930_storage_ptr',
                  typeString: 'struct ENSRegistry.Record'
                }
              }
            },
            value: null,
            visibility: 'internal'
          },
          {
            body: {
              id: 1950,
              nodeType: 'Block',
              src: '360:110:9',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        commonType: {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        },
                        id: 1945,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        leftExpression: {
                          argumentTypes: null,
                          expression: {
                            argumentTypes: null,
                            baseExpression: {
                              argumentTypes: null,
                              id: 1939,
                              name: 'records',
                              nodeType: 'Identifier',
                              overloadedDeclarations: [],
                              referencedDeclaration: 1934,
                              src: '378:7:9',
                              typeDescriptions: {
                                typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                                typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                              }
                            },
                            id: 1941,
                            indexExpression: {
                              argumentTypes: null,
                              id: 1940,
                              name: 'node',
                              nodeType: 'Identifier',
                              overloadedDeclarations: [],
                              referencedDeclaration: 1936,
                              src: '386:4:9',
                              typeDescriptions: {
                                typeIdentifier: 't_bytes32',
                                typeString: 'bytes32'
                              }
                            },
                            isConstant: false,
                            isLValue: true,
                            isPure: false,
                            lValueRequested: false,
                            nodeType: 'IndexAccess',
                            src: '378:13:9',
                            typeDescriptions: {
                              typeIdentifier: 't_struct$_Record_$1930_storage',
                              typeString: 'struct ENSRegistry.Record storage ref'
                            }
                          },
                          id: 1942,
                          isConstant: false,
                          isLValue: true,
                          isPure: false,
                          lValueRequested: false,
                          memberName: 'owner',
                          nodeType: 'MemberAccess',
                          referencedDeclaration: 1925,
                          src: '378:19:9',
                          typeDescriptions: {
                            typeIdentifier: 't_address',
                            typeString: 'address'
                          }
                        },
                        nodeType: 'BinaryOperation',
                        operator: '==',
                        rightExpression: {
                          argumentTypes: null,
                          expression: {
                            argumentTypes: null,
                            id: 1943,
                            name: 'msg',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 2700,
                            src: '401:3:9',
                            typeDescriptions: {
                              typeIdentifier: 't_magic_message',
                              typeString: 'msg'
                            }
                          },
                          id: 1944,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          lValueRequested: false,
                          memberName: 'sender',
                          nodeType: 'MemberAccess',
                          referencedDeclaration: null,
                          src: '401:10:9',
                          typeDescriptions: {
                            typeIdentifier: 't_address_payable',
                            typeString: 'address payable'
                          }
                        },
                        src: '378:33:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bool',
                          typeString: 'bool'
                        }
                      },
                      {
                        argumentTypes: null,
                        hexValue: '4f6e6c79206f776e657220616c6c6f77656420746f2063616c6c2066756e6374696f6e2e',
                        id: 1946,
                        isConstant: false,
                        isLValue: false,
                        isPure: true,
                        kind: 'string',
                        lValueRequested: false,
                        nodeType: 'Literal',
                        src: '413:38:9',
                        subdenomination: null,
                        typeDescriptions: {
                          typeIdentifier:
                            't_stringliteral_7564981d91702f2b55ae12026036be8620127651d3c1ceaff33efe75dd238408',
                          typeString: 'literal_string "Only owner allowed to call function."'
                        },
                        value: 'Only owner allowed to call function.'
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bool',
                          typeString: 'bool'
                        },
                        {
                          typeIdentifier:
                            't_stringliteral_7564981d91702f2b55ae12026036be8620127651d3c1ceaff33efe75dd238408',
                          typeString: 'literal_string "Only owner allowed to call function."'
                        }
                      ],
                      id: 1938,
                      name: 'require',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [2703, 2704],
                      referencedDeclaration: 2704,
                      src: '370:7:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$',
                        typeString: 'function (bool,string memory) pure'
                      }
                    },
                    id: 1947,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '370:82:9',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 1948,
                  nodeType: 'ExpressionStatement',
                  src: '370:82:9'
                },
                {
                  id: 1949,
                  nodeType: 'PlaceholderStatement',
                  src: '462:1:9'
                }
              ]
            },
            documentation: null,
            id: 1951,
            name: 'only_owner',
            nodeType: 'ModifierDefinition',
            parameters: {
              id: 1937,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 1936,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 1951,
                  src: '346:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 1935,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '346:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '345:14:9'
            },
            src: '326:144:9',
            visibility: 'internal'
          },
          {
            body: {
              id: 1962,
              nodeType: 'Block',
              src: '557:48:9',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    id: 1960,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        baseExpression: {
                          argumentTypes: null,
                          id: 1954,
                          name: 'records',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1934,
                          src: '567:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                            typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                          }
                        },
                        id: 1956,
                        indexExpression: {
                          argumentTypes: null,
                          hexValue: '307830',
                          id: 1955,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          kind: 'number',
                          lValueRequested: false,
                          nodeType: 'Literal',
                          src: '575:3:9',
                          subdenomination: null,
                          typeDescriptions: {
                            typeIdentifier: 't_rational_0_by_1',
                            typeString: 'int_const 0'
                          },
                          value: '0x0'
                        },
                        isConstant: false,
                        isLValue: true,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: 'IndexAccess',
                        src: '567:12:9',
                        typeDescriptions: {
                          typeIdentifier: 't_struct$_Record_$1930_storage',
                          typeString: 'struct ENSRegistry.Record storage ref'
                        }
                      },
                      id: 1957,
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: true,
                      memberName: 'owner',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: 1925,
                      src: '567:18:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        id: 1958,
                        name: 'msg',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2700,
                        src: '588:3:9',
                        typeDescriptions: {
                          typeIdentifier: 't_magic_message',
                          typeString: 'msg'
                        }
                      },
                      id: 1959,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      memberName: 'sender',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: null,
                      src: '588:10:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address_payable',
                        typeString: 'address payable'
                      }
                    },
                    src: '567:31:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  id: 1961,
                  nodeType: 'ExpressionStatement',
                  src: '567:31:9'
                }
              ]
            },
            documentation: '@dev Constructs a new ENS registrar.',
            id: 1963,
            implemented: true,
            kind: 'constructor',
            modifiers: [],
            name: '',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 1952,
              nodeType: 'ParameterList',
              parameters: [],
              src: '547:2:9'
            },
            returnParameters: {
              id: 1953,
              nodeType: 'ParameterList',
              parameters: [],
              src: '557:0:9'
            },
            scope: 2108,
            src: '536:69:9',
            stateMutability: 'nonpayable',
            superFunction: null,
            visibility: 'public'
          },
          {
            body: {
              id: 1985,
              nodeType: 'Block',
              src: '915:80:9',
              statements: [
                {
                  eventCall: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        id: 1974,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1965,
                        src: '939:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      {
                        argumentTypes: null,
                        id: 1975,
                        name: 'owner',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1967,
                        src: '945:5:9',
                        typeDescriptions: {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        },
                        {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      ],
                      id: 1973,
                      name: 'Transfer',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1854,
                      src: '930:8:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_event_nonpayable$_t_bytes32_$_t_address_$returns$__$',
                        typeString: 'function (bytes32,address)'
                      }
                    },
                    id: 1976,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '930:21:9',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 1977,
                  nodeType: 'EmitStatement',
                  src: '925:26:9'
                },
                {
                  expression: {
                    argumentTypes: null,
                    id: 1983,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        baseExpression: {
                          argumentTypes: null,
                          id: 1978,
                          name: 'records',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1934,
                          src: '961:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                            typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                          }
                        },
                        id: 1980,
                        indexExpression: {
                          argumentTypes: null,
                          id: 1979,
                          name: 'node',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1965,
                          src: '969:4:9',
                          typeDescriptions: {
                            typeIdentifier: 't_bytes32',
                            typeString: 'bytes32'
                          }
                        },
                        isConstant: false,
                        isLValue: true,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: 'IndexAccess',
                        src: '961:13:9',
                        typeDescriptions: {
                          typeIdentifier: 't_struct$_Record_$1930_storage',
                          typeString: 'struct ENSRegistry.Record storage ref'
                        }
                      },
                      id: 1981,
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: true,
                      memberName: 'owner',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: 1925,
                      src: '961:19:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      id: 1982,
                      name: 'owner',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1967,
                      src: '983:5:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    src: '961:27:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  id: 1984,
                  nodeType: 'ExpressionStatement',
                  src: '961:27:9'
                }
              ]
            },
            documentation:
              '@dev Transfers ownership of a node to a new address. May only be called by the current owner of the node.\n@param node The node to transfer ownership of.\n@param owner The address of the new owner.',
            id: 1986,
            implemented: true,
            kind: 'function',
            modifiers: [
              {
                arguments: [
                  {
                    argumentTypes: null,
                    id: 1970,
                    name: 'node',
                    nodeType: 'Identifier',
                    overloadedDeclarations: [],
                    referencedDeclaration: 1965,
                    src: '909:4:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  }
                ],
                id: 1971,
                modifierName: {
                  argumentTypes: null,
                  id: 1969,
                  name: 'only_owner',
                  nodeType: 'Identifier',
                  overloadedDeclarations: [],
                  referencedDeclaration: 1951,
                  src: '898:10:9',
                  typeDescriptions: {
                    typeIdentifier: 't_modifier$_t_bytes32_$',
                    typeString: 'modifier (bytes32)'
                  }
                },
                nodeType: 'ModifierInvocation',
                src: '898:16:9'
              }
            ],
            name: 'setOwner',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 1968,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 1965,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 1986,
                  src: '862:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 1964,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '862:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                },
                {
                  constant: false,
                  id: 1967,
                  name: 'owner',
                  nodeType: 'VariableDeclaration',
                  scope: 1986,
                  src: '876:13:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 1966,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '876:7:9',
                    stateMutability: 'nonpayable',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '861:29:9'
            },
            returnParameters: {
              id: 1972,
              nodeType: 'ParameterList',
              parameters: [],
              src: '915:0:9'
            },
            scope: 2108,
            src: '844:151:9',
            stateMutability: 'nonpayable',
            superFunction: 1889,
            visibility: 'public'
          },
          {
            body: {
              id: 2021,
              nodeType: 'Block',
              src: '1400:158:9',
              statements: [
                {
                  assignments: [1999],
                  declarations: [
                    {
                      constant: false,
                      id: 1999,
                      name: 'subnode',
                      nodeType: 'VariableDeclaration',
                      scope: 2021,
                      src: '1410:15:9',
                      stateVariable: false,
                      storageLocation: 'default',
                      typeDescriptions: {
                        typeIdentifier: 't_bytes32',
                        typeString: 'bytes32'
                      },
                      typeName: {
                        id: 1998,
                        name: 'bytes32',
                        nodeType: 'ElementaryTypeName',
                        src: '1410:7:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      value: null,
                      visibility: 'internal'
                    }
                  ],
                  id: 2007,
                  initialValue: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        arguments: [
                          {
                            argumentTypes: null,
                            id: 2003,
                            name: 'node',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 1988,
                            src: '1455:4:9',
                            typeDescriptions: {
                              typeIdentifier: 't_bytes32',
                              typeString: 'bytes32'
                            }
                          },
                          {
                            argumentTypes: null,
                            id: 2004,
                            name: 'label',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 1990,
                            src: '1461:5:9',
                            typeDescriptions: {
                              typeIdentifier: 't_bytes32',
                              typeString: 'bytes32'
                            }
                          }
                        ],
                        expression: {
                          argumentTypes: [
                            {
                              typeIdentifier: 't_bytes32',
                              typeString: 'bytes32'
                            },
                            {
                              typeIdentifier: 't_bytes32',
                              typeString: 'bytes32'
                            }
                          ],
                          expression: {
                            argumentTypes: null,
                            id: 2001,
                            name: 'abi',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 2687,
                            src: '1438:3:9',
                            typeDescriptions: {
                              typeIdentifier: 't_magic_abi',
                              typeString: 'abi'
                            }
                          },
                          id: 2002,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          lValueRequested: false,
                          memberName: 'encodePacked',
                          nodeType: 'MemberAccess',
                          referencedDeclaration: null,
                          src: '1438:16:9',
                          typeDescriptions: {
                            typeIdentifier: 't_function_abiencodepacked_pure$__$returns$_t_bytes_memory_ptr_$',
                            typeString: 'function () pure returns (bytes memory)'
                          }
                        },
                        id: 2005,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        kind: 'functionCall',
                        lValueRequested: false,
                        names: [],
                        nodeType: 'FunctionCall',
                        src: '1438:29:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes_memory_ptr',
                          typeString: 'bytes memory'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bytes_memory_ptr',
                          typeString: 'bytes memory'
                        }
                      ],
                      id: 2000,
                      name: 'keccak256',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 2694,
                      src: '1428:9:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_keccak256_pure$_t_bytes_memory_ptr_$returns$_t_bytes32_$',
                        typeString: 'function (bytes memory) pure returns (bytes32)'
                      }
                    },
                    id: 2006,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '1428:40:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  nodeType: 'VariableDeclarationStatement',
                  src: '1410:58:9'
                },
                {
                  eventCall: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        id: 2009,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1988,
                        src: '1492:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      {
                        argumentTypes: null,
                        id: 2010,
                        name: 'label',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1990,
                        src: '1498:5:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      {
                        argumentTypes: null,
                        id: 2011,
                        name: 'owner',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1992,
                        src: '1505:5:9',
                        typeDescriptions: {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        },
                        {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        },
                        {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      ],
                      id: 2008,
                      name: 'NewOwner',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1848,
                      src: '1483:8:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_event_nonpayable$_t_bytes32_$_t_bytes32_$_t_address_$returns$__$',
                        typeString: 'function (bytes32,bytes32,address)'
                      }
                    },
                    id: 2012,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '1483:28:9',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 2013,
                  nodeType: 'EmitStatement',
                  src: '1478:33:9'
                },
                {
                  expression: {
                    argumentTypes: null,
                    id: 2019,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        baseExpression: {
                          argumentTypes: null,
                          id: 2014,
                          name: 'records',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1934,
                          src: '1521:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                            typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                          }
                        },
                        id: 2016,
                        indexExpression: {
                          argumentTypes: null,
                          id: 2015,
                          name: 'subnode',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1999,
                          src: '1529:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_bytes32',
                            typeString: 'bytes32'
                          }
                        },
                        isConstant: false,
                        isLValue: true,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: 'IndexAccess',
                        src: '1521:16:9',
                        typeDescriptions: {
                          typeIdentifier: 't_struct$_Record_$1930_storage',
                          typeString: 'struct ENSRegistry.Record storage ref'
                        }
                      },
                      id: 2017,
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: true,
                      memberName: 'owner',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: 1925,
                      src: '1521:22:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      id: 2018,
                      name: 'owner',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1992,
                      src: '1546:5:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    src: '1521:30:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  id: 2020,
                  nodeType: 'ExpressionStatement',
                  src: '1521:30:9'
                }
              ]
            },
            documentation:
              '@dev Transfers ownership of a subnode keccak256(node, label) to a new address. May only be called by the owner of the parent node.\n@param node The parent node.\n@param label The hash of the label specifying the subnode.\n@param owner The address of the new owner.',
            id: 2022,
            implemented: true,
            kind: 'function',
            modifiers: [
              {
                arguments: [
                  {
                    argumentTypes: null,
                    id: 1995,
                    name: 'node',
                    nodeType: 'Identifier',
                    overloadedDeclarations: [],
                    referencedDeclaration: 1988,
                    src: '1394:4:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  }
                ],
                id: 1996,
                modifierName: {
                  argumentTypes: null,
                  id: 1994,
                  name: 'only_owner',
                  nodeType: 'Identifier',
                  overloadedDeclarations: [],
                  referencedDeclaration: 1951,
                  src: '1383:10:9',
                  typeDescriptions: {
                    typeIdentifier: 't_modifier$_t_bytes32_$',
                    typeString: 'modifier (bytes32)'
                  }
                },
                nodeType: 'ModifierInvocation',
                src: '1383:16:9'
              }
            ],
            name: 'setSubnodeOwner',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 1993,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 1988,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2022,
                  src: '1332:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 1987,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '1332:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                },
                {
                  constant: false,
                  id: 1990,
                  name: 'label',
                  nodeType: 'VariableDeclaration',
                  scope: 2022,
                  src: '1346:13:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 1989,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '1346:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                },
                {
                  constant: false,
                  id: 1992,
                  name: 'owner',
                  nodeType: 'VariableDeclaration',
                  scope: 2022,
                  src: '1361:13:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 1991,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '1361:7:9',
                    stateMutability: 'nonpayable',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '1331:44:9'
            },
            returnParameters: {
              id: 1997,
              nodeType: 'ParameterList',
              parameters: [],
              src: '1400:0:9'
            },
            scope: 2108,
            src: '1307:251:9',
            stateMutability: 'nonpayable',
            superFunction: 1875,
            visibility: 'public'
          },
          {
            body: {
              id: 2044,
              nodeType: 'Block',
              src: '1810:92:9',
              statements: [
                {
                  eventCall: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        id: 2033,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2024,
                        src: '1837:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      {
                        argumentTypes: null,
                        id: 2034,
                        name: 'resolver',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2026,
                        src: '1843:8:9',
                        typeDescriptions: {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        },
                        {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      ],
                      id: 2032,
                      name: 'NewResolver',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1860,
                      src: '1825:11:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_event_nonpayable$_t_bytes32_$_t_address_$returns$__$',
                        typeString: 'function (bytes32,address)'
                      }
                    },
                    id: 2035,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '1825:27:9',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 2036,
                  nodeType: 'EmitStatement',
                  src: '1820:32:9'
                },
                {
                  expression: {
                    argumentTypes: null,
                    id: 2042,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        baseExpression: {
                          argumentTypes: null,
                          id: 2037,
                          name: 'records',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1934,
                          src: '1862:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                            typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                          }
                        },
                        id: 2039,
                        indexExpression: {
                          argumentTypes: null,
                          id: 2038,
                          name: 'node',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 2024,
                          src: '1870:4:9',
                          typeDescriptions: {
                            typeIdentifier: 't_bytes32',
                            typeString: 'bytes32'
                          }
                        },
                        isConstant: false,
                        isLValue: true,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: 'IndexAccess',
                        src: '1862:13:9',
                        typeDescriptions: {
                          typeIdentifier: 't_struct$_Record_$1930_storage',
                          typeString: 'struct ENSRegistry.Record storage ref'
                        }
                      },
                      id: 2040,
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: true,
                      memberName: 'resolver',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: 1927,
                      src: '1862:22:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      id: 2041,
                      name: 'resolver',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 2026,
                      src: '1887:8:9',
                      typeDescriptions: {
                        typeIdentifier: 't_address',
                        typeString: 'address'
                      }
                    },
                    src: '1862:33:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  id: 2043,
                  nodeType: 'ExpressionStatement',
                  src: '1862:33:9'
                }
              ]
            },
            documentation:
              '@dev Sets the resolver address for the specified node.\n@param node The node to update.\n@param resolver The address of the resolver.',
            id: 2045,
            implemented: true,
            kind: 'function',
            modifiers: [
              {
                arguments: [
                  {
                    argumentTypes: null,
                    id: 2029,
                    name: 'node',
                    nodeType: 'Identifier',
                    overloadedDeclarations: [],
                    referencedDeclaration: 2024,
                    src: '1804:4:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  }
                ],
                id: 2030,
                modifierName: {
                  argumentTypes: null,
                  id: 2028,
                  name: 'only_owner',
                  nodeType: 'Identifier',
                  overloadedDeclarations: [],
                  referencedDeclaration: 1951,
                  src: '1793:10:9',
                  typeDescriptions: {
                    typeIdentifier: 't_modifier$_t_bytes32_$',
                    typeString: 'modifier (bytes32)'
                  }
                },
                nodeType: 'ModifierInvocation',
                src: '1793:16:9'
              }
            ],
            name: 'setResolver',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 2027,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2024,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2045,
                  src: '1754:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 2023,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '1754:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                },
                {
                  constant: false,
                  id: 2026,
                  name: 'resolver',
                  nodeType: 'VariableDeclaration',
                  scope: 2045,
                  src: '1768:16:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 2025,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '1768:7:9',
                    stateMutability: 'nonpayable',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '1753:32:9'
            },
            returnParameters: {
              id: 2031,
              nodeType: 'ParameterList',
              parameters: [],
              src: '1810:0:9'
            },
            scope: 2108,
            src: '1733:169:9',
            stateMutability: 'nonpayable',
            superFunction: 1882,
            visibility: 'public'
          },
          {
            body: {
              id: 2067,
              nodeType: 'Block',
              src: '2116:72:9',
              statements: [
                {
                  eventCall: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        id: 2056,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2047,
                        src: '2138:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      {
                        argumentTypes: null,
                        id: 2057,
                        name: 'ttl',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2049,
                        src: '2144:3:9',
                        typeDescriptions: {
                          typeIdentifier: 't_uint64',
                          typeString: 'uint64'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        },
                        {
                          typeIdentifier: 't_uint64',
                          typeString: 'uint64'
                        }
                      ],
                      id: 2055,
                      name: 'NewTTL',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 1866,
                      src: '2131:6:9',
                      typeDescriptions: {
                        typeIdentifier: 't_function_event_nonpayable$_t_bytes32_$_t_uint64_$returns$__$',
                        typeString: 'function (bytes32,uint64)'
                      }
                    },
                    id: 2058,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '2131:17:9',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 2059,
                  nodeType: 'EmitStatement',
                  src: '2126:22:9'
                },
                {
                  expression: {
                    argumentTypes: null,
                    id: 2065,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      expression: {
                        argumentTypes: null,
                        baseExpression: {
                          argumentTypes: null,
                          id: 2060,
                          name: 'records',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 1934,
                          src: '2158:7:9',
                          typeDescriptions: {
                            typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                            typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                          }
                        },
                        id: 2062,
                        indexExpression: {
                          argumentTypes: null,
                          id: 2061,
                          name: 'node',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 2047,
                          src: '2166:4:9',
                          typeDescriptions: {
                            typeIdentifier: 't_bytes32',
                            typeString: 'bytes32'
                          }
                        },
                        isConstant: false,
                        isLValue: true,
                        isPure: false,
                        lValueRequested: false,
                        nodeType: 'IndexAccess',
                        src: '2158:13:9',
                        typeDescriptions: {
                          typeIdentifier: 't_struct$_Record_$1930_storage',
                          typeString: 'struct ENSRegistry.Record storage ref'
                        }
                      },
                      id: 2063,
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: true,
                      memberName: 'ttl',
                      nodeType: 'MemberAccess',
                      referencedDeclaration: 1929,
                      src: '2158:17:9',
                      typeDescriptions: {
                        typeIdentifier: 't_uint64',
                        typeString: 'uint64'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      id: 2064,
                      name: 'ttl',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 2049,
                      src: '2178:3:9',
                      typeDescriptions: {
                        typeIdentifier: 't_uint64',
                        typeString: 'uint64'
                      }
                    },
                    src: '2158:23:9',
                    typeDescriptions: {
                      typeIdentifier: 't_uint64',
                      typeString: 'uint64'
                    }
                  },
                  id: 2066,
                  nodeType: 'ExpressionStatement',
                  src: '2158:23:9'
                }
              ]
            },
            documentation:
              '@dev Sets the TTL for the specified node.\n@param node The node to update.\n@param ttl The TTL in seconds.',
            id: 2068,
            implemented: true,
            kind: 'function',
            modifiers: [
              {
                arguments: [
                  {
                    argumentTypes: null,
                    id: 2052,
                    name: 'node',
                    nodeType: 'Identifier',
                    overloadedDeclarations: [],
                    referencedDeclaration: 2047,
                    src: '2110:4:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  }
                ],
                id: 2053,
                modifierName: {
                  argumentTypes: null,
                  id: 2051,
                  name: 'only_owner',
                  nodeType: 'Identifier',
                  overloadedDeclarations: [],
                  referencedDeclaration: 1951,
                  src: '2099:10:9',
                  typeDescriptions: {
                    typeIdentifier: 't_modifier$_t_bytes32_$',
                    typeString: 'modifier (bytes32)'
                  }
                },
                nodeType: 'ModifierInvocation',
                src: '2099:16:9'
              }
            ],
            name: 'setTTL',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 2050,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2047,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2068,
                  src: '2066:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 2046,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '2066:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                },
                {
                  constant: false,
                  id: 2049,
                  name: 'ttl',
                  nodeType: 'VariableDeclaration',
                  scope: 2068,
                  src: '2080:10:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_uint64',
                    typeString: 'uint64'
                  },
                  typeName: {
                    id: 2048,
                    name: 'uint64',
                    nodeType: 'ElementaryTypeName',
                    src: '2080:6:9',
                    typeDescriptions: {
                      typeIdentifier: 't_uint64',
                      typeString: 'uint64'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2065:26:9'
            },
            returnParameters: {
              id: 2054,
              nodeType: 'ParameterList',
              parameters: [],
              src: '2116:0:9'
            },
            scope: 2108,
            src: '2050:138:9',
            stateMutability: 'nonpayable',
            superFunction: 1896,
            visibility: 'public'
          },
          {
            body: {
              id: 2080,
              nodeType: 'Block',
              src: '2407:43:9',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    expression: {
                      argumentTypes: null,
                      baseExpression: {
                        argumentTypes: null,
                        id: 2075,
                        name: 'records',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1934,
                        src: '2424:7:9',
                        typeDescriptions: {
                          typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                          typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                        }
                      },
                      id: 2077,
                      indexExpression: {
                        argumentTypes: null,
                        id: 2076,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2070,
                        src: '2432:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: false,
                      nodeType: 'IndexAccess',
                      src: '2424:13:9',
                      typeDescriptions: {
                        typeIdentifier: 't_struct$_Record_$1930_storage',
                        typeString: 'struct ENSRegistry.Record storage ref'
                      }
                    },
                    id: 2078,
                    isConstant: false,
                    isLValue: true,
                    isPure: false,
                    lValueRequested: false,
                    memberName: 'owner',
                    nodeType: 'MemberAccess',
                    referencedDeclaration: 1925,
                    src: '2424:19:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  functionReturnParameters: 2074,
                  id: 2079,
                  nodeType: 'Return',
                  src: '2417:26:9'
                }
              ]
            },
            documentation:
              '@dev Returns the address that owns the specified node.\n@param node The specified node.\n@return address of the owner.',
            id: 2081,
            implemented: true,
            kind: 'function',
            modifiers: [],
            name: 'owner',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 2071,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2070,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2081,
                  src: '2363:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 2069,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '2363:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2362:14:9'
            },
            returnParameters: {
              id: 2074,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2073,
                  name: '',
                  nodeType: 'VariableDeclaration',
                  scope: 2081,
                  src: '2398:7:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 2072,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '2398:7:9',
                    stateMutability: 'nonpayable',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2397:9:9'
            },
            scope: 2108,
            src: '2348:102:9',
            stateMutability: 'view',
            superFunction: 1903,
            visibility: 'public'
          },
          {
            body: {
              id: 2093,
              nodeType: 'Block',
              src: '2685:46:9',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    expression: {
                      argumentTypes: null,
                      baseExpression: {
                        argumentTypes: null,
                        id: 2088,
                        name: 'records',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1934,
                        src: '2702:7:9',
                        typeDescriptions: {
                          typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                          typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                        }
                      },
                      id: 2090,
                      indexExpression: {
                        argumentTypes: null,
                        id: 2089,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2083,
                        src: '2710:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: false,
                      nodeType: 'IndexAccess',
                      src: '2702:13:9',
                      typeDescriptions: {
                        typeIdentifier: 't_struct$_Record_$1930_storage',
                        typeString: 'struct ENSRegistry.Record storage ref'
                      }
                    },
                    id: 2091,
                    isConstant: false,
                    isLValue: true,
                    isPure: false,
                    lValueRequested: false,
                    memberName: 'resolver',
                    nodeType: 'MemberAccess',
                    referencedDeclaration: 1927,
                    src: '2702:22:9',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  functionReturnParameters: 2087,
                  id: 2092,
                  nodeType: 'Return',
                  src: '2695:29:9'
                }
              ]
            },
            documentation:
              '@dev Returns the address of the resolver for the specified node.\n@param node The specified node.\n@return address of the resolver.',
            id: 2094,
            implemented: true,
            kind: 'function',
            modifiers: [],
            name: 'resolver',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 2084,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2083,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2094,
                  src: '2641:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 2082,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '2641:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2640:14:9'
            },
            returnParameters: {
              id: 2087,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2086,
                  name: '',
                  nodeType: 'VariableDeclaration',
                  scope: 2094,
                  src: '2676:7:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 2085,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '2676:7:9',
                    stateMutability: 'nonpayable',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2675:9:9'
            },
            scope: 2108,
            src: '2623:108:9',
            stateMutability: 'view',
            superFunction: 1910,
            visibility: 'public'
          },
          {
            body: {
              id: 2106,
              nodeType: 'Block',
              src: '2955:41:9',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    expression: {
                      argumentTypes: null,
                      baseExpression: {
                        argumentTypes: null,
                        id: 2101,
                        name: 'records',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 1934,
                        src: '2972:7:9',
                        typeDescriptions: {
                          typeIdentifier: 't_mapping$_t_bytes32_$_t_struct$_Record_$1930_storage_$',
                          typeString: 'mapping(bytes32 => struct ENSRegistry.Record storage ref)'
                        }
                      },
                      id: 2103,
                      indexExpression: {
                        argumentTypes: null,
                        id: 2102,
                        name: 'node',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 2096,
                        src: '2980:4:9',
                        typeDescriptions: {
                          typeIdentifier: 't_bytes32',
                          typeString: 'bytes32'
                        }
                      },
                      isConstant: false,
                      isLValue: true,
                      isPure: false,
                      lValueRequested: false,
                      nodeType: 'IndexAccess',
                      src: '2972:13:9',
                      typeDescriptions: {
                        typeIdentifier: 't_struct$_Record_$1930_storage',
                        typeString: 'struct ENSRegistry.Record storage ref'
                      }
                    },
                    id: 2104,
                    isConstant: false,
                    isLValue: true,
                    isPure: false,
                    lValueRequested: false,
                    memberName: 'ttl',
                    nodeType: 'MemberAccess',
                    referencedDeclaration: 1929,
                    src: '2972:17:9',
                    typeDescriptions: {
                      typeIdentifier: 't_uint64',
                      typeString: 'uint64'
                    }
                  },
                  functionReturnParameters: 2100,
                  id: 2105,
                  nodeType: 'Return',
                  src: '2965:24:9'
                }
              ]
            },
            documentation:
              '@dev Returns the TTL of a node, and any records associated with it.\n@param node The specified node.\n@return ttl of the node.',
            id: 2107,
            implemented: true,
            kind: 'function',
            modifiers: [],
            name: 'ttl',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 2097,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2096,
                  name: 'node',
                  nodeType: 'VariableDeclaration',
                  scope: 2107,
                  src: '2912:12:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_bytes32',
                    typeString: 'bytes32'
                  },
                  typeName: {
                    id: 2095,
                    name: 'bytes32',
                    nodeType: 'ElementaryTypeName',
                    src: '2912:7:9',
                    typeDescriptions: {
                      typeIdentifier: 't_bytes32',
                      typeString: 'bytes32'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2911:14:9'
            },
            returnParameters: {
              id: 2100,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 2099,
                  name: '',
                  nodeType: 'VariableDeclaration',
                  scope: 2107,
                  src: '2947:6:9',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_uint64',
                    typeString: 'uint64'
                  },
                  typeName: {
                    id: 2098,
                    name: 'uint64',
                    nodeType: 'ElementaryTypeName',
                    src: '2947:6:9',
                    typeDescriptions: {
                      typeIdentifier: 't_uint64',
                      typeString: 'uint64'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '2946:8:9'
            },
            scope: 2108,
            src: '2899:97:9',
            stateMutability: 'view',
            superFunction: 1917,
            visibility: 'public'
          }
        ],
        scope: 2109,
        src: '84:2915:9'
      }
    ],
    src: '0:3000:9'
  },
  compiler: {
    name: 'solc',
    version: '0.5.0+commit.1d4f565a.Emscripten.clang'
  },
  networks: {},
  schemaVersion: '3.0.0',
  updatedAt: '2019-02-27T16:54:08.567Z',
  devdoc: {
    methods: {
      constructor: {
        details: 'Constructs a new ENS registrar.'
      },
      'owner(bytes32)': {
        details: 'Returns the address that owns the specified node.',
        params: {
          node: 'The specified node.'
        },
        return: 'address of the owner.'
      },
      'resolver(bytes32)': {
        details: 'Returns the address of the resolver for the specified node.',
        params: {
          node: 'The specified node.'
        },
        return: 'address of the resolver.'
      },
      'setOwner(bytes32,address)': {
        details: 'Transfers ownership of a node to a new address. May only be called by the current owner of the node.',
        params: {
          node: 'The node to transfer ownership of.',
          owner: 'The address of the new owner.'
        }
      },
      'setResolver(bytes32,address)': {
        details: 'Sets the resolver address for the specified node.',
        params: {
          node: 'The node to update.',
          resolver: 'The address of the resolver.'
        }
      },
      'setSubnodeOwner(bytes32,bytes32,address)': {
        details:
          'Transfers ownership of a subnode keccak256(node, label) to a new address. May only be called by the owner of the parent node.',
        params: {
          label: 'The hash of the label specifying the subnode.',
          node: 'The parent node.',
          owner: 'The address of the new owner.'
        }
      },
      'setTTL(bytes32,uint64)': {
        details: 'Sets the TTL for the specified node.',
        params: {
          node: 'The node to update.',
          ttl: 'The TTL in seconds.'
        }
      },
      'ttl(bytes32)': {
        details: 'Returns the TTL of a node, and any records associated with it.',
        params: {
          node: 'The specified node.'
        },
        return: 'ttl of the node.'
      }
    }
  },
  userdoc: {
    methods: {},
    notice: 'The ENS registry contract.'
  }
}
export { contractData as ensRegistryData }
