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

    event TokenAdded(string code, address tokenContract);

    string[] tokenCodes;
    mapping (string => Token) tokens;

    function addToken(string code, address tokenContract) onlyOwner() {
        require(tokens[code].tokenContract == address(0x0));
        var token = Token(tokenContract, new OrderBuyBook(), new OrderSellBook());
        tokenCodes.push(code);
        tokens[code] = token;
        TokenAdded(code, tokenContract);
    }

    function hasToken(string code) constant returns (bool result) {
        return tokens[code].tokenContract != address(0x0);
    }

    /* function tokenList() constant returns (bytes32[] codes, address[] addresses) {
        codes = string[](tokenCodes.length);
        addresses = address[](tokenCodes.length);

        for(uint i = 0; i < tokenCodes.length; i++) {
            codes[i] = bytes32(tokenCodes[i]);
            addresses[i] = tokens[tokenCodes[i]].tokenContract;
        }
    } */

    /* function placeBuyOrder(uint price, uint amount) {

    }

    function placeSellOrder(uint price, uint amount) {

    }

    function getBalance() constant returns (string currencies, uint amount){

    } */
}
