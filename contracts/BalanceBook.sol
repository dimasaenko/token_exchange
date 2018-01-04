pragma solidity ^0.4.4;

import "./TokenManager.sol";
import "./ERC20Interface.sol";

contract BalanceBook is TokenManager {
    struct Balance {
      uint ethers;
      mapping (bytes32 => uint) tokens;
    }

    modifier needToken(bytes32 code) {
        require(hasToken(code));
        _;
    }

    mapping (address => Balance) balances;

    event DepositEthRecieved(address sender, uint amount, uint timestamp);
    event WithdrawalEthSent(address sender, uint amount, uint timestamp);

    event DepositTokenRecieved(address sender, bytes32 token, uint amount, uint timestamp);
    event WithdrawalTokenSent(address sender, bytes32 token, uint amount, uint timestamp);

    function getEthBalance() constant returns (uint) {
        return balances[msg.sender].ethers;
    }

    function deposit() payable {
        require(balances[msg.sender].ethers + msg.value >= balances[msg.sender].ethers);

        balances[msg.sender].ethers += msg.value;
        DepositEthRecieved(msg.sender, msg.value, now);
    }

    function withdrawEth(uint _amount) {
        require(_amount > 0);
        require(balances[msg.sender].ethers >= _amount);
        require(balances[msg.sender].ethers > balances[msg.sender].ethers - _amount);

        balances[msg.sender].ethers  -= _amount;
        msg.sender.transfer(_amount);
        WithdrawalEthSent(msg.sender, _amount, now);
    }

    function getTokenBalance(bytes32 code) constant needToken(code) returns (uint) {
        return balances[msg.sender].tokens[code];
    }

    function depositToken(bytes32 code, uint amount) needToken(code) {
        ERC20Interface token = ERC20Interface(tokenBooks[code].tokenContract);
        require(token.transferFrom(msg.sender, address(this), amount) == true);
        require(balances[msg.sender].tokens[code] + amount >= balances[msg.sender].tokens[code]);
        balances[msg.sender].tokens[code] += amount;
        DepositTokenRecieved(msg.sender, code, amount, now);
    }

    function withdrawalToken(bytes32 code, uint amount) needToken(code) {
        ERC20Interface token = ERC20Interface(tokenBooks[code].tokenContract);

        require(balances[msg.sender].tokens[code] - amount >= 0);
        require(balances[msg.sender].tokens[code] - amount <= balances[msg.sender].tokens[code]);

        balances[msg.sender].tokens[code] -= amount;
        require(token.transfer(msg.sender, amount) == true);
        WithdrawalTokenSent(msg.sender, code, amount, now);
    }
}
