pragma solidity ^0.4.24;

// Test smart contract, only for reference
contract TestContract {

  uint256 public value;

  event ContractCreated(address indexed from);
  event EventEmitted(address indexed from, uint256 value);

  constructor() public {
    emit ContractCreated(msg.sender);
  }

  function incrementValue() public {
    value = value + 1;
  }

  function emitEvents(uint256 numberOfEvents) public {
    require(numberOfEvents + value <= 10, "Number of events + value must be smaller than 10");

    uint256 i;
    for (i = 0; i < numberOfEvents; i++) {
      emit EventEmitted(msg.sender, i);
    }
  }
}
