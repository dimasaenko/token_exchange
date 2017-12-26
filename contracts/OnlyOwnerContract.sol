pragma solidity ^0.4.4;

contract OnlyOwnerContract {
  address owner;

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function OnlyOwnerContract() {
    owner = msg.sender;
  }
}
