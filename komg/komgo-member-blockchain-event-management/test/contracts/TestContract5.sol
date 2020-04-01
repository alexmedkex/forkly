pragma solidity ^0.4.24;

// Test smart contract, only for reference
contract TestContract5 {

  uint256 public value;
  uint256 public value2;

  event ContractCreated(address indexed from);
  event EventEmitted(address indexed from, uint256 value);
  event CastEvent(string name, address at, int8 version);

  constructor(string contractCastname, address contractCastAddress) public {
    emit CastEvent(contractCastname, contractCastAddress, 0);
    emit ContractCreated(msg.sender);
  }

  function setStorage(uint256 newValue) public {
    value = newValue;
  }

  function setStorage2(uint256 newValue) public {
    value2 = newValue;
  }

  function emitEvents(uint256 numberOfEvents) public {
    uint256 i;
    for (i = 0; i < numberOfEvents; i++) {
      emit EventEmitted(msg.sender, i);
    }
  }

  function emitContractCastEvents(
    string contractName,
    address castAddress,
    uint256 numberOfEvents
    ) public {
    uint256 i;
    for (i = 0; i < numberOfEvents; i++) {
      emit CastEvent(contractName, castAddress, 0);
    }
  }
}
