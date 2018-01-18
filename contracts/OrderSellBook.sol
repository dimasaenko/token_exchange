pragma solidity ^0.4.4;

import "./AbstractOrderBook.sol";

contract OrderSellBook is AbstractOrderBook {
    function addOrder(uint _price, uint _amount, address _owner) public onlyOwner() {
        require(_price > 0 && _amount > 0);
        increment_id += 1;
        uint id = increment_id;
        var newOrder = Order(_price, _amount, _owner);
        if (lenght == 0) {
            _addAsInitial(newOrder, id);
            return;
        }

        var current = first;
        for (uint i = 0; i < lenght; i++) {
            if (list[current].order.price > _price) {
                if (i == 0) {
                    _addAsFirst(newOrder, id);
                    return;
                }
                _addBefore(newOrder, id, current);
                return;
            }
            current = list[current].next;
        }
        _addAsLast(newOrder, id);
    }
}
