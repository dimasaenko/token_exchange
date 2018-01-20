pragma solidity ^0.4.4;

import "./OnlyOwnerContract.sol";

contract AbstractOrderBook is OnlyOwnerContract {
    uint lenght;
    uint first;
    uint increment_id;

    event OrderCancel(uint price, uint amount, address owner, uint id);

    struct Order {
        uint price;
        uint amount;
        address owner;
        uint next;
    }

    mapping (uint => Order) internal list;

    function addOrder(
    uint _price,
    uint _amount,
    address _owner) public onlyOwner() returns (uint id) {
        require(_price > 0 && _amount > 0);
        increment_id += 1;
        id = increment_id;
        var newOrder = Order(_price, _amount, _owner, 0);

        uint _after;
        var current = first;
        for (uint i = 0; i < lenght; i++) {
            var orderPrice = list[current].price;
            if (shouldBeBefore(orderPrice, _price)) {
                _addAfter(newOrder, _after);
                return id;
            }
            _after = current;
            current = list[current].next;
        }
        _addAfter(newOrder, _after);
        return id;
    }

    function shouldBeBefore(uint orderPrice, uint newPrice) public returns(bool);

    function _addAfter(Order newOrder, uint _after) internal {
        if (_after == 0) {
            newOrder.next = first;
            first = increment_id;
        } else {
            newOrder.next = list[_after].next;
            list[_after].next = increment_id;
        }
        list[increment_id] = newOrder;
        lenght += 1;
    }

    function getList() public constant
    returns (uint[] _prices, uint[] _amounts, address[] _owners, uint[] _ids) {
        _owners = new address[](lenght);
        _prices = new uint[](lenght);
        _amounts = new uint[](lenght);
        _ids = new uint[](lenght);

        var current = first;
        for (uint i = 0; i < lenght; i++) {
            _owners[i] = list[current].owner;
            _prices[i] = list[current].price;
            _amounts[i] = list[current].amount;
            _ids[i] = current;
            current = list[current].next;
        }
    }

    function getFirstOrder() constant returns (uint, uint, address) {
        Order memory item = list[first];
        return (item.price, item.amount, item.owner);
    }

    function reduceFirstOrder(
    uint _price,
    uint _amount,
    address _owner) external {
        var order = list[first];
        require(order.price == _price && order.owner == _owner);
        if (order.amount > _amount) {
            require(order.amount > order.amount - _amount);
            list[first].amount = order.amount - _amount;
            return;
        }

        require(order.amount == _amount);
        var _first = list[first].next;
        delete list[first];
        first = _first;
        lenght -= 1;
    }

    function cancelOrder(
    uint _id,
    uint prev_id,
    address _owner
    ) onlyOwner() returns (uint price, uint amount) {
        var order = list[_id];
        require(order.owner == _owner);
        if (prev_id == 0) {
            require(first == _id);
            first = order.next;
        } else {
            require(list[prev_id].next == _id);
            list[prev_id].next = order.next;
        }

        price = order.price;
        amount = order.amount;

        lenght -= 1;
        OrderCancel(order.price, order.amount, order.owner, _id);
        delete list[_id];
    }
}
