pragma solidity ^0.4.4;

import "./OrderBuyBook.sol";
import "./OrderSellBook.sol";
import "./OnlyOwnerContract.sol";

contract Exchange is  OnlyOwnerContract {
    struct Token {
        address tokenContract;
        OrderBuyBook buyBook;
        OrderSellBook sellBook;
    }

    string[] tokenCodes;
    mapping (string => Token) tokens;

    function addToken(string code, address tokenContract) onlyOwner() {
        require(tokens[code].tokenContract == address(0x0));
        var token = Token(tokenContract, new OrderBuyBook(), new OrderSellBook());
        tokenCodes.push(code);
        tokens[code] = token;
    }

    /* function placeBuyOrder(uint price, uint amount) {

    }

    function placeSellOrder(uint price, uint amount) {

    }

    function getBalance() constant returns (string currencies, uint amount){

    } */
}
