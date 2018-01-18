pragma solidity ^0.4.4;

import "./OnlyOwnerContract.sol";

contract AbstractOrderBook is OnlyOwnerContract {
    uint lenght;
    uint last;
    uint first;
    uint increment_id;

    struct Order {
        uint price;
        uint amount;
        address owner;
    }

    struct ItemList {
        uint prev;
        uint next;
        Order order;
    }

    mapping (uint => ItemList) internal list;

    function addOrder(uint _price, uint _amount, address _owner) public onlyOwner();

    function _addAsInitial(Order newOrder, uint id) internal {
        first = id;
        last = id;
        list[id] = ItemList(id, id, newOrder);
        lenght += 1;
    }

    function _addAsFirst(Order newOrder, uint id) internal {
        list[first].prev = id;
        list[id] = ItemList(id, first, newOrder);
        first = id;
        lenght += 1;
    }

    function _addAsLast(Order newOrder, uint id) internal {
        list[last].next = id;
        list[id] = ItemList(last, id, newOrder);
        last = id;
        lenght += 1;
    }

    function _addAfter(Order newOrder, uint id, uint _after) internal {
        uint next = list[_after].next;
        list[id] = ItemList(_after, next, newOrder);
        list[_after].next = id;
        list[next].prev = id;
        lenght += 1;
    }

    function _addBefore(Order newOrder, uint id, uint before) internal {
        uint prev = list[before].prev;
        list[id] = ItemList(prev, before, newOrder);
        list[prev].next = id;
        list[before].prev = id;
        lenght += 1;
    }

    function getList() public constant returns (uint[] _prices, uint[] _amounts, address[] _owners) {
        _owners = new address[](lenght);
        _prices = new uint[](lenght);
        _amounts = new uint[](lenght);

        var current = first;
        for (uint i = 0; i < lenght; i++) {
            _owners[i] = list[current].order.owner;
            _prices[i] = list[current].order.price;
            _amounts[i] = list[current].order.amount;
            current = list[current].next;
        }
    }

    function getOrdersByAddress(address _owner) public constant returns (uint[] _prices, uint[] _amounts, uint[] _ids) {
        _ids = new uint[](lenght);
        _prices = new uint[](lenght);
        _amounts = new uint[](lenght);

        var current = first;
        for (uint i = 0; i < lenght; i++) {
            if (_owner == list[current].order.owner) {
                _ids[i] = current;
                _prices[i] = list[current].order.price;
                _amounts[i] = list[current].order.amount;
                current = list[current].next;
            }
        }
    }

    function getFirstOrder() constant returns (uint, uint, address) {
        Order memory item = list[first].order;
        return (item.price, item.amount, item.owner);
    }

    function reduceFirstOrder(uint _price, uint _amount, address _owner) external {
        var order = list[first].order;
        require(order.price == _price && order.owner == _owner);
        require(order.amount >= _amount && order.amount > order.amount - _amount);
        list[first].order.amount = order.amount - _amount;
    }

    function removeFirstOrder(uint _price, uint _amount, address _owner) external {
        var order = list[first].order;
        require(
            order.price == _price &&
            order.owner == _owner &&
            order.amount == _amount
        );
        var _first = list[first].next;
        delete list[first];
        first = _first;
        lenght -= 1;
    }
}
