export default {
  contractName: 'TestContract',
  abi: [
    {
      constant: true,
      inputs: [],
      name: 'value',
      outputs: [
        {
          name: '',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    },
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
          indexed: true,
          name: 'from',
          type: 'address'
        }
      ],
      name: 'ContractCreated',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: 'from',
          type: 'address'
        },
        {
          indexed: false,
          name: 'value',
          type: 'uint256'
        }
      ],
      name: 'EventEmitted',
      type: 'event'
    },
    {
      constant: false,
      inputs: [],
      name: 'incrementValue',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      constant: false,
      inputs: [
        {
          name: 'numberOfEvents',
          type: 'uint256'
        }
      ],
      name: 'emitEvents',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ],
  bytecode:
    '0x608060405234801561001057600080fd5b503373ffffffffffffffffffffffffffffffffffffffff167fcf78cf0d6f3d8371e1075c69c492ab4ec5d8cf23a1a239b6a51a1d00be7ca31260405160405180910390a261021c806100636000396000f300608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633bfd7fd31461005c5780633fa4f24514610073578063d7d58f5b1461009e575b600080fd5b34801561006857600080fd5b506100716100cb565b005b34801561007f57600080fd5b506100886100d9565b6040518082815260200191505060405180910390f35b3480156100aa57600080fd5b506100c9600480360381019080803590602001909291905050506100df565b005b600160005401600081905550565b60005481565b6000600a600054830111151515610184576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001807f4e756d626572206f66206576656e7473202b2076616c7565206d75737420626581526020017f20736d616c6c6572207468616e2031300000000000000000000000000000000081525060400191505060405180910390fd5b600090505b818110156101ec573373ffffffffffffffffffffffffffffffffffffffff167fbb02cddae59d501d1fcf63888ace3fad45eb43ca3387d34e3bb6a29be957e3f1826040518082815260200191505060405180910390a28080600101915050610189565b50505600a165627a7a723058203065be181ef7bfa6a2aec057a91ac590df6010de3d7c0a1f3c49804a6a41c9790029',
  deployedBytecode:
    '0x608060405260043610610057576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680633bfd7fd31461005c5780633fa4f24514610073578063d7d58f5b1461009e575b600080fd5b34801561006857600080fd5b506100716100cb565b005b34801561007f57600080fd5b506100886100d9565b6040518082815260200191505060405180910390f35b3480156100aa57600080fd5b506100c9600480360381019080803590602001909291905050506100df565b005b600160005401600081905550565b60005481565b6000600a600054830111151515610184576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260308152602001807f4e756d626572206f66206576656e7473202b2076616c7565206d75737420626581526020017f20736d616c6c6572207468616e2031300000000000000000000000000000000081525060400191505060405180910390fd5b600090505b818110156101ec573373ffffffffffffffffffffffffffffffffffffffff167fbb02cddae59d501d1fcf63888ace3fad45eb43ca3387d34e3bb6a29be957e3f1826040518082815260200191505060405180910390a28080600101915050610189565b50505600a165627a7a723058203065be181ef7bfa6a2aec057a91ac590df6010de3d7c0a1f3c49804a6a41c9790029',
  sourceMap: '69:550:0:-;;;228:64;8:9:-1;5:2;;;30:1;27;20:12;5:2;228:64:0;276:10;260:27;;;;;;;;;;;;69:550;;;;;;',
  deployedSourceMap:
    '69:550:0:-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;296:61;;8:9:-1;5:2;;;30:1;27;20:12;5:2;296:61:0;;;;;;96:20;;8:9:-1;5:2;;;30:1;27;20:12;5:2;96:20:0;;;;;;;;;;;;;;;;;;;;;;;361:256;;8:9:-1;5:2;;;30:1;27;20:12;5:2;361:256:0;;;;;;;;;;;;;;;;;;;;;;;;;;296:61;351:1;343:5;;:9;335:5;:17;;;;296:61::o;96:20::-;;;;:::o;361:256::-;514:9;452:2;443:5;;426:14;:22;:28;;418:89;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;538:1;534:5;;529:84;545:14;541:1;:18;529:84;;;592:10;579:27;;;604:1;579:27;;;;;;;;;;;;;;;;;;561:3;;;;;;;529:84;;;361:256;;:::o',
  source:
    'pragma solidity ^0.4.24;\n\n// Test smart contract, only for reference\ncontract TestContract {\n\n  uint256 public value;\n\n  event ContractCreated(address indexed from);\n  event EventEmitted(address indexed from, uint256 value);\n\n  constructor() public {\n    emit ContractCreated(msg.sender);\n  }\n\n  function incrementValue() public {\n    value = value + 1;\n  }\n\n  function emitEvents(uint256 numberOfEvents) public {\n    require(numberOfEvents + value <= 10, "Number of events + value must be smaller than 10");\n\n    uint256 i;\n    for (i = 0; i < numberOfEvents; i++) {\n      emit EventEmitted(msg.sender, i);\n    }\n  }\n}\n',
  sourcePath: '/home/dario/Documents/Asset Factory/AssetFactory/contracts/TestContract.sol',
  ast: {
    absolutePath: '/home/dario/Documents/Asset Factory/AssetFactory/contracts/TestContract.sol',
    exportedSymbols: {
      TestContract: [69]
    },
    id: 70,
    nodeType: 'SourceUnit',
    nodes: [
      {
        id: 1,
        literals: ['solidity', '^', '0.4', '.24'],
        nodeType: 'PragmaDirective',
        src: '0:24:0'
      },
      {
        baseContracts: [],
        contractDependencies: [],
        contractKind: 'contract',
        documentation: null,
        fullyImplemented: true,
        id: 69,
        linearizedBaseContracts: [69],
        name: 'TestContract',
        nodeType: 'ContractDefinition',
        nodes: [
          {
            constant: false,
            id: 3,
            name: 'value',
            nodeType: 'VariableDeclaration',
            scope: 69,
            src: '96:20:0',
            stateVariable: true,
            storageLocation: 'default',
            typeDescriptions: {
              typeIdentifier: 't_uint256',
              typeString: 'uint256'
            },
            typeName: {
              id: 2,
              name: 'uint256',
              nodeType: 'ElementaryTypeName',
              src: '96:7:0',
              typeDescriptions: {
                typeIdentifier: 't_uint256',
                typeString: 'uint256'
              }
            },
            value: null,
            visibility: 'public'
          },
          {
            anonymous: false,
            documentation: null,
            id: 7,
            name: 'ContractCreated',
            nodeType: 'EventDefinition',
            parameters: {
              id: 6,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 5,
                  indexed: true,
                  name: 'from',
                  nodeType: 'VariableDeclaration',
                  scope: 7,
                  src: '143:20:0',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 4,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '143:7:0',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '142:22:0'
            },
            src: '121:44:0'
          },
          {
            anonymous: false,
            documentation: null,
            id: 13,
            name: 'EventEmitted',
            nodeType: 'EventDefinition',
            parameters: {
              id: 12,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 9,
                  indexed: true,
                  name: 'from',
                  nodeType: 'VariableDeclaration',
                  scope: 13,
                  src: '187:20:0',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 8,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '187:7:0',
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
                  id: 11,
                  indexed: false,
                  name: 'value',
                  nodeType: 'VariableDeclaration',
                  scope: 13,
                  src: '209:13:0',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_uint256',
                    typeString: 'uint256'
                  },
                  typeName: {
                    id: 10,
                    name: 'uint256',
                    nodeType: 'ElementaryTypeName',
                    src: '209:7:0',
                    typeDescriptions: {
                      typeIdentifier: 't_uint256',
                      typeString: 'uint256'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '186:37:0'
            },
            src: '168:56:0'
          },
          {
            body: {
              id: 21,
              nodeType: 'Block',
              src: '249:43:0',
              statements: [
                {
                  eventCall: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        expression: {
                          argumentTypes: null,
                          id: 17,
                          name: 'msg',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 84,
                          src: '276:3:0',
                          typeDescriptions: {
                            typeIdentifier: 't_magic_message',
                            typeString: 'msg'
                          }
                        },
                        id: 18,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        memberName: 'sender',
                        nodeType: 'MemberAccess',
                        referencedDeclaration: null,
                        src: '276:10:0',
                        typeDescriptions: {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      ],
                      id: 16,
                      name: 'ContractCreated',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 7,
                      src: '260:15:0',
                      typeDescriptions: {
                        typeIdentifier: 't_function_event_nonpayable$_t_address_$returns$__$',
                        typeString: 'function (address)'
                      }
                    },
                    id: 19,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '260:27:0',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 20,
                  nodeType: 'EmitStatement',
                  src: '255:32:0'
                }
              ]
            },
            documentation: null,
            id: 22,
            implemented: true,
            isConstructor: true,
            isDeclaredConst: false,
            modifiers: [],
            name: '',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 14,
              nodeType: 'ParameterList',
              parameters: [],
              src: '239:2:0'
            },
            payable: false,
            returnParameters: {
              id: 15,
              nodeType: 'ParameterList',
              parameters: [],
              src: '249:0:0'
            },
            scope: 69,
            src: '228:64:0',
            stateMutability: 'nonpayable',
            superFunction: null,
            visibility: 'public'
          },
          {
            body: {
              id: 31,
              nodeType: 'Block',
              src: '329:28:0',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    id: 29,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      id: 25,
                      name: 'value',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 3,
                      src: '335:5:0',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      commonType: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      },
                      id: 28,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      leftExpression: {
                        argumentTypes: null,
                        id: 26,
                        name: 'value',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 3,
                        src: '343:5:0',
                        typeDescriptions: {
                          typeIdentifier: 't_uint256',
                          typeString: 'uint256'
                        }
                      },
                      nodeType: 'BinaryOperation',
                      operator: '+',
                      rightExpression: {
                        argumentTypes: null,
                        hexValue: '31',
                        id: 27,
                        isConstant: false,
                        isLValue: false,
                        isPure: true,
                        kind: 'number',
                        lValueRequested: false,
                        nodeType: 'Literal',
                        src: '351:1:0',
                        subdenomination: null,
                        typeDescriptions: {
                          typeIdentifier: 't_rational_1_by_1',
                          typeString: 'int_const 1'
                        },
                        value: '1'
                      },
                      src: '343:9:0',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    src: '335:17:0',
                    typeDescriptions: {
                      typeIdentifier: 't_uint256',
                      typeString: 'uint256'
                    }
                  },
                  id: 30,
                  nodeType: 'ExpressionStatement',
                  src: '335:17:0'
                }
              ]
            },
            documentation: null,
            id: 32,
            implemented: true,
            isConstructor: false,
            isDeclaredConst: false,
            modifiers: [],
            name: 'incrementValue',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 23,
              nodeType: 'ParameterList',
              parameters: [],
              src: '319:2:0'
            },
            payable: false,
            returnParameters: {
              id: 24,
              nodeType: 'ParameterList',
              parameters: [],
              src: '329:0:0'
            },
            scope: 69,
            src: '296:61:0',
            stateMutability: 'nonpayable',
            superFunction: null,
            visibility: 'public'
          },
          {
            body: {
              id: 67,
              nodeType: 'Block',
              src: '412:205:0',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        commonType: {
                          typeIdentifier: 't_uint256',
                          typeString: 'uint256'
                        },
                        id: 42,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        leftExpression: {
                          argumentTypes: null,
                          commonType: {
                            typeIdentifier: 't_uint256',
                            typeString: 'uint256'
                          },
                          id: 40,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          lValueRequested: false,
                          leftExpression: {
                            argumentTypes: null,
                            id: 38,
                            name: 'numberOfEvents',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 34,
                            src: '426:14:0',
                            typeDescriptions: {
                              typeIdentifier: 't_uint256',
                              typeString: 'uint256'
                            }
                          },
                          nodeType: 'BinaryOperation',
                          operator: '+',
                          rightExpression: {
                            argumentTypes: null,
                            id: 39,
                            name: 'value',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 3,
                            src: '443:5:0',
                            typeDescriptions: {
                              typeIdentifier: 't_uint256',
                              typeString: 'uint256'
                            }
                          },
                          src: '426:22:0',
                          typeDescriptions: {
                            typeIdentifier: 't_uint256',
                            typeString: 'uint256'
                          }
                        },
                        nodeType: 'BinaryOperation',
                        operator: '<=',
                        rightExpression: {
                          argumentTypes: null,
                          hexValue: '3130',
                          id: 41,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          kind: 'number',
                          lValueRequested: false,
                          nodeType: 'Literal',
                          src: '452:2:0',
                          subdenomination: null,
                          typeDescriptions: {
                            typeIdentifier: 't_rational_10_by_1',
                            typeString: 'int_const 10'
                          },
                          value: '10'
                        },
                        src: '426:28:0',
                        typeDescriptions: {
                          typeIdentifier: 't_bool',
                          typeString: 'bool'
                        }
                      },
                      {
                        argumentTypes: null,
                        hexValue:
                          '4e756d626572206f66206576656e7473202b2076616c7565206d75737420626520736d616c6c6572207468616e203130',
                        id: 43,
                        isConstant: false,
                        isLValue: false,
                        isPure: true,
                        kind: 'string',
                        lValueRequested: false,
                        nodeType: 'Literal',
                        src: '456:50:0',
                        subdenomination: null,
                        typeDescriptions: {
                          typeIdentifier:
                            't_stringliteral_2f882bc713c2e09d846ead5ac8570c3e9d05c243933447846298ac09541c0116',
                          typeString: 'literal_string "Number of events + value must be smaller than 10"'
                        },
                        value: 'Number of events + value must be smaller than 10'
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
                            't_stringliteral_2f882bc713c2e09d846ead5ac8570c3e9d05c243933447846298ac09541c0116',
                          typeString: 'literal_string "Number of events + value must be smaller than 10"'
                        }
                      ],
                      id: 37,
                      name: 'require',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [87, 88],
                      referencedDeclaration: 88,
                      src: '418:7:0',
                      typeDescriptions: {
                        typeIdentifier: 't_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$',
                        typeString: 'function (bool,string memory) pure'
                      }
                    },
                    id: 44,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '418:89:0',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 45,
                  nodeType: 'ExpressionStatement',
                  src: '418:89:0'
                },
                {
                  assignments: [],
                  declarations: [
                    {
                      constant: false,
                      id: 47,
                      name: 'i',
                      nodeType: 'VariableDeclaration',
                      scope: 68,
                      src: '514:9:0',
                      stateVariable: false,
                      storageLocation: 'default',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      },
                      typeName: {
                        id: 46,
                        name: 'uint256',
                        nodeType: 'ElementaryTypeName',
                        src: '514:7:0',
                        typeDescriptions: {
                          typeIdentifier: 't_uint256',
                          typeString: 'uint256'
                        }
                      },
                      value: null,
                      visibility: 'internal'
                    }
                  ],
                  id: 48,
                  initialValue: null,
                  nodeType: 'VariableDeclarationStatement',
                  src: '514:9:0'
                },
                {
                  body: {
                    id: 65,
                    nodeType: 'Block',
                    src: '566:47:0',
                    statements: [
                      {
                        eventCall: {
                          argumentTypes: null,
                          arguments: [
                            {
                              argumentTypes: null,
                              expression: {
                                argumentTypes: null,
                                id: 60,
                                name: 'msg',
                                nodeType: 'Identifier',
                                overloadedDeclarations: [],
                                referencedDeclaration: 84,
                                src: '592:3:0',
                                typeDescriptions: {
                                  typeIdentifier: 't_magic_message',
                                  typeString: 'msg'
                                }
                              },
                              id: 61,
                              isConstant: false,
                              isLValue: false,
                              isPure: false,
                              lValueRequested: false,
                              memberName: 'sender',
                              nodeType: 'MemberAccess',
                              referencedDeclaration: null,
                              src: '592:10:0',
                              typeDescriptions: {
                                typeIdentifier: 't_address',
                                typeString: 'address'
                              }
                            },
                            {
                              argumentTypes: null,
                              id: 62,
                              name: 'i',
                              nodeType: 'Identifier',
                              overloadedDeclarations: [],
                              referencedDeclaration: 47,
                              src: '604:1:0',
                              typeDescriptions: {
                                typeIdentifier: 't_uint256',
                                typeString: 'uint256'
                              }
                            }
                          ],
                          expression: {
                            argumentTypes: [
                              {
                                typeIdentifier: 't_address',
                                typeString: 'address'
                              },
                              {
                                typeIdentifier: 't_uint256',
                                typeString: 'uint256'
                              }
                            ],
                            id: 59,
                            name: 'EventEmitted',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 13,
                            src: '579:12:0',
                            typeDescriptions: {
                              typeIdentifier: 't_function_event_nonpayable$_t_address_$_t_uint256_$returns$__$',
                              typeString: 'function (address,uint256)'
                            }
                          },
                          id: 63,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          kind: 'functionCall',
                          lValueRequested: false,
                          names: [],
                          nodeType: 'FunctionCall',
                          src: '579:27:0',
                          typeDescriptions: {
                            typeIdentifier: 't_tuple$__$',
                            typeString: 'tuple()'
                          }
                        },
                        id: 64,
                        nodeType: 'EmitStatement',
                        src: '574:32:0'
                      }
                    ]
                  },
                  condition: {
                    argumentTypes: null,
                    commonType: {
                      typeIdentifier: 't_uint256',
                      typeString: 'uint256'
                    },
                    id: 55,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftExpression: {
                      argumentTypes: null,
                      id: 53,
                      name: 'i',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 47,
                      src: '541:1:0',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    nodeType: 'BinaryOperation',
                    operator: '<',
                    rightExpression: {
                      argumentTypes: null,
                      id: 54,
                      name: 'numberOfEvents',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 34,
                      src: '545:14:0',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    src: '541:18:0',
                    typeDescriptions: {
                      typeIdentifier: 't_bool',
                      typeString: 'bool'
                    }
                  },
                  id: 66,
                  initializationExpression: {
                    expression: {
                      argumentTypes: null,
                      id: 51,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      leftHandSide: {
                        argumentTypes: null,
                        id: 49,
                        name: 'i',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 47,
                        src: '534:1:0',
                        typeDescriptions: {
                          typeIdentifier: 't_uint256',
                          typeString: 'uint256'
                        }
                      },
                      nodeType: 'Assignment',
                      operator: '=',
                      rightHandSide: {
                        argumentTypes: null,
                        hexValue: '30',
                        id: 50,
                        isConstant: false,
                        isLValue: false,
                        isPure: true,
                        kind: 'number',
                        lValueRequested: false,
                        nodeType: 'Literal',
                        src: '538:1:0',
                        subdenomination: null,
                        typeDescriptions: {
                          typeIdentifier: 't_rational_0_by_1',
                          typeString: 'int_const 0'
                        },
                        value: '0'
                      },
                      src: '534:5:0',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    id: 52,
                    nodeType: 'ExpressionStatement',
                    src: '534:5:0'
                  },
                  loopExpression: {
                    expression: {
                      argumentTypes: null,
                      id: 57,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      nodeType: 'UnaryOperation',
                      operator: '++',
                      prefix: false,
                      src: '561:3:0',
                      subExpression: {
                        argumentTypes: null,
                        id: 56,
                        name: 'i',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 47,
                        src: '561:1:0',
                        typeDescriptions: {
                          typeIdentifier: 't_uint256',
                          typeString: 'uint256'
                        }
                      },
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    id: 58,
                    nodeType: 'ExpressionStatement',
                    src: '561:3:0'
                  },
                  nodeType: 'ForStatement',
                  src: '529:84:0'
                }
              ]
            },
            documentation: null,
            id: 68,
            implemented: true,
            isConstructor: false,
            isDeclaredConst: false,
            modifiers: [],
            name: 'emitEvents',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 35,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 34,
                  name: 'numberOfEvents',
                  nodeType: 'VariableDeclaration',
                  scope: 68,
                  src: '381:22:0',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_uint256',
                    typeString: 'uint256'
                  },
                  typeName: {
                    id: 33,
                    name: 'uint256',
                    nodeType: 'ElementaryTypeName',
                    src: '381:7:0',
                    typeDescriptions: {
                      typeIdentifier: 't_uint256',
                      typeString: 'uint256'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '380:24:0'
            },
            payable: false,
            returnParameters: {
              id: 36,
              nodeType: 'ParameterList',
              parameters: [],
              src: '412:0:0'
            },
            scope: 69,
            src: '361:256:0',
            stateMutability: 'nonpayable',
            superFunction: null,
            visibility: 'public'
          }
        ],
        scope: 70,
        src: '69:550:0'
      }
    ],
    src: '0:620:0'
  },
  legacyAST: {
    absolutePath: '/home/dario/Documents/Asset Factory/AssetFactory/contracts/TestContract.sol',
    exportedSymbols: {
      TestContract: [69]
    },
    id: 70,
    nodeType: 'SourceUnit',
    nodes: [
      {
        id: 1,
        literals: ['solidity', '^', '0.4', '.24'],
        nodeType: 'PragmaDirective',
        src: '0:24:0'
      },
      {
        baseContracts: [],
        contractDependencies: [],
        contractKind: 'contract',
        documentation: null,
        fullyImplemented: true,
        id: 69,
        linearizedBaseContracts: [69],
        name: 'TestContract',
        nodeType: 'ContractDefinition',
        nodes: [
          {
            constant: false,
            id: 3,
            name: 'value',
            nodeType: 'VariableDeclaration',
            scope: 69,
            src: '96:20:0',
            stateVariable: true,
            storageLocation: 'default',
            typeDescriptions: {
              typeIdentifier: 't_uint256',
              typeString: 'uint256'
            },
            typeName: {
              id: 2,
              name: 'uint256',
              nodeType: 'ElementaryTypeName',
              src: '96:7:0',
              typeDescriptions: {
                typeIdentifier: 't_uint256',
                typeString: 'uint256'
              }
            },
            value: null,
            visibility: 'public'
          },
          {
            anonymous: false,
            documentation: null,
            id: 7,
            name: 'ContractCreated',
            nodeType: 'EventDefinition',
            parameters: {
              id: 6,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 5,
                  indexed: true,
                  name: 'from',
                  nodeType: 'VariableDeclaration',
                  scope: 7,
                  src: '143:20:0',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 4,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '143:7:0',
                    typeDescriptions: {
                      typeIdentifier: 't_address',
                      typeString: 'address'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '142:22:0'
            },
            src: '121:44:0'
          },
          {
            anonymous: false,
            documentation: null,
            id: 13,
            name: 'EventEmitted',
            nodeType: 'EventDefinition',
            parameters: {
              id: 12,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 9,
                  indexed: true,
                  name: 'from',
                  nodeType: 'VariableDeclaration',
                  scope: 13,
                  src: '187:20:0',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_address',
                    typeString: 'address'
                  },
                  typeName: {
                    id: 8,
                    name: 'address',
                    nodeType: 'ElementaryTypeName',
                    src: '187:7:0',
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
                  id: 11,
                  indexed: false,
                  name: 'value',
                  nodeType: 'VariableDeclaration',
                  scope: 13,
                  src: '209:13:0',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_uint256',
                    typeString: 'uint256'
                  },
                  typeName: {
                    id: 10,
                    name: 'uint256',
                    nodeType: 'ElementaryTypeName',
                    src: '209:7:0',
                    typeDescriptions: {
                      typeIdentifier: 't_uint256',
                      typeString: 'uint256'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '186:37:0'
            },
            src: '168:56:0'
          },
          {
            body: {
              id: 21,
              nodeType: 'Block',
              src: '249:43:0',
              statements: [
                {
                  eventCall: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        expression: {
                          argumentTypes: null,
                          id: 17,
                          name: 'msg',
                          nodeType: 'Identifier',
                          overloadedDeclarations: [],
                          referencedDeclaration: 84,
                          src: '276:3:0',
                          typeDescriptions: {
                            typeIdentifier: 't_magic_message',
                            typeString: 'msg'
                          }
                        },
                        id: 18,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        memberName: 'sender',
                        nodeType: 'MemberAccess',
                        referencedDeclaration: null,
                        src: '276:10:0',
                        typeDescriptions: {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      }
                    ],
                    expression: {
                      argumentTypes: [
                        {
                          typeIdentifier: 't_address',
                          typeString: 'address'
                        }
                      ],
                      id: 16,
                      name: 'ContractCreated',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 7,
                      src: '260:15:0',
                      typeDescriptions: {
                        typeIdentifier: 't_function_event_nonpayable$_t_address_$returns$__$',
                        typeString: 'function (address)'
                      }
                    },
                    id: 19,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '260:27:0',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 20,
                  nodeType: 'EmitStatement',
                  src: '255:32:0'
                }
              ]
            },
            documentation: null,
            id: 22,
            implemented: true,
            isConstructor: true,
            isDeclaredConst: false,
            modifiers: [],
            name: '',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 14,
              nodeType: 'ParameterList',
              parameters: [],
              src: '239:2:0'
            },
            payable: false,
            returnParameters: {
              id: 15,
              nodeType: 'ParameterList',
              parameters: [],
              src: '249:0:0'
            },
            scope: 69,
            src: '228:64:0',
            stateMutability: 'nonpayable',
            superFunction: null,
            visibility: 'public'
          },
          {
            body: {
              id: 31,
              nodeType: 'Block',
              src: '329:28:0',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    id: 29,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftHandSide: {
                      argumentTypes: null,
                      id: 25,
                      name: 'value',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 3,
                      src: '335:5:0',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    nodeType: 'Assignment',
                    operator: '=',
                    rightHandSide: {
                      argumentTypes: null,
                      commonType: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      },
                      id: 28,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      leftExpression: {
                        argumentTypes: null,
                        id: 26,
                        name: 'value',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 3,
                        src: '343:5:0',
                        typeDescriptions: {
                          typeIdentifier: 't_uint256',
                          typeString: 'uint256'
                        }
                      },
                      nodeType: 'BinaryOperation',
                      operator: '+',
                      rightExpression: {
                        argumentTypes: null,
                        hexValue: '31',
                        id: 27,
                        isConstant: false,
                        isLValue: false,
                        isPure: true,
                        kind: 'number',
                        lValueRequested: false,
                        nodeType: 'Literal',
                        src: '351:1:0',
                        subdenomination: null,
                        typeDescriptions: {
                          typeIdentifier: 't_rational_1_by_1',
                          typeString: 'int_const 1'
                        },
                        value: '1'
                      },
                      src: '343:9:0',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    src: '335:17:0',
                    typeDescriptions: {
                      typeIdentifier: 't_uint256',
                      typeString: 'uint256'
                    }
                  },
                  id: 30,
                  nodeType: 'ExpressionStatement',
                  src: '335:17:0'
                }
              ]
            },
            documentation: null,
            id: 32,
            implemented: true,
            isConstructor: false,
            isDeclaredConst: false,
            modifiers: [],
            name: 'incrementValue',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 23,
              nodeType: 'ParameterList',
              parameters: [],
              src: '319:2:0'
            },
            payable: false,
            returnParameters: {
              id: 24,
              nodeType: 'ParameterList',
              parameters: [],
              src: '329:0:0'
            },
            scope: 69,
            src: '296:61:0',
            stateMutability: 'nonpayable',
            superFunction: null,
            visibility: 'public'
          },
          {
            body: {
              id: 67,
              nodeType: 'Block',
              src: '412:205:0',
              statements: [
                {
                  expression: {
                    argumentTypes: null,
                    arguments: [
                      {
                        argumentTypes: null,
                        commonType: {
                          typeIdentifier: 't_uint256',
                          typeString: 'uint256'
                        },
                        id: 42,
                        isConstant: false,
                        isLValue: false,
                        isPure: false,
                        lValueRequested: false,
                        leftExpression: {
                          argumentTypes: null,
                          commonType: {
                            typeIdentifier: 't_uint256',
                            typeString: 'uint256'
                          },
                          id: 40,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          lValueRequested: false,
                          leftExpression: {
                            argumentTypes: null,
                            id: 38,
                            name: 'numberOfEvents',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 34,
                            src: '426:14:0',
                            typeDescriptions: {
                              typeIdentifier: 't_uint256',
                              typeString: 'uint256'
                            }
                          },
                          nodeType: 'BinaryOperation',
                          operator: '+',
                          rightExpression: {
                            argumentTypes: null,
                            id: 39,
                            name: 'value',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 3,
                            src: '443:5:0',
                            typeDescriptions: {
                              typeIdentifier: 't_uint256',
                              typeString: 'uint256'
                            }
                          },
                          src: '426:22:0',
                          typeDescriptions: {
                            typeIdentifier: 't_uint256',
                            typeString: 'uint256'
                          }
                        },
                        nodeType: 'BinaryOperation',
                        operator: '<=',
                        rightExpression: {
                          argumentTypes: null,
                          hexValue: '3130',
                          id: 41,
                          isConstant: false,
                          isLValue: false,
                          isPure: true,
                          kind: 'number',
                          lValueRequested: false,
                          nodeType: 'Literal',
                          src: '452:2:0',
                          subdenomination: null,
                          typeDescriptions: {
                            typeIdentifier: 't_rational_10_by_1',
                            typeString: 'int_const 10'
                          },
                          value: '10'
                        },
                        src: '426:28:0',
                        typeDescriptions: {
                          typeIdentifier: 't_bool',
                          typeString: 'bool'
                        }
                      },
                      {
                        argumentTypes: null,
                        hexValue:
                          '4e756d626572206f66206576656e7473202b2076616c7565206d75737420626520736d616c6c6572207468616e203130',
                        id: 43,
                        isConstant: false,
                        isLValue: false,
                        isPure: true,
                        kind: 'string',
                        lValueRequested: false,
                        nodeType: 'Literal',
                        src: '456:50:0',
                        subdenomination: null,
                        typeDescriptions: {
                          typeIdentifier:
                            't_stringliteral_2f882bc713c2e09d846ead5ac8570c3e9d05c243933447846298ac09541c0116',
                          typeString: 'literal_string "Number of events + value must be smaller than 10"'
                        },
                        value: 'Number of events + value must be smaller than 10'
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
                            't_stringliteral_2f882bc713c2e09d846ead5ac8570c3e9d05c243933447846298ac09541c0116',
                          typeString: 'literal_string "Number of events + value must be smaller than 10"'
                        }
                      ],
                      id: 37,
                      name: 'require',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [87, 88],
                      referencedDeclaration: 88,
                      src: '418:7:0',
                      typeDescriptions: {
                        typeIdentifier: 't_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$',
                        typeString: 'function (bool,string memory) pure'
                      }
                    },
                    id: 44,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    kind: 'functionCall',
                    lValueRequested: false,
                    names: [],
                    nodeType: 'FunctionCall',
                    src: '418:89:0',
                    typeDescriptions: {
                      typeIdentifier: 't_tuple$__$',
                      typeString: 'tuple()'
                    }
                  },
                  id: 45,
                  nodeType: 'ExpressionStatement',
                  src: '418:89:0'
                },
                {
                  assignments: [],
                  declarations: [
                    {
                      constant: false,
                      id: 47,
                      name: 'i',
                      nodeType: 'VariableDeclaration',
                      scope: 68,
                      src: '514:9:0',
                      stateVariable: false,
                      storageLocation: 'default',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      },
                      typeName: {
                        id: 46,
                        name: 'uint256',
                        nodeType: 'ElementaryTypeName',
                        src: '514:7:0',
                        typeDescriptions: {
                          typeIdentifier: 't_uint256',
                          typeString: 'uint256'
                        }
                      },
                      value: null,
                      visibility: 'internal'
                    }
                  ],
                  id: 48,
                  initialValue: null,
                  nodeType: 'VariableDeclarationStatement',
                  src: '514:9:0'
                },
                {
                  body: {
                    id: 65,
                    nodeType: 'Block',
                    src: '566:47:0',
                    statements: [
                      {
                        eventCall: {
                          argumentTypes: null,
                          arguments: [
                            {
                              argumentTypes: null,
                              expression: {
                                argumentTypes: null,
                                id: 60,
                                name: 'msg',
                                nodeType: 'Identifier',
                                overloadedDeclarations: [],
                                referencedDeclaration: 84,
                                src: '592:3:0',
                                typeDescriptions: {
                                  typeIdentifier: 't_magic_message',
                                  typeString: 'msg'
                                }
                              },
                              id: 61,
                              isConstant: false,
                              isLValue: false,
                              isPure: false,
                              lValueRequested: false,
                              memberName: 'sender',
                              nodeType: 'MemberAccess',
                              referencedDeclaration: null,
                              src: '592:10:0',
                              typeDescriptions: {
                                typeIdentifier: 't_address',
                                typeString: 'address'
                              }
                            },
                            {
                              argumentTypes: null,
                              id: 62,
                              name: 'i',
                              nodeType: 'Identifier',
                              overloadedDeclarations: [],
                              referencedDeclaration: 47,
                              src: '604:1:0',
                              typeDescriptions: {
                                typeIdentifier: 't_uint256',
                                typeString: 'uint256'
                              }
                            }
                          ],
                          expression: {
                            argumentTypes: [
                              {
                                typeIdentifier: 't_address',
                                typeString: 'address'
                              },
                              {
                                typeIdentifier: 't_uint256',
                                typeString: 'uint256'
                              }
                            ],
                            id: 59,
                            name: 'EventEmitted',
                            nodeType: 'Identifier',
                            overloadedDeclarations: [],
                            referencedDeclaration: 13,
                            src: '579:12:0',
                            typeDescriptions: {
                              typeIdentifier: 't_function_event_nonpayable$_t_address_$_t_uint256_$returns$__$',
                              typeString: 'function (address,uint256)'
                            }
                          },
                          id: 63,
                          isConstant: false,
                          isLValue: false,
                          isPure: false,
                          kind: 'functionCall',
                          lValueRequested: false,
                          names: [],
                          nodeType: 'FunctionCall',
                          src: '579:27:0',
                          typeDescriptions: {
                            typeIdentifier: 't_tuple$__$',
                            typeString: 'tuple()'
                          }
                        },
                        id: 64,
                        nodeType: 'EmitStatement',
                        src: '574:32:0'
                      }
                    ]
                  },
                  condition: {
                    argumentTypes: null,
                    commonType: {
                      typeIdentifier: 't_uint256',
                      typeString: 'uint256'
                    },
                    id: 55,
                    isConstant: false,
                    isLValue: false,
                    isPure: false,
                    lValueRequested: false,
                    leftExpression: {
                      argumentTypes: null,
                      id: 53,
                      name: 'i',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 47,
                      src: '541:1:0',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    nodeType: 'BinaryOperation',
                    operator: '<',
                    rightExpression: {
                      argumentTypes: null,
                      id: 54,
                      name: 'numberOfEvents',
                      nodeType: 'Identifier',
                      overloadedDeclarations: [],
                      referencedDeclaration: 34,
                      src: '545:14:0',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    src: '541:18:0',
                    typeDescriptions: {
                      typeIdentifier: 't_bool',
                      typeString: 'bool'
                    }
                  },
                  id: 66,
                  initializationExpression: {
                    expression: {
                      argumentTypes: null,
                      id: 51,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      leftHandSide: {
                        argumentTypes: null,
                        id: 49,
                        name: 'i',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 47,
                        src: '534:1:0',
                        typeDescriptions: {
                          typeIdentifier: 't_uint256',
                          typeString: 'uint256'
                        }
                      },
                      nodeType: 'Assignment',
                      operator: '=',
                      rightHandSide: {
                        argumentTypes: null,
                        hexValue: '30',
                        id: 50,
                        isConstant: false,
                        isLValue: false,
                        isPure: true,
                        kind: 'number',
                        lValueRequested: false,
                        nodeType: 'Literal',
                        src: '538:1:0',
                        subdenomination: null,
                        typeDescriptions: {
                          typeIdentifier: 't_rational_0_by_1',
                          typeString: 'int_const 0'
                        },
                        value: '0'
                      },
                      src: '534:5:0',
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    id: 52,
                    nodeType: 'ExpressionStatement',
                    src: '534:5:0'
                  },
                  loopExpression: {
                    expression: {
                      argumentTypes: null,
                      id: 57,
                      isConstant: false,
                      isLValue: false,
                      isPure: false,
                      lValueRequested: false,
                      nodeType: 'UnaryOperation',
                      operator: '++',
                      prefix: false,
                      src: '561:3:0',
                      subExpression: {
                        argumentTypes: null,
                        id: 56,
                        name: 'i',
                        nodeType: 'Identifier',
                        overloadedDeclarations: [],
                        referencedDeclaration: 47,
                        src: '561:1:0',
                        typeDescriptions: {
                          typeIdentifier: 't_uint256',
                          typeString: 'uint256'
                        }
                      },
                      typeDescriptions: {
                        typeIdentifier: 't_uint256',
                        typeString: 'uint256'
                      }
                    },
                    id: 58,
                    nodeType: 'ExpressionStatement',
                    src: '561:3:0'
                  },
                  nodeType: 'ForStatement',
                  src: '529:84:0'
                }
              ]
            },
            documentation: null,
            id: 68,
            implemented: true,
            isConstructor: false,
            isDeclaredConst: false,
            modifiers: [],
            name: 'emitEvents',
            nodeType: 'FunctionDefinition',
            parameters: {
              id: 35,
              nodeType: 'ParameterList',
              parameters: [
                {
                  constant: false,
                  id: 34,
                  name: 'numberOfEvents',
                  nodeType: 'VariableDeclaration',
                  scope: 68,
                  src: '381:22:0',
                  stateVariable: false,
                  storageLocation: 'default',
                  typeDescriptions: {
                    typeIdentifier: 't_uint256',
                    typeString: 'uint256'
                  },
                  typeName: {
                    id: 33,
                    name: 'uint256',
                    nodeType: 'ElementaryTypeName',
                    src: '381:7:0',
                    typeDescriptions: {
                      typeIdentifier: 't_uint256',
                      typeString: 'uint256'
                    }
                  },
                  value: null,
                  visibility: 'internal'
                }
              ],
              src: '380:24:0'
            },
            payable: false,
            returnParameters: {
              id: 36,
              nodeType: 'ParameterList',
              parameters: [],
              src: '412:0:0'
            },
            scope: 69,
            src: '361:256:0',
            stateMutability: 'nonpayable',
            superFunction: null,
            visibility: 'public'
          }
        ],
        scope: 70,
        src: '69:550:0'
      }
    ],
    src: '0:620:0'
  },
  compiler: {
    name: 'solc',
    version: '0.4.24+commit.e67f0147.Emscripten.clang'
  },
  networks: {
    '5777': {
      events: {},
      links: {},
      address: '0x0eb61f099bda4c82311e54ede20b3fd4eee5a002',
      transactionHash: '0xc8af31ddc7a4d98064dd2721eba75db8a71c6360bbe53c361056e58d9b846fc2'
    }
  },
  schemaVersion: '2.0.1',
  updatedAt: '2018-12-03T16:18:48.300Z'
}
