pragma solidity ^0.4.4;

import "./OrderBuyBook.sol";
import "./OrderSellBook.sol";
import "./OnlyOwnerContract.sol";

contract TokenManager is  OnlyOwnerContract {
    struct TokenBook {
        address tokenContract;
        OrderBuyBook buyBook;
        OrderSellBook sellBook;
    }

    event TokenAdded(bytes32 code, address tokenContract);

    bytes32[] tokenCodes;
    mapping (bytes32 => TokenBook) tokenBooks;

    function addToken(bytes32 code, address tokenContract) external onlyOwner() {
        require(tokenBooks[code].tokenContract == address(0x0));
        var tokenBook = TokenBook(tokenContract, new OrderBuyBook(), new OrderSellBook());
        tokenCodes.push(code);
        tokenBooks[code] = tokenBook;
        TokenAdded(code, tokenContract);
    }

    function hasToken(bytes32 code) constant returns (bool result) {
        return tokenBooks[code].tokenContract != address(0x0);
    }

    function getTokenList() constant returns (bytes32[], address[]) {
        var len = tokenCodes.length;
        bytes32[] memory codes = new bytes32[](len);
        address[] memory addresses = new address[](len);

        for(uint i = 0; i < tokenCodes.length; i++) {
            codes[i] = bytes32(tokenCodes[i]);
            addresses[i] = tokenBooks[tokenCodes[i]].tokenContract;
        }
        return (codes, addresses);
    }
}
