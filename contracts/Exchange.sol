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
        increaseEthBalance(msg.sender, msg.value);
        DepositEth(msg.sender, msg.value, now);
    }

    function withdrawEth(uint _amount) {
        reduceEthBalance(msg.sender, _amount);
        msg.sender.transfer(_amount);
        WithdrawalEth(msg.sender, _amount, now);
    }

    function getTokenBalance(bytes32 code) constant tokenRequired(code) returns (uint) {
        return tokenBalance[msg.sender][code];
    }

    function depositToken(bytes32 code, uint amount) tokenRequired(code) {
        ERC20Interface token = ERC20Interface(tokenBooks[code].tokenContract);
        require(token.transferFrom(msg.sender, address(this), amount));
        increaseTokenBalance(msg.sender, code, amount);
        DepositToken(msg.sender, code, amount, now);
    }

    function withdrawToken(bytes32 code, uint amount) tokenRequired(code) {
        ERC20Interface token = ERC20Interface(tokenBooks[code].tokenContract);
        reduceTokenBalance(msg.sender, code, amount);
        require(token.transfer(msg.sender, amount) == true);
        WithdrawalToken(msg.sender, code, amount, now);
    }

    function getSellBookAddress(bytes32 _code) constant tokenRequired(_code) returns (address)  {
        return tokenBooks[_code].sellBook;
    }

    function reduceEthBalance(address _owner, uint _amount) private {
        require(ethBalance[_owner] >= _amount);
        require(ethBalance[_owner] > ethBalance[msg.sender] - _amount);
        ethBalance[_owner] -= _amount;
    }

    function increaseEthBalance(address _owner, uint _amount) private {
        require(ethBalance[_owner] + _amount > ethBalance[_owner]);
        ethBalance[_owner] += _amount;
    }

    function reduceTokenBalance(address _owner, bytes32 _code, uint _amount) private {
        require(tokenBalance[_owner][_code] >= _amount);
        require(tokenBalance[_owner][_code] > tokenBalance[_owner][_code] - _amount);
        tokenBalance[_owner][_code] -= _amount;
    }

    function increaseTokenBalance(address _owner, bytes32 _code, uint _amount) private {
        require(tokenBalance[_owner][_code] + _amount > tokenBalance[_owner][_code]);
        tokenBalance[_owner][_code] += _amount;
    }

    function checkEthBalance(address _owner, uint _amount) {
        require(ethBalance[_owner] >= _amount);
        require(ethBalance[_owner] > ethBalance[msg.sender] - _amount);
    }

    function checkTokenBalance(address _owner, bytes32 _code, uint _amount) {
        require(tokenBalance[_owner][_code] >= _amount);
        require(tokenBalance[_owner][_code] > tokenBalance[_owner][_code] - _amount);
    }

    event OrderClosed(uint price, uint amount, address buyer, address seller);
    event NewSellOrder(uint price, uint amount, address owner);
    event NewBuyOrder(uint price, uint amount, address owner);


    function getSellBook(bytes32 _code) constant returns (address) {
        return tokenBooks[_code].sellBook;
    }

    function getBuyBook(bytes32 _code) constant returns (address) {
        return tokenBooks[_code].buyBook;
    }

    function addBuyOrder(bytes32 _code, uint _price, uint _amount) tokenRequired(_code) {
        require(_amount > 0 && _price > 0);
        checkEthBalance(msg.sender, _amount);

        var sellBook = tokenBooks[_code].sellBook;
        var (orderPrice, orderAmount, orderOwner) = sellBook.getFirstOrder();

        if (orderPrice > _price || orderPrice == 0) {
            var dealAmount = _amount * _price;
            require(dealAmount/_amount == _price);
            reduceEthBalance(msg.sender, dealAmount);
            tokenBooks[_code].buyBook.addOrder(_price, _amount, msg.sender);
            NewBuyOrder(_price, _amount, msg.sender);
            return;
        }

        _price = orderPrice;
        if (orderAmount > _amount) {
            dealAmount = _amount * orderPrice;
            require(dealAmount/_amount == orderPrice);
            sellBook.reduceFirstOrder(orderPrice, _amount, orderOwner);
            reduceEthBalance(msg.sender, dealAmount);
            increaseEthBalance(orderOwner, dealAmount);
            increaseTokenBalance(msg.sender, _code, _amount);
            OrderClosed(_price, _amount, msg.sender, orderOwner);
            return;
        }

        dealAmount = orderAmount * orderPrice;
        require(dealAmount/orderAmount == orderPrice);
        sellBook.removeFirstOrder(orderPrice, orderAmount, orderOwner);
        reduceEthBalance(msg.sender, dealAmount);
        increaseEthBalance(orderOwner, dealAmount);
        increaseTokenBalance(msg.sender, _code, orderAmount);
        OrderClosed(_price, orderAmount, msg.sender, orderOwner);
    }

    function addSellOrder(bytes32 _code, uint _price, uint _amount) tokenRequired(_code) {
        require(_amount > 0 && _price > 0);
        checkTokenBalance(msg.sender, _code, _amount);
        var buyBook = tokenBooks[_code].buyBook;
        var (orderPrice, orderAmount, orderOwner) = buyBook.getFirstOrder();

        if (orderPrice < _price || orderPrice == 0) {
            reduceTokenBalance(msg.sender, _code, _amount);
            tokenBooks[_code].sellBook.addOrder(_price, _amount, msg.sender);
            NewSellOrder(_price, _amount, msg.sender);
            return;
        }

        _price = orderPrice;
        if (orderAmount > _amount) {
            var dealAmount = _amount * orderPrice;
            require(dealAmount/_amount == orderPrice);
            buyBook.reduceFirstOrder(orderPrice, _amount, orderOwner);
            reduceTokenBalance(msg.sender, _code, _amount);
            increaseTokenBalance(orderOwner, _code, _amount);
            increaseEthBalance(msg.sender, dealAmount);
            OrderClosed(_price, _amount, orderOwner, msg.sender);
            return;
        }

        dealAmount = orderAmount * orderPrice;
        require(dealAmount/orderAmount == orderPrice);
        buyBook.removeFirstOrder(orderPrice, orderAmount, orderOwner);
        reduceTokenBalance(msg.sender, _code, orderAmount);
        increaseTokenBalance(orderOwner, _code, orderAmount);
        increaseEthBalance(msg.sender, dealAmount);
        OrderClosed(_price, orderAmount, orderOwner, msg.sender);
    }
}
