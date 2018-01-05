pragma solidity ^0.4.4;

import "./TokenManager.sol";
import "./ERC20Interface.sol";

contract Exchange is  TokenManager {
    mapping (address => uint) ethBalance;
    mapping (address => mapping (bytes32 => uint)) tokenBalance;

    event DepositEth(address sender, uint amount, uint timestamp);
    event WithdrawalEth(address sender, uint amount, uint timestamp);

    event DepositToken(address sender, bytes32 token, uint amount, uint timestamp);
    event WithdrawalToken(address sender, bytes32 token, uint amount, uint timestamp);

    function getEthBalance() constant returns (uint) {
        return ethBalance[msg.sender];
    }

    function depositEth() payable {
        require(msg.value > 0);
        require(ethBalance[msg.sender] + msg.value >= ethBalance[msg.sender]);

        ethBalance[msg.sender] += msg.value;
        DepositEth(msg.sender, msg.value, now);
    }

    function withdrawEth(uint _amount) {
        require(_amount > 0);
        require(ethBalance[msg.sender] >= _amount);
        require(ethBalance[msg.sender] > ethBalance[msg.sender] - _amount);

        ethBalance[msg.sender]  -= _amount;
        msg.sender.transfer(_amount);
        WithdrawalEth(msg.sender, _amount, now);
    }

    /* function getTokenBalance(bytes32 code) constant tokenRequired(code) returns (uint) {
        return tokenBalance[msg.sender][code];
    }

    function depositToken(bytes32 code, uint amount) tokenRequired(code) {
        ERC20Interface token = ERC20Interface(tokenBooks[code].tokenContract);
        require(token.transferFrom(msg.sender, address(this), amount) == true);
        require(tokenBalance[msg.sender][code] + amount >= tokenBalance[msg.sender][code]);
        tokenBalance[msg.sender][code] += amount;
        DepositToken(msg.sender, code, amount, now);
    }

    function withdrawalToken(bytes32 code, uint amount) tokenRequired(code) {
        ERC20Interface token = ERC20Interface(tokenBooks[code].tokenContract);

        require(tokenBalance[msg.sender][code] - amount >= 0);
        require(tokenBalance[msg.sender][code] - amount <= tokenBalance[msg.sender][code]);

        tokenBalance[msg.sender][code] -= amount;
        require(token.transfer(msg.sender, amount) == true);
        WithdrawalToken(msg.sender, code, amount, now);
    } */
}
