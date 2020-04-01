pragma solidity ^0.4.24;

// Test smart contract, only for reference
contract TestContract4 {

  uint256 public value;
  uint256 public value2;

  event ContractCreated(address indexed from);
  event EventEmitted(address indexed from, uint256 value);

  constructor() public {
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
    for(i = 0; i < numberOfEvents; i++) {
      emit EventEmitted(msg.sender, i);
    }
  }
}
