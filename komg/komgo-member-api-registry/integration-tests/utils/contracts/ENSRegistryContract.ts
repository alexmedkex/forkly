const contractData = {
    "contractName": "ENSRegistry",
    "abi": [
      {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "label",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "NewOwner",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "resolver",
            "type": "address"
          }
        ],
        "name": "NewResolver",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "node",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "name": "ttl",
            "type": "uint64"
          }
        ],
        "name": "NewTTL",
        "type": "event"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          },
          {
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "setOwner",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          },
          {
            "name": "label",
            "type": "bytes32"
          },
          {
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "setSubnodeOwner",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          },
          {
            "name": "resolver",
            "type": "address"
          }
        ],
        "name": "setResolver",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          },
          {
            "name": "ttl",
            "type": "uint64"
          }
        ],
        "name": "setTTL",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          }
        ],
        "name": "owner",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          }
        ],
        "name": "resolver",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "node",
            "type": "bytes32"
          }
        ],
        "name": "ttl",
        "outputs": [
          {
            "name": "",
            "type": "uint64"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ],
    "bytecode": "0x608060405234801561001057600080fd5b5060008080526020527fad3228b676f7d3cd4284a5443f17f1962b36e491b30a40b2405849e597ba5fb58054600160a060020a03191633179055610515806100596000396000f3006080604052600436106100825763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416630178b8bf811461008757806302571be3146100bb57806306ab5923146100d357806314ab9038146100fc57806316a25cbd146101215780631896f70a146101565780635b0fc9c31461017a575b600080fd5b34801561009357600080fd5b5061009f60043561019e565b60408051600160a060020a039092168252519081900360200190f35b3480156100c757600080fd5b5061009f6004356101bc565b3480156100df57600080fd5b506100fa600435602435600160a060020a03604435166101d7565b005b34801561010857600080fd5b506100fa60043567ffffffffffffffff6024351661029a565b34801561012d57600080fd5b50610139600435610367565b6040805167ffffffffffffffff9092168252519081900360200190f35b34801561016257600080fd5b506100fa600435600160a060020a036024351661039e565b34801561018657600080fd5b506100fa600435600160a060020a0360243516610445565b600090815260208190526040902060010154600160a060020a031690565b600090815260208190526040902054600160a060020a031690565b6000838152602081905260408120548490600160a060020a031633146101fc57600080fd5b60408051868152602080820187905282519182900383018220888352908201879052600160a060020a0386168284015291519193507fce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82919081900360600190a1506000908152602081905260409020805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555050565b6000828152602081905260409020548290600160a060020a031633146102bf57600080fd5b6040805184815267ffffffffffffffff8416602082015281517f1d4f9bbfc9cab89d66e1a1562f2233ccbf1308cb4f63de2ead5787adddb8fa68929181900390910190a150600091825260208290526040909120600101805467ffffffffffffffff90921674010000000000000000000000000000000000000000027fffffffff0000000000000000ffffffffffffffffffffffffffffffffffffffff909216919091179055565b60009081526020819052604090206001015474010000000000000000000000000000000000000000900467ffffffffffffffff1690565b6000828152602081905260409020548290600160a060020a031633146103c357600080fd5b60408051848152600160a060020a038416602082015281517f335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0929181900390910190a150600091825260208290526040909120600101805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03909216919091179055565b6000828152602081905260409020548290600160a060020a0316331461046a57600080fd5b60408051848152600160a060020a038416602082015281517fd4735d920b0f87494915f556dd9b54c8f309026070caea5c737245152564d266929181900390910190a150600091825260208290526040909120805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a039092169190911790555600a165627a7a723058205a3294e66ce5f4564e7aa4cfe4772ec4dda5de6408f976f44e4f56f97703c57a0029",
    "deployedBytecode": "0x6080604052600436106100825763ffffffff7c01000000000000000000000000000000000000000000000000000000006000350416630178b8bf811461008757806302571be3146100bb57806306ab5923146100d357806314ab9038146100fc57806316a25cbd146101215780631896f70a146101565780635b0fc9c31461017a575b600080fd5b34801561009357600080fd5b5061009f60043561019e565b60408051600160a060020a039092168252519081900360200190f35b3480156100c757600080fd5b5061009f6004356101bc565b3480156100df57600080fd5b506100fa600435602435600160a060020a03604435166101d7565b005b34801561010857600080fd5b506100fa60043567ffffffffffffffff6024351661029a565b34801561012d57600080fd5b50610139600435610367565b6040805167ffffffffffffffff9092168252519081900360200190f35b34801561016257600080fd5b506100fa600435600160a060020a036024351661039e565b34801561018657600080fd5b506100fa600435600160a060020a0360243516610445565b600090815260208190526040902060010154600160a060020a031690565b600090815260208190526040902054600160a060020a031690565b6000838152602081905260408120548490600160a060020a031633146101fc57600080fd5b60408051868152602080820187905282519182900383018220888352908201879052600160a060020a0386168284015291519193507fce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82919081900360600190a1506000908152602081905260409020805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03929092169190911790555050565b6000828152602081905260409020548290600160a060020a031633146102bf57600080fd5b6040805184815267ffffffffffffffff8416602082015281517f1d4f9bbfc9cab89d66e1a1562f2233ccbf1308cb4f63de2ead5787adddb8fa68929181900390910190a150600091825260208290526040909120600101805467ffffffffffffffff90921674010000000000000000000000000000000000000000027fffffffff0000000000000000ffffffffffffffffffffffffffffffffffffffff909216919091179055565b60009081526020819052604090206001015474010000000000000000000000000000000000000000900467ffffffffffffffff1690565b6000828152602081905260409020548290600160a060020a031633146103c357600080fd5b60408051848152600160a060020a038416602082015281517f335721b01866dc23fbee8b6b2c7b1e14d6f05c28cd35a2c934239f94095602a0929181900390910190a150600091825260208290526040909120600101805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a03909216919091179055565b6000828152602081905260409020548290600160a060020a0316331461046a57600080fd5b60408051848152600160a060020a038416602082015281517fd4735d920b0f87494915f556dd9b54c8f309026070caea5c737245152564d266929181900390910190a150600091825260208290526040909120805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a039092169190911790555600a165627a7a723058205a3294e66ce5f4564e7aa4cfe4772ec4dda5de6408f976f44e4f56f97703c57a0029",
    "sourceMap": "90:2842:2:-;;;502:78;8:9:-1;5:2;;;30:1;27;20:12;5:2;-1:-1;542:7:2;:12;;;;;;:31;;-1:-1:-1;;;;;;542:31:2;563:10;542:31;;;90:2842;;;;;;",
    "deployedSourceMap": "90:2842:2:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;2556:108;;8:9:-1;5:2;;;30:1;27;20:12;5:2;-1:-1;2556:108:2;;;;;;;;;-1:-1:-1;;;;;2556:108:2;;;;;;;;;;;;;;2281:102;;8:9:-1;5:2;;;30:1;27;20:12;5:2;-1:-1;2281:102:2;;;;;1277:224;;8:9:-1;5:2;;;30:1;27;20:12;5:2;-1:-1;1277:224:2;;;;;-1:-1:-1;;;;;1277:224:2;;;;;;;1988:133;;8:9:-1;5:2;;;30:1;27;20:12;5:2;-1:-1;1988:133:2;;;;;;;;;2832:97;;8:9:-1;5:2;;;30:1;27;20:12;5:2;-1:-1;2832:97:2;;;;;;;;;;;;;;;;;;;;;;;;1676:164;;8:9:-1;5:2;;;30:1;27;20:12;5:2;-1:-1;1676:164:2;;;-1:-1:-1;;;;;1676:164:2;;;;;819:146;;8:9:-1;5:2;;;30:1;27;20:12;5:2;-1:-1;819:146:2;;;-1:-1:-1;;;;;819:146:2;;;;;2556:108;2609:7;2635:13;;;;;;;;;;:22;;;-1:-1:-1;;;;;2635:22:2;;2556:108::o;2281:102::-;2331:7;2357:13;;;;;;;;;;:19;-1:-1:-1;;;;;2357:19:2;;2281:102::o;1277:224::-;1380:11;384:13;;;;;;;;;;:19;1364:4;;-1:-1:-1;;;;;384:19:2;407:10;384:33;376:42;;;;;;1394:22;;;;;;;;;;;;;;;;;;;;;;;1426:28;;;;;;;;;-1:-1:-1;;;;;1426:28:2;;;;;;;;1394:22;;-1:-1:-1;1426:28:2;;;;;;;;;;-1:-1:-1;1464:7:2;:16;;;;;;;;;;:30;;-1:-1:-1;;1464:30:2;-1:-1:-1;;;;;1464:30:2;;;;;;;;;;-1:-1:-1;;1277:224:2:o;1988:133::-;384:7;:13;;;;;;;;;;:19;2048:4;;-1:-1:-1;;;;;384:19:2;407:10;384:33;376:42;;;;;;2064:17;;;;;;;;;;;;;;;;;;;;;;;;;;-1:-1:-1;2091:7:2;:13;;;;;;;;;;;:17;;:23;;;;;;;;;;;;;;;;;;1988:133::o;2832:97::-;2880:6;2905:13;;;;;;;;;;:17;;;;;;;;;2832:97::o;1676:164::-;384:7;:13;;;;;;;;;;:19;1747:4;;-1:-1:-1;;;;;384:19:2;407:10;384:33;376:42;;;;;;1763:27;;;;;;-1:-1:-1;;;;;1763:27:2;;;;;;;;;;;;;;;;;;;-1:-1:-1;1800:7:2;:13;;;;;;;;;;;:22;;:33;;-1:-1:-1;;1800:33:2;-1:-1:-1;;;;;1800:33:2;;;;;;;;;1676:164::o;819:146::-;384:7;:13;;;;;;;;;;:19;884:4;;-1:-1:-1;;;;;384:19:2;407:10;384:33;376:42;;;;;;900:21;;;;;;-1:-1:-1;;;;;900:21:2;;;;;;;;;;;;;;;;;;;-1:-1:-1;931:7:2;:13;;;;;;;;;;;:27;;-1:-1:-1;;931:27:2;-1:-1:-1;;;;;931:27:2;;;;;;;;;819:146::o",
    "source": "pragma solidity ^0.4.18;\n\nimport \"../ens/ENS.sol\";\n\n/**\n * The ENS registry contract.\n */\ncontract ENSRegistry is ENS {\n    struct Record {\n        address owner;\n        address resolver;\n        uint64 ttl;\n    }\n\n    mapping (bytes32 => Record) records;\n\n    // Permits modifications only by the owner of the specified node.\n    modifier only_owner(bytes32 node) {\n        require(records[node].owner == msg.sender);\n        _;\n    }\n\n    /**\n     * @dev Constructs a new ENS registrar.\n     */\n    function ENSRegistry() public {\n        records[0x0].owner = msg.sender;\n    }\n\n    /**\n     * @dev Transfers ownership of a node to a new address. May only be called by the current owner of the node.\n     * @param node The node to transfer ownership of.\n     * @param owner The address of the new owner.\n     */\n    function setOwner(bytes32 node, address owner) public only_owner(node) {\n        Transfer(node, owner);\n        records[node].owner = owner;\n    }\n\n    /**\n     * @dev Transfers ownership of a subnode keccak256(node, label) to a new address. May only be called by the owner of the parent node.\n     * @param node The parent node.\n     * @param label The hash of the label specifying the subnode.\n     * @param owner The address of the new owner.\n     */\n    function setSubnodeOwner(bytes32 node, bytes32 label, address owner) public only_owner(node) {\n        var subnode = keccak256(node, label);\n        NewOwner(node, label, owner);\n        records[subnode].owner = owner;\n    }\n\n    /**\n     * @dev Sets the resolver address for the specified node.\n     * @param node The node to update.\n     * @param resolver The address of the resolver.\n     */\n    function setResolver(bytes32 node, address resolver) public only_owner(node) {\n        NewResolver(node, resolver);\n        records[node].resolver = resolver;\n    }\n\n    /**\n     * @dev Sets the TTL for the specified node.\n     * @param node The node to update.\n     * @param ttl The TTL in seconds.\n     */\n    function setTTL(bytes32 node, uint64 ttl) public only_owner(node) {\n        NewTTL(node, ttl);\n        records[node].ttl = ttl;\n    }\n\n    /**\n     * @dev Returns the address that owns the specified node.\n     * @param node The specified node.\n     * @return address of the owner.\n     */\n    function owner(bytes32 node) public view returns (address) {\n        return records[node].owner;\n    }\n\n    /**\n     * @dev Returns the address of the resolver for the specified node.\n     * @param node The specified node.\n     * @return address of the resolver.\n     */\n    function resolver(bytes32 node) public view returns (address) {\n        return records[node].resolver;\n    }\n\n    /**\n     * @dev Returns the TTL of a node, and any records associated with it.\n     * @param node The specified node.\n     * @return ttl of the node.\n     */\n    function ttl(bytes32 node) public view returns (uint64) {\n        return records[node].ttl;\n    }\n\n}\n",
    "sourcePath": "/home/alexmedkex/smart-contracts/contracts/ens/ENSRegistry.sol",
    "ast": {
      "absolutePath": "/home/alexmedkex/smart-contracts/contracts/ens/ENSRegistry.sol",
      "exportedSymbols": {
        "ENSRegistry": [
          320
        ]
      },
      "id": 321,
      "nodeType": "SourceUnit",
      "nodes": [
        {
          "id": 137,
          "literals": [
            "solidity",
            "^",
            "0.4",
            ".18"
          ],
          "nodeType": "PragmaDirective",
          "src": "0:24:2"
        },
        {
          "absolutePath": "/home/alexmedkex/smart-contracts/contracts/ens/ENS.sol",
          "file": "../ens/ENS.sol",
          "id": 138,
          "nodeType": "ImportDirective",
          "scope": 321,
          "sourceUnit": 136,
          "src": "26:24:2",
          "symbolAliases": [],
          "unitAlias": ""
        },
        {
          "baseContracts": [
            {
              "arguments": null,
              "baseName": {
                "contractScope": null,
                "id": 139,
                "name": "ENS",
                "nodeType": "UserDefinedTypeName",
                "referencedDeclaration": 135,
                "src": "114:3:2",
                "typeDescriptions": {
                  "typeIdentifier": "t_contract$_ENS_$135",
                  "typeString": "contract ENS"
                }
              },
              "id": 140,
              "nodeType": "InheritanceSpecifier",
              "src": "114:3:2"
            }
          ],
          "contractDependencies": [
            135
          ],
          "contractKind": "contract",
          "documentation": "The ENS registry contract.",
          "fullyImplemented": true,
          "id": 320,
          "linearizedBaseContracts": [
            320,
            135
          ],
          "name": "ENSRegistry",
          "nodeType": "ContractDefinition",
          "nodes": [
            {
              "canonicalName": "ENSRegistry.Record",
              "id": 147,
              "members": [
                {
                  "constant": false,
                  "id": 142,
                  "name": "owner",
                  "nodeType": "VariableDeclaration",
                  "scope": 147,
                  "src": "148:13:2",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 141,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "148:7:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 144,
                  "name": "resolver",
                  "nodeType": "VariableDeclaration",
                  "scope": 147,
                  "src": "171:16:2",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 143,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "171:7:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 146,
                  "name": "ttl",
                  "nodeType": "VariableDeclaration",
                  "scope": 147,
                  "src": "197:10:2",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint64",
                    "typeString": "uint64"
                  },
                  "typeName": {
                    "id": 145,
                    "name": "uint64",
                    "nodeType": "ElementaryTypeName",
                    "src": "197:6:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint64",
                      "typeString": "uint64"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "name": "Record",
              "nodeType": "StructDefinition",
              "scope": 320,
              "src": "124:90:2",
              "visibility": "public"
            },
            {
              "constant": false,
              "id": 151,
              "name": "records",
              "nodeType": "VariableDeclaration",
              "scope": 320,
              "src": "220:35:2",
              "stateVariable": true,
              "storageLocation": "default",
              "typeDescriptions": {
                "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                "typeString": "mapping(bytes32 => struct ENSRegistry.Record)"
              },
              "typeName": {
                "id": 150,
                "keyType": {
                  "id": 148,
                  "name": "bytes32",
                  "nodeType": "ElementaryTypeName",
                  "src": "229:7:2",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  }
                },
                "nodeType": "Mapping",
                "src": "220:27:2",
                "typeDescriptions": {
                  "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                  "typeString": "mapping(bytes32 => struct ENSRegistry.Record)"
                },
                "valueType": {
                  "contractScope": null,
                  "id": 149,
                  "name": "Record",
                  "nodeType": "UserDefinedTypeName",
                  "referencedDeclaration": 147,
                  "src": "240:6:2",
                  "typeDescriptions": {
                    "typeIdentifier": "t_struct$_Record_$147_storage_ptr",
                    "typeString": "struct ENSRegistry.Record"
                  }
                }
              },
              "value": null,
              "visibility": "internal"
            },
            {
              "body": {
                "id": 166,
                "nodeType": "Block",
                "src": "366:70:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "commonType": {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          },
                          "id": 162,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "lValueRequested": false,
                          "leftExpression": {
                            "argumentTypes": null,
                            "expression": {
                              "argumentTypes": null,
                              "baseExpression": {
                                "argumentTypes": null,
                                "id": 156,
                                "name": "records",
                                "nodeType": "Identifier",
                                "overloadedDeclarations": [],
                                "referencedDeclaration": 151,
                                "src": "384:7:2",
                                "typeDescriptions": {
                                  "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                                  "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                                }
                              },
                              "id": 158,
                              "indexExpression": {
                                "argumentTypes": null,
                                "id": 157,
                                "name": "node",
                                "nodeType": "Identifier",
                                "overloadedDeclarations": [],
                                "referencedDeclaration": 153,
                                "src": "392:4:2",
                                "typeDescriptions": {
                                  "typeIdentifier": "t_bytes32",
                                  "typeString": "bytes32"
                                }
                              },
                              "isConstant": false,
                              "isLValue": true,
                              "isPure": false,
                              "lValueRequested": false,
                              "nodeType": "IndexAccess",
                              "src": "384:13:2",
                              "typeDescriptions": {
                                "typeIdentifier": "t_struct$_Record_$147_storage",
                                "typeString": "struct ENSRegistry.Record storage ref"
                              }
                            },
                            "id": 159,
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "owner",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 142,
                            "src": "384:19:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          "nodeType": "BinaryOperation",
                          "operator": "==",
                          "rightExpression": {
                            "argumentTypes": null,
                            "expression": {
                              "argumentTypes": null,
                              "id": 160,
                              "name": "msg",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 5063,
                              "src": "407:3:2",
                              "typeDescriptions": {
                                "typeIdentifier": "t_magic_message",
                                "typeString": "msg"
                              }
                            },
                            "id": 161,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "sender",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": null,
                            "src": "407:10:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          "src": "384:33:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bool",
                            "typeString": "bool"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bool",
                            "typeString": "bool"
                          }
                        ],
                        "id": 155,
                        "name": "require",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [
                          5066,
                          5067
                        ],
                        "referencedDeclaration": 5066,
                        "src": "376:7:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_require_pure$_t_bool_$returns$__$",
                          "typeString": "function (bool) pure"
                        }
                      },
                      "id": 163,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "376:42:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 164,
                    "nodeType": "ExpressionStatement",
                    "src": "376:42:2"
                  },
                  {
                    "id": 165,
                    "nodeType": "PlaceholderStatement",
                    "src": "428:1:2"
                  }
                ]
              },
              "documentation": null,
              "id": 167,
              "name": "only_owner",
              "nodeType": "ModifierDefinition",
              "parameters": {
                "id": 154,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 153,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 167,
                    "src": "352:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 152,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "352:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "351:14:2"
              },
              "src": "332:104:2",
              "visibility": "internal"
            },
            {
              "body": {
                "id": 178,
                "nodeType": "Block",
                "src": "532:48:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "id": 176,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "leftHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "baseExpression": {
                            "argumentTypes": null,
                            "id": 170,
                            "name": "records",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 151,
                            "src": "542:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                              "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                            }
                          },
                          "id": 172,
                          "indexExpression": {
                            "argumentTypes": null,
                            "hexValue": "307830",
                            "id": 171,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": true,
                            "kind": "number",
                            "lValueRequested": false,
                            "nodeType": "Literal",
                            "src": "550:3:2",
                            "subdenomination": null,
                            "typeDescriptions": {
                              "typeIdentifier": "t_rational_0_by_1",
                              "typeString": "int_const 0"
                            },
                            "value": "0x0"
                          },
                          "isConstant": false,
                          "isLValue": true,
                          "isPure": false,
                          "lValueRequested": false,
                          "nodeType": "IndexAccess",
                          "src": "542:12:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_Record_$147_storage",
                            "typeString": "struct ENSRegistry.Record storage ref"
                          }
                        },
                        "id": 173,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": true,
                        "memberName": "owner",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 142,
                        "src": "542:18:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "nodeType": "Assignment",
                      "operator": "=",
                      "rightHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "id": 174,
                          "name": "msg",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 5063,
                          "src": "563:3:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_magic_message",
                            "typeString": "msg"
                          }
                        },
                        "id": 175,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "memberName": "sender",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": null,
                        "src": "563:10:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "src": "542:31:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 177,
                    "nodeType": "ExpressionStatement",
                    "src": "542:31:2"
                  }
                ]
              },
              "documentation": "@dev Constructs a new ENS registrar.",
              "id": 179,
              "implemented": true,
              "isConstructor": true,
              "isDeclaredConst": false,
              "modifiers": [],
              "name": "ENSRegistry",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 168,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "522:2:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 169,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "532:0:2"
              },
              "scope": 320,
              "src": "502:78:2",
              "stateMutability": "nonpayable",
              "superFunction": null,
              "visibility": "public"
            },
            {
              "body": {
                "id": 201,
                "nodeType": "Block",
                "src": "890:75:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "id": 190,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 181,
                          "src": "909:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 191,
                          "name": "owner",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 183,
                          "src": "915:5:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        ],
                        "id": 189,
                        "name": "Transfer",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 71,
                        "src": "900:8:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_event_nonpayable$_t_bytes32_$_t_address_$returns$__$",
                          "typeString": "function (bytes32,address)"
                        }
                      },
                      "id": 192,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "900:21:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 193,
                    "nodeType": "ExpressionStatement",
                    "src": "900:21:2"
                  },
                  {
                    "expression": {
                      "argumentTypes": null,
                      "id": 199,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "leftHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "baseExpression": {
                            "argumentTypes": null,
                            "id": 194,
                            "name": "records",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 151,
                            "src": "931:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                              "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                            }
                          },
                          "id": 196,
                          "indexExpression": {
                            "argumentTypes": null,
                            "id": 195,
                            "name": "node",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 181,
                            "src": "939:4:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes32",
                              "typeString": "bytes32"
                            }
                          },
                          "isConstant": false,
                          "isLValue": true,
                          "isPure": false,
                          "lValueRequested": false,
                          "nodeType": "IndexAccess",
                          "src": "931:13:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_Record_$147_storage",
                            "typeString": "struct ENSRegistry.Record storage ref"
                          }
                        },
                        "id": 197,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": true,
                        "memberName": "owner",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 142,
                        "src": "931:19:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "nodeType": "Assignment",
                      "operator": "=",
                      "rightHandSide": {
                        "argumentTypes": null,
                        "id": 198,
                        "name": "owner",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 183,
                        "src": "953:5:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "src": "931:27:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 200,
                    "nodeType": "ExpressionStatement",
                    "src": "931:27:2"
                  }
                ]
              },
              "documentation": "@dev Transfers ownership of a node to a new address. May only be called by the current owner of the node.\n@param node The node to transfer ownership of.\n@param owner The address of the new owner.",
              "id": 202,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": false,
              "modifiers": [
                {
                  "arguments": [
                    {
                      "argumentTypes": null,
                      "id": 186,
                      "name": "node",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 181,
                      "src": "884:4:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    }
                  ],
                  "id": 187,
                  "modifierName": {
                    "argumentTypes": null,
                    "id": 185,
                    "name": "only_owner",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 167,
                    "src": "873:10:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_modifier$_t_bytes32_$",
                      "typeString": "modifier (bytes32)"
                    }
                  },
                  "nodeType": "ModifierInvocation",
                  "src": "873:16:2"
                }
              ],
              "name": "setOwner",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 184,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 181,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 202,
                    "src": "837:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 180,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "837:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 183,
                    "name": "owner",
                    "nodeType": "VariableDeclaration",
                    "scope": 202,
                    "src": "851:13:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 182,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "851:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "836:29:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 188,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "890:0:2"
              },
              "scope": 320,
              "src": "819:146:2",
              "stateMutability": "nonpayable",
              "superFunction": 106,
              "visibility": "public"
            },
            {
              "body": {
                "id": 233,
                "nodeType": "Block",
                "src": "1370:131:2",
                "statements": [
                  {
                    "assignments": [
                      214
                    ],
                    "declarations": [
                      {
                        "constant": false,
                        "id": 214,
                        "name": "subnode",
                        "nodeType": "VariableDeclaration",
                        "scope": 234,
                        "src": "1380:11:2",
                        "stateVariable": false,
                        "storageLocation": "default",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes32",
                          "typeString": "bytes32"
                        },
                        "typeName": null,
                        "value": null,
                        "visibility": "internal"
                      }
                    ],
                    "id": 219,
                    "initialValue": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "id": 216,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 204,
                          "src": "1404:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 217,
                          "name": "label",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 206,
                          "src": "1410:5:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        ],
                        "id": 215,
                        "name": "keccak256",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 5057,
                        "src": "1394:9:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_sha3_pure$__$returns$_t_bytes32_$",
                          "typeString": "function () pure returns (bytes32)"
                        }
                      },
                      "id": 218,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "1394:22:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "nodeType": "VariableDeclarationStatement",
                    "src": "1380:36:2"
                  },
                  {
                    "expression": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "id": 221,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 204,
                          "src": "1435:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 222,
                          "name": "label",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 206,
                          "src": "1441:5:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 223,
                          "name": "owner",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 208,
                          "src": "1448:5:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        ],
                        "id": 220,
                        "name": "NewOwner",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 65,
                        "src": "1426:8:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_event_nonpayable$_t_bytes32_$_t_bytes32_$_t_address_$returns$__$",
                          "typeString": "function (bytes32,bytes32,address)"
                        }
                      },
                      "id": 224,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "1426:28:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 225,
                    "nodeType": "ExpressionStatement",
                    "src": "1426:28:2"
                  },
                  {
                    "expression": {
                      "argumentTypes": null,
                      "id": 231,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "leftHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "baseExpression": {
                            "argumentTypes": null,
                            "id": 226,
                            "name": "records",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 151,
                            "src": "1464:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                              "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                            }
                          },
                          "id": 228,
                          "indexExpression": {
                            "argumentTypes": null,
                            "id": 227,
                            "name": "subnode",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 214,
                            "src": "1472:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes32",
                              "typeString": "bytes32"
                            }
                          },
                          "isConstant": false,
                          "isLValue": true,
                          "isPure": false,
                          "lValueRequested": false,
                          "nodeType": "IndexAccess",
                          "src": "1464:16:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_Record_$147_storage",
                            "typeString": "struct ENSRegistry.Record storage ref"
                          }
                        },
                        "id": 229,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": true,
                        "memberName": "owner",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 142,
                        "src": "1464:22:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "nodeType": "Assignment",
                      "operator": "=",
                      "rightHandSide": {
                        "argumentTypes": null,
                        "id": 230,
                        "name": "owner",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 208,
                        "src": "1489:5:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "src": "1464:30:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 232,
                    "nodeType": "ExpressionStatement",
                    "src": "1464:30:2"
                  }
                ]
              },
              "documentation": "@dev Transfers ownership of a subnode keccak256(node, label) to a new address. May only be called by the owner of the parent node.\n@param node The parent node.\n@param label The hash of the label specifying the subnode.\n@param owner The address of the new owner.",
              "id": 234,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": false,
              "modifiers": [
                {
                  "arguments": [
                    {
                      "argumentTypes": null,
                      "id": 211,
                      "name": "node",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 204,
                      "src": "1364:4:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    }
                  ],
                  "id": 212,
                  "modifierName": {
                    "argumentTypes": null,
                    "id": 210,
                    "name": "only_owner",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 167,
                    "src": "1353:10:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_modifier$_t_bytes32_$",
                      "typeString": "modifier (bytes32)"
                    }
                  },
                  "nodeType": "ModifierInvocation",
                  "src": "1353:16:2"
                }
              ],
              "name": "setSubnodeOwner",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 209,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 204,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 234,
                    "src": "1302:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 203,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "1302:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 206,
                    "name": "label",
                    "nodeType": "VariableDeclaration",
                    "scope": 234,
                    "src": "1316:13:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 205,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "1316:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 208,
                    "name": "owner",
                    "nodeType": "VariableDeclaration",
                    "scope": 234,
                    "src": "1331:13:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 207,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "1331:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "1301:44:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 213,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "1370:0:2"
              },
              "scope": 320,
              "src": "1277:224:2",
              "stateMutability": "nonpayable",
              "superFunction": 92,
              "visibility": "public"
            },
            {
              "body": {
                "id": 256,
                "nodeType": "Block",
                "src": "1753:87:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "id": 245,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 236,
                          "src": "1775:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 246,
                          "name": "resolver",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 238,
                          "src": "1781:8:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        ],
                        "id": 244,
                        "name": "NewResolver",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 77,
                        "src": "1763:11:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_event_nonpayable$_t_bytes32_$_t_address_$returns$__$",
                          "typeString": "function (bytes32,address)"
                        }
                      },
                      "id": 247,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "1763:27:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 248,
                    "nodeType": "ExpressionStatement",
                    "src": "1763:27:2"
                  },
                  {
                    "expression": {
                      "argumentTypes": null,
                      "id": 254,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "leftHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "baseExpression": {
                            "argumentTypes": null,
                            "id": 249,
                            "name": "records",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 151,
                            "src": "1800:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                              "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                            }
                          },
                          "id": 251,
                          "indexExpression": {
                            "argumentTypes": null,
                            "id": 250,
                            "name": "node",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 236,
                            "src": "1808:4:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes32",
                              "typeString": "bytes32"
                            }
                          },
                          "isConstant": false,
                          "isLValue": true,
                          "isPure": false,
                          "lValueRequested": false,
                          "nodeType": "IndexAccess",
                          "src": "1800:13:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_Record_$147_storage",
                            "typeString": "struct ENSRegistry.Record storage ref"
                          }
                        },
                        "id": 252,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": true,
                        "memberName": "resolver",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 144,
                        "src": "1800:22:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "nodeType": "Assignment",
                      "operator": "=",
                      "rightHandSide": {
                        "argumentTypes": null,
                        "id": 253,
                        "name": "resolver",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 238,
                        "src": "1825:8:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "src": "1800:33:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 255,
                    "nodeType": "ExpressionStatement",
                    "src": "1800:33:2"
                  }
                ]
              },
              "documentation": "@dev Sets the resolver address for the specified node.\n@param node The node to update.\n@param resolver The address of the resolver.",
              "id": 257,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": false,
              "modifiers": [
                {
                  "arguments": [
                    {
                      "argumentTypes": null,
                      "id": 241,
                      "name": "node",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 236,
                      "src": "1747:4:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    }
                  ],
                  "id": 242,
                  "modifierName": {
                    "argumentTypes": null,
                    "id": 240,
                    "name": "only_owner",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 167,
                    "src": "1736:10:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_modifier$_t_bytes32_$",
                      "typeString": "modifier (bytes32)"
                    }
                  },
                  "nodeType": "ModifierInvocation",
                  "src": "1736:16:2"
                }
              ],
              "name": "setResolver",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 239,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 236,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 257,
                    "src": "1697:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 235,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "1697:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 238,
                    "name": "resolver",
                    "nodeType": "VariableDeclaration",
                    "scope": 257,
                    "src": "1711:16:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 237,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "1711:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "1696:32:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 243,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "1753:0:2"
              },
              "scope": 320,
              "src": "1676:164:2",
              "stateMutability": "nonpayable",
              "superFunction": 99,
              "visibility": "public"
            },
            {
              "body": {
                "id": 279,
                "nodeType": "Block",
                "src": "2054:67:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "id": 268,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 259,
                          "src": "2071:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 269,
                          "name": "ttl",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 261,
                          "src": "2077:3:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint64",
                            "typeString": "uint64"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_uint64",
                            "typeString": "uint64"
                          }
                        ],
                        "id": 267,
                        "name": "NewTTL",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 83,
                        "src": "2064:6:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_event_nonpayable$_t_bytes32_$_t_uint64_$returns$__$",
                          "typeString": "function (bytes32,uint64)"
                        }
                      },
                      "id": 270,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "2064:17:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 271,
                    "nodeType": "ExpressionStatement",
                    "src": "2064:17:2"
                  },
                  {
                    "expression": {
                      "argumentTypes": null,
                      "id": 277,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "leftHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "baseExpression": {
                            "argumentTypes": null,
                            "id": 272,
                            "name": "records",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 151,
                            "src": "2091:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                              "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                            }
                          },
                          "id": 274,
                          "indexExpression": {
                            "argumentTypes": null,
                            "id": 273,
                            "name": "node",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 259,
                            "src": "2099:4:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes32",
                              "typeString": "bytes32"
                            }
                          },
                          "isConstant": false,
                          "isLValue": true,
                          "isPure": false,
                          "lValueRequested": false,
                          "nodeType": "IndexAccess",
                          "src": "2091:13:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_Record_$147_storage",
                            "typeString": "struct ENSRegistry.Record storage ref"
                          }
                        },
                        "id": 275,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": true,
                        "memberName": "ttl",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 146,
                        "src": "2091:17:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint64",
                          "typeString": "uint64"
                        }
                      },
                      "nodeType": "Assignment",
                      "operator": "=",
                      "rightHandSide": {
                        "argumentTypes": null,
                        "id": 276,
                        "name": "ttl",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 261,
                        "src": "2111:3:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint64",
                          "typeString": "uint64"
                        }
                      },
                      "src": "2091:23:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint64",
                        "typeString": "uint64"
                      }
                    },
                    "id": 278,
                    "nodeType": "ExpressionStatement",
                    "src": "2091:23:2"
                  }
                ]
              },
              "documentation": "@dev Sets the TTL for the specified node.\n@param node The node to update.\n@param ttl The TTL in seconds.",
              "id": 280,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": false,
              "modifiers": [
                {
                  "arguments": [
                    {
                      "argumentTypes": null,
                      "id": 264,
                      "name": "node",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 259,
                      "src": "2048:4:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    }
                  ],
                  "id": 265,
                  "modifierName": {
                    "argumentTypes": null,
                    "id": 263,
                    "name": "only_owner",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 167,
                    "src": "2037:10:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_modifier$_t_bytes32_$",
                      "typeString": "modifier (bytes32)"
                    }
                  },
                  "nodeType": "ModifierInvocation",
                  "src": "2037:16:2"
                }
              ],
              "name": "setTTL",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 262,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 259,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 280,
                    "src": "2004:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 258,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "2004:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 261,
                    "name": "ttl",
                    "nodeType": "VariableDeclaration",
                    "scope": 280,
                    "src": "2018:10:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint64",
                      "typeString": "uint64"
                    },
                    "typeName": {
                      "id": 260,
                      "name": "uint64",
                      "nodeType": "ElementaryTypeName",
                      "src": "2018:6:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint64",
                        "typeString": "uint64"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2003:26:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 266,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "2054:0:2"
              },
              "scope": 320,
              "src": "1988:133:2",
              "stateMutability": "nonpayable",
              "superFunction": 113,
              "visibility": "public"
            },
            {
              "body": {
                "id": 292,
                "nodeType": "Block",
                "src": "2340:43:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "expression": {
                        "argumentTypes": null,
                        "baseExpression": {
                          "argumentTypes": null,
                          "id": 287,
                          "name": "records",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 151,
                          "src": "2357:7:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                            "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                          }
                        },
                        "id": 289,
                        "indexExpression": {
                          "argumentTypes": null,
                          "id": 288,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 282,
                          "src": "2365:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": false,
                        "nodeType": "IndexAccess",
                        "src": "2357:13:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Record_$147_storage",
                          "typeString": "struct ENSRegistry.Record storage ref"
                        }
                      },
                      "id": 290,
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "owner",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 142,
                      "src": "2357:19:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "functionReturnParameters": 286,
                    "id": 291,
                    "nodeType": "Return",
                    "src": "2350:26:2"
                  }
                ]
              },
              "documentation": "@dev Returns the address that owns the specified node.\n@param node The specified node.\n@return address of the owner.",
              "id": 293,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": true,
              "modifiers": [],
              "name": "owner",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 283,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 282,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 293,
                    "src": "2296:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 281,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "2296:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2295:14:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 286,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 285,
                    "name": "",
                    "nodeType": "VariableDeclaration",
                    "scope": 293,
                    "src": "2331:7:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 284,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "2331:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2330:9:2"
              },
              "scope": 320,
              "src": "2281:102:2",
              "stateMutability": "view",
              "superFunction": 120,
              "visibility": "public"
            },
            {
              "body": {
                "id": 305,
                "nodeType": "Block",
                "src": "2618:46:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "expression": {
                        "argumentTypes": null,
                        "baseExpression": {
                          "argumentTypes": null,
                          "id": 300,
                          "name": "records",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 151,
                          "src": "2635:7:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                            "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                          }
                        },
                        "id": 302,
                        "indexExpression": {
                          "argumentTypes": null,
                          "id": 301,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 295,
                          "src": "2643:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": false,
                        "nodeType": "IndexAccess",
                        "src": "2635:13:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Record_$147_storage",
                          "typeString": "struct ENSRegistry.Record storage ref"
                        }
                      },
                      "id": 303,
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "resolver",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 144,
                      "src": "2635:22:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "functionReturnParameters": 299,
                    "id": 304,
                    "nodeType": "Return",
                    "src": "2628:29:2"
                  }
                ]
              },
              "documentation": "@dev Returns the address of the resolver for the specified node.\n@param node The specified node.\n@return address of the resolver.",
              "id": 306,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": true,
              "modifiers": [],
              "name": "resolver",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 296,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 295,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 306,
                    "src": "2574:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 294,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "2574:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2573:14:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 299,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 298,
                    "name": "",
                    "nodeType": "VariableDeclaration",
                    "scope": 306,
                    "src": "2609:7:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 297,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "2609:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2608:9:2"
              },
              "scope": 320,
              "src": "2556:108:2",
              "stateMutability": "view",
              "superFunction": 127,
              "visibility": "public"
            },
            {
              "body": {
                "id": 318,
                "nodeType": "Block",
                "src": "2888:41:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "expression": {
                        "argumentTypes": null,
                        "baseExpression": {
                          "argumentTypes": null,
                          "id": 313,
                          "name": "records",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 151,
                          "src": "2905:7:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                            "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                          }
                        },
                        "id": 315,
                        "indexExpression": {
                          "argumentTypes": null,
                          "id": 314,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 308,
                          "src": "2913:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": false,
                        "nodeType": "IndexAccess",
                        "src": "2905:13:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Record_$147_storage",
                          "typeString": "struct ENSRegistry.Record storage ref"
                        }
                      },
                      "id": 316,
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "ttl",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 146,
                      "src": "2905:17:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint64",
                        "typeString": "uint64"
                      }
                    },
                    "functionReturnParameters": 312,
                    "id": 317,
                    "nodeType": "Return",
                    "src": "2898:24:2"
                  }
                ]
              },
              "documentation": "@dev Returns the TTL of a node, and any records associated with it.\n@param node The specified node.\n@return ttl of the node.",
              "id": 319,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": true,
              "modifiers": [],
              "name": "ttl",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 309,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 308,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 319,
                    "src": "2845:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 307,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "2845:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2844:14:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 312,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 311,
                    "name": "",
                    "nodeType": "VariableDeclaration",
                    "scope": 319,
                    "src": "2880:6:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint64",
                      "typeString": "uint64"
                    },
                    "typeName": {
                      "id": 310,
                      "name": "uint64",
                      "nodeType": "ElementaryTypeName",
                      "src": "2880:6:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint64",
                        "typeString": "uint64"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2879:8:2"
              },
              "scope": 320,
              "src": "2832:97:2",
              "stateMutability": "view",
              "superFunction": 134,
              "visibility": "public"
            }
          ],
          "scope": 321,
          "src": "90:2842:2"
        }
      ],
      "src": "0:2933:2"
    },
    "legacyAST": {
      "absolutePath": "/home/alexmedkex/smart-contracts/contracts/ens/ENSRegistry.sol",
      "exportedSymbols": {
        "ENSRegistry": [
          320
        ]
      },
      "id": 321,
      "nodeType": "SourceUnit",
      "nodes": [
        {
          "id": 137,
          "literals": [
            "solidity",
            "^",
            "0.4",
            ".18"
          ],
          "nodeType": "PragmaDirective",
          "src": "0:24:2"
        },
        {
          "absolutePath": "/home/alexmedkex/smart-contracts/contracts/ens/ENS.sol",
          "file": "../ens/ENS.sol",
          "id": 138,
          "nodeType": "ImportDirective",
          "scope": 321,
          "sourceUnit": 136,
          "src": "26:24:2",
          "symbolAliases": [],
          "unitAlias": ""
        },
        {
          "baseContracts": [
            {
              "arguments": null,
              "baseName": {
                "contractScope": null,
                "id": 139,
                "name": "ENS",
                "nodeType": "UserDefinedTypeName",
                "referencedDeclaration": 135,
                "src": "114:3:2",
                "typeDescriptions": {
                  "typeIdentifier": "t_contract$_ENS_$135",
                  "typeString": "contract ENS"
                }
              },
              "id": 140,
              "nodeType": "InheritanceSpecifier",
              "src": "114:3:2"
            }
          ],
          "contractDependencies": [
            135
          ],
          "contractKind": "contract",
          "documentation": "The ENS registry contract.",
          "fullyImplemented": true,
          "id": 320,
          "linearizedBaseContracts": [
            320,
            135
          ],
          "name": "ENSRegistry",
          "nodeType": "ContractDefinition",
          "nodes": [
            {
              "canonicalName": "ENSRegistry.Record",
              "id": 147,
              "members": [
                {
                  "constant": false,
                  "id": 142,
                  "name": "owner",
                  "nodeType": "VariableDeclaration",
                  "scope": 147,
                  "src": "148:13:2",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 141,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "148:7:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 144,
                  "name": "resolver",
                  "nodeType": "VariableDeclaration",
                  "scope": 147,
                  "src": "171:16:2",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 143,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "171:7:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 146,
                  "name": "ttl",
                  "nodeType": "VariableDeclaration",
                  "scope": 147,
                  "src": "197:10:2",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint64",
                    "typeString": "uint64"
                  },
                  "typeName": {
                    "id": 145,
                    "name": "uint64",
                    "nodeType": "ElementaryTypeName",
                    "src": "197:6:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint64",
                      "typeString": "uint64"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "name": "Record",
              "nodeType": "StructDefinition",
              "scope": 320,
              "src": "124:90:2",
              "visibility": "public"
            },
            {
              "constant": false,
              "id": 151,
              "name": "records",
              "nodeType": "VariableDeclaration",
              "scope": 320,
              "src": "220:35:2",
              "stateVariable": true,
              "storageLocation": "default",
              "typeDescriptions": {
                "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                "typeString": "mapping(bytes32 => struct ENSRegistry.Record)"
              },
              "typeName": {
                "id": 150,
                "keyType": {
                  "id": 148,
                  "name": "bytes32",
                  "nodeType": "ElementaryTypeName",
                  "src": "229:7:2",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  }
                },
                "nodeType": "Mapping",
                "src": "220:27:2",
                "typeDescriptions": {
                  "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                  "typeString": "mapping(bytes32 => struct ENSRegistry.Record)"
                },
                "valueType": {
                  "contractScope": null,
                  "id": 149,
                  "name": "Record",
                  "nodeType": "UserDefinedTypeName",
                  "referencedDeclaration": 147,
                  "src": "240:6:2",
                  "typeDescriptions": {
                    "typeIdentifier": "t_struct$_Record_$147_storage_ptr",
                    "typeString": "struct ENSRegistry.Record"
                  }
                }
              },
              "value": null,
              "visibility": "internal"
            },
            {
              "body": {
                "id": 166,
                "nodeType": "Block",
                "src": "366:70:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "commonType": {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          },
                          "id": 162,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "lValueRequested": false,
                          "leftExpression": {
                            "argumentTypes": null,
                            "expression": {
                              "argumentTypes": null,
                              "baseExpression": {
                                "argumentTypes": null,
                                "id": 156,
                                "name": "records",
                                "nodeType": "Identifier",
                                "overloadedDeclarations": [],
                                "referencedDeclaration": 151,
                                "src": "384:7:2",
                                "typeDescriptions": {
                                  "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                                  "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                                }
                              },
                              "id": 158,
                              "indexExpression": {
                                "argumentTypes": null,
                                "id": 157,
                                "name": "node",
                                "nodeType": "Identifier",
                                "overloadedDeclarations": [],
                                "referencedDeclaration": 153,
                                "src": "392:4:2",
                                "typeDescriptions": {
                                  "typeIdentifier": "t_bytes32",
                                  "typeString": "bytes32"
                                }
                              },
                              "isConstant": false,
                              "isLValue": true,
                              "isPure": false,
                              "lValueRequested": false,
                              "nodeType": "IndexAccess",
                              "src": "384:13:2",
                              "typeDescriptions": {
                                "typeIdentifier": "t_struct$_Record_$147_storage",
                                "typeString": "struct ENSRegistry.Record storage ref"
                              }
                            },
                            "id": 159,
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "owner",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 142,
                            "src": "384:19:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          "nodeType": "BinaryOperation",
                          "operator": "==",
                          "rightExpression": {
                            "argumentTypes": null,
                            "expression": {
                              "argumentTypes": null,
                              "id": 160,
                              "name": "msg",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 5063,
                              "src": "407:3:2",
                              "typeDescriptions": {
                                "typeIdentifier": "t_magic_message",
                                "typeString": "msg"
                              }
                            },
                            "id": 161,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "sender",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": null,
                            "src": "407:10:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          "src": "384:33:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bool",
                            "typeString": "bool"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bool",
                            "typeString": "bool"
                          }
                        ],
                        "id": 155,
                        "name": "require",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [
                          5066,
                          5067
                        ],
                        "referencedDeclaration": 5066,
                        "src": "376:7:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_require_pure$_t_bool_$returns$__$",
                          "typeString": "function (bool) pure"
                        }
                      },
                      "id": 163,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "376:42:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 164,
                    "nodeType": "ExpressionStatement",
                    "src": "376:42:2"
                  },
                  {
                    "id": 165,
                    "nodeType": "PlaceholderStatement",
                    "src": "428:1:2"
                  }
                ]
              },
              "documentation": null,
              "id": 167,
              "name": "only_owner",
              "nodeType": "ModifierDefinition",
              "parameters": {
                "id": 154,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 153,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 167,
                    "src": "352:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 152,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "352:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "351:14:2"
              },
              "src": "332:104:2",
              "visibility": "internal"
            },
            {
              "body": {
                "id": 178,
                "nodeType": "Block",
                "src": "532:48:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "id": 176,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "leftHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "baseExpression": {
                            "argumentTypes": null,
                            "id": 170,
                            "name": "records",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 151,
                            "src": "542:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                              "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                            }
                          },
                          "id": 172,
                          "indexExpression": {
                            "argumentTypes": null,
                            "hexValue": "307830",
                            "id": 171,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": true,
                            "kind": "number",
                            "lValueRequested": false,
                            "nodeType": "Literal",
                            "src": "550:3:2",
                            "subdenomination": null,
                            "typeDescriptions": {
                              "typeIdentifier": "t_rational_0_by_1",
                              "typeString": "int_const 0"
                            },
                            "value": "0x0"
                          },
                          "isConstant": false,
                          "isLValue": true,
                          "isPure": false,
                          "lValueRequested": false,
                          "nodeType": "IndexAccess",
                          "src": "542:12:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_Record_$147_storage",
                            "typeString": "struct ENSRegistry.Record storage ref"
                          }
                        },
                        "id": 173,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": true,
                        "memberName": "owner",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 142,
                        "src": "542:18:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "nodeType": "Assignment",
                      "operator": "=",
                      "rightHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "id": 174,
                          "name": "msg",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 5063,
                          "src": "563:3:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_magic_message",
                            "typeString": "msg"
                          }
                        },
                        "id": 175,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "memberName": "sender",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": null,
                        "src": "563:10:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "src": "542:31:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 177,
                    "nodeType": "ExpressionStatement",
                    "src": "542:31:2"
                  }
                ]
              },
              "documentation": "@dev Constructs a new ENS registrar.",
              "id": 179,
              "implemented": true,
              "isConstructor": true,
              "isDeclaredConst": false,
              "modifiers": [],
              "name": "ENSRegistry",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 168,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "522:2:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 169,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "532:0:2"
              },
              "scope": 320,
              "src": "502:78:2",
              "stateMutability": "nonpayable",
              "superFunction": null,
              "visibility": "public"
            },
            {
              "body": {
                "id": 201,
                "nodeType": "Block",
                "src": "890:75:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "id": 190,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 181,
                          "src": "909:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 191,
                          "name": "owner",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 183,
                          "src": "915:5:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        ],
                        "id": 189,
                        "name": "Transfer",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 71,
                        "src": "900:8:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_event_nonpayable$_t_bytes32_$_t_address_$returns$__$",
                          "typeString": "function (bytes32,address)"
                        }
                      },
                      "id": 192,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "900:21:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 193,
                    "nodeType": "ExpressionStatement",
                    "src": "900:21:2"
                  },
                  {
                    "expression": {
                      "argumentTypes": null,
                      "id": 199,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "leftHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "baseExpression": {
                            "argumentTypes": null,
                            "id": 194,
                            "name": "records",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 151,
                            "src": "931:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                              "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                            }
                          },
                          "id": 196,
                          "indexExpression": {
                            "argumentTypes": null,
                            "id": 195,
                            "name": "node",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 181,
                            "src": "939:4:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes32",
                              "typeString": "bytes32"
                            }
                          },
                          "isConstant": false,
                          "isLValue": true,
                          "isPure": false,
                          "lValueRequested": false,
                          "nodeType": "IndexAccess",
                          "src": "931:13:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_Record_$147_storage",
                            "typeString": "struct ENSRegistry.Record storage ref"
                          }
                        },
                        "id": 197,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": true,
                        "memberName": "owner",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 142,
                        "src": "931:19:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "nodeType": "Assignment",
                      "operator": "=",
                      "rightHandSide": {
                        "argumentTypes": null,
                        "id": 198,
                        "name": "owner",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 183,
                        "src": "953:5:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "src": "931:27:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 200,
                    "nodeType": "ExpressionStatement",
                    "src": "931:27:2"
                  }
                ]
              },
              "documentation": "@dev Transfers ownership of a node to a new address. May only be called by the current owner of the node.\n@param node The node to transfer ownership of.\n@param owner The address of the new owner.",
              "id": 202,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": false,
              "modifiers": [
                {
                  "arguments": [
                    {
                      "argumentTypes": null,
                      "id": 186,
                      "name": "node",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 181,
                      "src": "884:4:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    }
                  ],
                  "id": 187,
                  "modifierName": {
                    "argumentTypes": null,
                    "id": 185,
                    "name": "only_owner",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 167,
                    "src": "873:10:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_modifier$_t_bytes32_$",
                      "typeString": "modifier (bytes32)"
                    }
                  },
                  "nodeType": "ModifierInvocation",
                  "src": "873:16:2"
                }
              ],
              "name": "setOwner",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 184,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 181,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 202,
                    "src": "837:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 180,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "837:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 183,
                    "name": "owner",
                    "nodeType": "VariableDeclaration",
                    "scope": 202,
                    "src": "851:13:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 182,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "851:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "836:29:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 188,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "890:0:2"
              },
              "scope": 320,
              "src": "819:146:2",
              "stateMutability": "nonpayable",
              "superFunction": 106,
              "visibility": "public"
            },
            {
              "body": {
                "id": 233,
                "nodeType": "Block",
                "src": "1370:131:2",
                "statements": [
                  {
                    "assignments": [
                      214
                    ],
                    "declarations": [
                      {
                        "constant": false,
                        "id": 214,
                        "name": "subnode",
                        "nodeType": "VariableDeclaration",
                        "scope": 234,
                        "src": "1380:11:2",
                        "stateVariable": false,
                        "storageLocation": "default",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes32",
                          "typeString": "bytes32"
                        },
                        "typeName": null,
                        "value": null,
                        "visibility": "internal"
                      }
                    ],
                    "id": 219,
                    "initialValue": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "id": 216,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 204,
                          "src": "1404:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 217,
                          "name": "label",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 206,
                          "src": "1410:5:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        ],
                        "id": 215,
                        "name": "keccak256",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 5057,
                        "src": "1394:9:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_sha3_pure$__$returns$_t_bytes32_$",
                          "typeString": "function () pure returns (bytes32)"
                        }
                      },
                      "id": 218,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "1394:22:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "nodeType": "VariableDeclarationStatement",
                    "src": "1380:36:2"
                  },
                  {
                    "expression": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "id": 221,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 204,
                          "src": "1435:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 222,
                          "name": "label",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 206,
                          "src": "1441:5:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 223,
                          "name": "owner",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 208,
                          "src": "1448:5:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        ],
                        "id": 220,
                        "name": "NewOwner",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 65,
                        "src": "1426:8:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_event_nonpayable$_t_bytes32_$_t_bytes32_$_t_address_$returns$__$",
                          "typeString": "function (bytes32,bytes32,address)"
                        }
                      },
                      "id": 224,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "1426:28:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 225,
                    "nodeType": "ExpressionStatement",
                    "src": "1426:28:2"
                  },
                  {
                    "expression": {
                      "argumentTypes": null,
                      "id": 231,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "leftHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "baseExpression": {
                            "argumentTypes": null,
                            "id": 226,
                            "name": "records",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 151,
                            "src": "1464:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                              "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                            }
                          },
                          "id": 228,
                          "indexExpression": {
                            "argumentTypes": null,
                            "id": 227,
                            "name": "subnode",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 214,
                            "src": "1472:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes32",
                              "typeString": "bytes32"
                            }
                          },
                          "isConstant": false,
                          "isLValue": true,
                          "isPure": false,
                          "lValueRequested": false,
                          "nodeType": "IndexAccess",
                          "src": "1464:16:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_Record_$147_storage",
                            "typeString": "struct ENSRegistry.Record storage ref"
                          }
                        },
                        "id": 229,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": true,
                        "memberName": "owner",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 142,
                        "src": "1464:22:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "nodeType": "Assignment",
                      "operator": "=",
                      "rightHandSide": {
                        "argumentTypes": null,
                        "id": 230,
                        "name": "owner",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 208,
                        "src": "1489:5:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "src": "1464:30:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 232,
                    "nodeType": "ExpressionStatement",
                    "src": "1464:30:2"
                  }
                ]
              },
              "documentation": "@dev Transfers ownership of a subnode keccak256(node, label) to a new address. May only be called by the owner of the parent node.\n@param node The parent node.\n@param label The hash of the label specifying the subnode.\n@param owner The address of the new owner.",
              "id": 234,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": false,
              "modifiers": [
                {
                  "arguments": [
                    {
                      "argumentTypes": null,
                      "id": 211,
                      "name": "node",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 204,
                      "src": "1364:4:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    }
                  ],
                  "id": 212,
                  "modifierName": {
                    "argumentTypes": null,
                    "id": 210,
                    "name": "only_owner",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 167,
                    "src": "1353:10:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_modifier$_t_bytes32_$",
                      "typeString": "modifier (bytes32)"
                    }
                  },
                  "nodeType": "ModifierInvocation",
                  "src": "1353:16:2"
                }
              ],
              "name": "setSubnodeOwner",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 209,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 204,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 234,
                    "src": "1302:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 203,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "1302:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 206,
                    "name": "label",
                    "nodeType": "VariableDeclaration",
                    "scope": 234,
                    "src": "1316:13:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 205,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "1316:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 208,
                    "name": "owner",
                    "nodeType": "VariableDeclaration",
                    "scope": 234,
                    "src": "1331:13:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 207,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "1331:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "1301:44:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 213,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "1370:0:2"
              },
              "scope": 320,
              "src": "1277:224:2",
              "stateMutability": "nonpayable",
              "superFunction": 92,
              "visibility": "public"
            },
            {
              "body": {
                "id": 256,
                "nodeType": "Block",
                "src": "1753:87:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "id": 245,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 236,
                          "src": "1775:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 246,
                          "name": "resolver",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 238,
                          "src": "1781:8:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_address",
                            "typeString": "address"
                          }
                        ],
                        "id": 244,
                        "name": "NewResolver",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 77,
                        "src": "1763:11:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_event_nonpayable$_t_bytes32_$_t_address_$returns$__$",
                          "typeString": "function (bytes32,address)"
                        }
                      },
                      "id": 247,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "1763:27:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 248,
                    "nodeType": "ExpressionStatement",
                    "src": "1763:27:2"
                  },
                  {
                    "expression": {
                      "argumentTypes": null,
                      "id": 254,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "leftHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "baseExpression": {
                            "argumentTypes": null,
                            "id": 249,
                            "name": "records",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 151,
                            "src": "1800:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                              "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                            }
                          },
                          "id": 251,
                          "indexExpression": {
                            "argumentTypes": null,
                            "id": 250,
                            "name": "node",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 236,
                            "src": "1808:4:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes32",
                              "typeString": "bytes32"
                            }
                          },
                          "isConstant": false,
                          "isLValue": true,
                          "isPure": false,
                          "lValueRequested": false,
                          "nodeType": "IndexAccess",
                          "src": "1800:13:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_Record_$147_storage",
                            "typeString": "struct ENSRegistry.Record storage ref"
                          }
                        },
                        "id": 252,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": true,
                        "memberName": "resolver",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 144,
                        "src": "1800:22:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "nodeType": "Assignment",
                      "operator": "=",
                      "rightHandSide": {
                        "argumentTypes": null,
                        "id": 253,
                        "name": "resolver",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 238,
                        "src": "1825:8:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "src": "1800:33:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 255,
                    "nodeType": "ExpressionStatement",
                    "src": "1800:33:2"
                  }
                ]
              },
              "documentation": "@dev Sets the resolver address for the specified node.\n@param node The node to update.\n@param resolver The address of the resolver.",
              "id": 257,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": false,
              "modifiers": [
                {
                  "arguments": [
                    {
                      "argumentTypes": null,
                      "id": 241,
                      "name": "node",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 236,
                      "src": "1747:4:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    }
                  ],
                  "id": 242,
                  "modifierName": {
                    "argumentTypes": null,
                    "id": 240,
                    "name": "only_owner",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 167,
                    "src": "1736:10:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_modifier$_t_bytes32_$",
                      "typeString": "modifier (bytes32)"
                    }
                  },
                  "nodeType": "ModifierInvocation",
                  "src": "1736:16:2"
                }
              ],
              "name": "setResolver",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 239,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 236,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 257,
                    "src": "1697:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 235,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "1697:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 238,
                    "name": "resolver",
                    "nodeType": "VariableDeclaration",
                    "scope": 257,
                    "src": "1711:16:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 237,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "1711:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "1696:32:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 243,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "1753:0:2"
              },
              "scope": 320,
              "src": "1676:164:2",
              "stateMutability": "nonpayable",
              "superFunction": 99,
              "visibility": "public"
            },
            {
              "body": {
                "id": 279,
                "nodeType": "Block",
                "src": "2054:67:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "id": 268,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 259,
                          "src": "2071:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 269,
                          "name": "ttl",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 261,
                          "src": "2077:3:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint64",
                            "typeString": "uint64"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_uint64",
                            "typeString": "uint64"
                          }
                        ],
                        "id": 267,
                        "name": "NewTTL",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 83,
                        "src": "2064:6:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_event_nonpayable$_t_bytes32_$_t_uint64_$returns$__$",
                          "typeString": "function (bytes32,uint64)"
                        }
                      },
                      "id": 270,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "2064:17:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_tuple$__$",
                        "typeString": "tuple()"
                      }
                    },
                    "id": 271,
                    "nodeType": "ExpressionStatement",
                    "src": "2064:17:2"
                  },
                  {
                    "expression": {
                      "argumentTypes": null,
                      "id": 277,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "leftHandSide": {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "baseExpression": {
                            "argumentTypes": null,
                            "id": 272,
                            "name": "records",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 151,
                            "src": "2091:7:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                              "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                            }
                          },
                          "id": 274,
                          "indexExpression": {
                            "argumentTypes": null,
                            "id": 273,
                            "name": "node",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 259,
                            "src": "2099:4:2",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes32",
                              "typeString": "bytes32"
                            }
                          },
                          "isConstant": false,
                          "isLValue": true,
                          "isPure": false,
                          "lValueRequested": false,
                          "nodeType": "IndexAccess",
                          "src": "2091:13:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_Record_$147_storage",
                            "typeString": "struct ENSRegistry.Record storage ref"
                          }
                        },
                        "id": 275,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": true,
                        "memberName": "ttl",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 146,
                        "src": "2091:17:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint64",
                          "typeString": "uint64"
                        }
                      },
                      "nodeType": "Assignment",
                      "operator": "=",
                      "rightHandSide": {
                        "argumentTypes": null,
                        "id": 276,
                        "name": "ttl",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 261,
                        "src": "2111:3:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint64",
                          "typeString": "uint64"
                        }
                      },
                      "src": "2091:23:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint64",
                        "typeString": "uint64"
                      }
                    },
                    "id": 278,
                    "nodeType": "ExpressionStatement",
                    "src": "2091:23:2"
                  }
                ]
              },
              "documentation": "@dev Sets the TTL for the specified node.\n@param node The node to update.\n@param ttl The TTL in seconds.",
              "id": 280,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": false,
              "modifiers": [
                {
                  "arguments": [
                    {
                      "argumentTypes": null,
                      "id": 264,
                      "name": "node",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 259,
                      "src": "2048:4:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    }
                  ],
                  "id": 265,
                  "modifierName": {
                    "argumentTypes": null,
                    "id": 263,
                    "name": "only_owner",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 167,
                    "src": "2037:10:2",
                    "typeDescriptions": {
                      "typeIdentifier": "t_modifier$_t_bytes32_$",
                      "typeString": "modifier (bytes32)"
                    }
                  },
                  "nodeType": "ModifierInvocation",
                  "src": "2037:16:2"
                }
              ],
              "name": "setTTL",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 262,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 259,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 280,
                    "src": "2004:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 258,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "2004:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  },
                  {
                    "constant": false,
                    "id": 261,
                    "name": "ttl",
                    "nodeType": "VariableDeclaration",
                    "scope": 280,
                    "src": "2018:10:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint64",
                      "typeString": "uint64"
                    },
                    "typeName": {
                      "id": 260,
                      "name": "uint64",
                      "nodeType": "ElementaryTypeName",
                      "src": "2018:6:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint64",
                        "typeString": "uint64"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2003:26:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 266,
                "nodeType": "ParameterList",
                "parameters": [],
                "src": "2054:0:2"
              },
              "scope": 320,
              "src": "1988:133:2",
              "stateMutability": "nonpayable",
              "superFunction": 113,
              "visibility": "public"
            },
            {
              "body": {
                "id": 292,
                "nodeType": "Block",
                "src": "2340:43:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "expression": {
                        "argumentTypes": null,
                        "baseExpression": {
                          "argumentTypes": null,
                          "id": 287,
                          "name": "records",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 151,
                          "src": "2357:7:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                            "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                          }
                        },
                        "id": 289,
                        "indexExpression": {
                          "argumentTypes": null,
                          "id": 288,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 282,
                          "src": "2365:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": false,
                        "nodeType": "IndexAccess",
                        "src": "2357:13:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Record_$147_storage",
                          "typeString": "struct ENSRegistry.Record storage ref"
                        }
                      },
                      "id": 290,
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "owner",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 142,
                      "src": "2357:19:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "functionReturnParameters": 286,
                    "id": 291,
                    "nodeType": "Return",
                    "src": "2350:26:2"
                  }
                ]
              },
              "documentation": "@dev Returns the address that owns the specified node.\n@param node The specified node.\n@return address of the owner.",
              "id": 293,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": true,
              "modifiers": [],
              "name": "owner",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 283,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 282,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 293,
                    "src": "2296:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 281,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "2296:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2295:14:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 286,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 285,
                    "name": "",
                    "nodeType": "VariableDeclaration",
                    "scope": 293,
                    "src": "2331:7:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 284,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "2331:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2330:9:2"
              },
              "scope": 320,
              "src": "2281:102:2",
              "stateMutability": "view",
              "superFunction": 120,
              "visibility": "public"
            },
            {
              "body": {
                "id": 305,
                "nodeType": "Block",
                "src": "2618:46:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "expression": {
                        "argumentTypes": null,
                        "baseExpression": {
                          "argumentTypes": null,
                          "id": 300,
                          "name": "records",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 151,
                          "src": "2635:7:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                            "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                          }
                        },
                        "id": 302,
                        "indexExpression": {
                          "argumentTypes": null,
                          "id": 301,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 295,
                          "src": "2643:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": false,
                        "nodeType": "IndexAccess",
                        "src": "2635:13:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Record_$147_storage",
                          "typeString": "struct ENSRegistry.Record storage ref"
                        }
                      },
                      "id": 303,
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "resolver",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 144,
                      "src": "2635:22:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "functionReturnParameters": 299,
                    "id": 304,
                    "nodeType": "Return",
                    "src": "2628:29:2"
                  }
                ]
              },
              "documentation": "@dev Returns the address of the resolver for the specified node.\n@param node The specified node.\n@return address of the resolver.",
              "id": 306,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": true,
              "modifiers": [],
              "name": "resolver",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 296,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 295,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 306,
                    "src": "2574:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 294,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "2574:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2573:14:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 299,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 298,
                    "name": "",
                    "nodeType": "VariableDeclaration",
                    "scope": 306,
                    "src": "2609:7:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "typeName": {
                      "id": 297,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "2609:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2608:9:2"
              },
              "scope": 320,
              "src": "2556:108:2",
              "stateMutability": "view",
              "superFunction": 127,
              "visibility": "public"
            },
            {
              "body": {
                "id": 318,
                "nodeType": "Block",
                "src": "2888:41:2",
                "statements": [
                  {
                    "expression": {
                      "argumentTypes": null,
                      "expression": {
                        "argumentTypes": null,
                        "baseExpression": {
                          "argumentTypes": null,
                          "id": 313,
                          "name": "records",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 151,
                          "src": "2905:7:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_mapping$_t_bytes32_$_t_struct$_Record_$147_storage_$",
                            "typeString": "mapping(bytes32 => struct ENSRegistry.Record storage ref)"
                          }
                        },
                        "id": 315,
                        "indexExpression": {
                          "argumentTypes": null,
                          "id": 314,
                          "name": "node",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 308,
                          "src": "2913:4:2",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": false,
                        "nodeType": "IndexAccess",
                        "src": "2905:13:2",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Record_$147_storage",
                          "typeString": "struct ENSRegistry.Record storage ref"
                        }
                      },
                      "id": 316,
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "ttl",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 146,
                      "src": "2905:17:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint64",
                        "typeString": "uint64"
                      }
                    },
                    "functionReturnParameters": 312,
                    "id": 317,
                    "nodeType": "Return",
                    "src": "2898:24:2"
                  }
                ]
              },
              "documentation": "@dev Returns the TTL of a node, and any records associated with it.\n@param node The specified node.\n@return ttl of the node.",
              "id": 319,
              "implemented": true,
              "isConstructor": false,
              "isDeclaredConst": true,
              "modifiers": [],
              "name": "ttl",
              "nodeType": "FunctionDefinition",
              "parameters": {
                "id": 309,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 308,
                    "name": "node",
                    "nodeType": "VariableDeclaration",
                    "scope": 319,
                    "src": "2845:12:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    },
                    "typeName": {
                      "id": 307,
                      "name": "bytes32",
                      "nodeType": "ElementaryTypeName",
                      "src": "2845:7:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes32",
                        "typeString": "bytes32"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2844:14:2"
              },
              "payable": false,
              "returnParameters": {
                "id": 312,
                "nodeType": "ParameterList",
                "parameters": [
                  {
                    "constant": false,
                    "id": 311,
                    "name": "",
                    "nodeType": "VariableDeclaration",
                    "scope": 319,
                    "src": "2880:6:2",
                    "stateVariable": false,
                    "storageLocation": "default",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint64",
                      "typeString": "uint64"
                    },
                    "typeName": {
                      "id": 310,
                      "name": "uint64",
                      "nodeType": "ElementaryTypeName",
                      "src": "2880:6:2",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint64",
                        "typeString": "uint64"
                      }
                    },
                    "value": null,
                    "visibility": "internal"
                  }
                ],
                "src": "2879:8:2"
              },
              "scope": 320,
              "src": "2832:97:2",
              "stateMutability": "view",
              "superFunction": 134,
              "visibility": "public"
            }
          ],
          "scope": 321,
          "src": "90:2842:2"
        }
      ],
      "src": "0:2933:2"
    },
    "compiler": {
      "name": "solc",
      "version": "0.4.24+commit.e67f0147.Emscripten.clang"
    },
    "networks": {},
    "schemaVersion": "2.0.1",
    "updatedAt": "2018-11-19T10:39:55.754Z"
  }

  export { contractData }