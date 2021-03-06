pragma solidity ^0.4.4;

import "./AbstractOrderBook.sol";

contract OrderBuyBook is AbstractOrderBook {

    function shouldBeBefore(uint orderPrice, uint newPrice) public returns(bool){
        return orderPrice < newPrice;
    }
}
