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

    function fireNewOrderEvent(uint _price, uint _amount, address _owner);

    function _addAsInitial(Order newOrder, uint id) internal {
        first = id;
        last = id;
        list[id] = ItemList(id, id, newOrder);
        lenght += 1;
        fireNewOrderEvent(newOrder.price, newOrder.amount, newOrder.owner);
    }

    function _addAsFirst(Order newOrder, uint id) internal {
        list[first].prev = id;
        list[id] = ItemList(id, first, newOrder);
        first = id;
        lenght += 1;
        fireNewOrderEvent(newOrder.price, newOrder.amount, newOrder.owner);
    }


    function _addAsLast(Order newOrder, uint id) internal {
        list[last].next = id;
        list[id] = ItemList(last, id, newOrder);
        last = id;
        lenght += 1;
        fireNewOrderEvent(newOrder.price, newOrder.amount, newOrder.owner);
    }

    function _addAfter(Order newOrder, uint id, uint _after) internal {
        uint next = list[_after].next;
        list[id] = ItemList(_after, next, newOrder);
        list[_after].next = id;
        list[next].prev = id;
        lenght += 1;
        fireNewOrderEvent(newOrder.price, newOrder.amount, newOrder.owner);
    }

    function _addBefore(Order newOrder, uint id, uint before) internal {
        uint prev = list[before].prev;
        list[id] = ItemList(prev, before, newOrder);
        list[prev].next = id;
        list[before].prev = id;
        lenght += 1;
        fireNewOrderEvent(newOrder.price, newOrder.amount, newOrder.owner);
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

    function getLastItem() constant returns (uint, uint, address) {
        Order memory item = list[last].order;
        return (item.price, item.amount, item.owner);
    }
}
