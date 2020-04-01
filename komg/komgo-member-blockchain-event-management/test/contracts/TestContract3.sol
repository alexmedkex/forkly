pragma solidity ^0.4.24;

// Test smart contract, only for reference
contract TestContract3 {

  uint256 public value;
  string public param1;
  string public param2;

  event ContractCreated(address indexed from);
  event EventEmitted(address indexed from, uint256 value);

  constructor(string inputParam1, string inputParam2) public {
    param1 = inputParam1;
    param2 = inputParam2;
    emit ContractCreated(msg.sender);
  }

  function setStorage(uint256 newValue) public {
    value = newValue;
  }

  function emitEvents(uint256 numberOfEvents) public {
    uint256 i;
    for(i = 0; i < numberOfEvents; i++) {
      emit EventEmitted(msg.sender, i);
    }
  }
}
