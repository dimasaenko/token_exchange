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

    event TokenAdded(bytes32 code, address tokenContract);

    bytes32[] tokenCodes;
    mapping (bytes32 => Token) tokens;

    function addToken(bytes32 code, address tokenContract) onlyOwner() {
        require(tokens[code].tokenContract == address(0x0));
        var token = Token(tokenContract, new OrderBuyBook(), new OrderSellBook());
        tokenCodes.push(code);
        tokens[code] = token;
        TokenAdded(code, tokenContract);
    }

    function hasToken(bytes32 code) constant returns (bool result) {
        return tokens[code].tokenContract != address(0x0);
    }

    function getTokenList() constant returns (bytes32[]) {
        var len = tokenCodes.length;
        bytes32[] memory codes = new bytes32[](len);

        for(uint i = 0; i < tokenCodes.length; i++) {
            codes[i] = bytes32(tokenCodes[i]);
        }
        return codes;
    }
}
