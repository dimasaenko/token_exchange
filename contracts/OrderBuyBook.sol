pragma solidity ^0.4.4;

import "./OnlyOwnerContract.sol";

contract OrderBuyBook is OnlyOwnerContract {
  uint lenght;
  uint last;
  uint first;
  uint increment_id;
  address owner;

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

  mapping (uint => ItemList) private list;

  function addOrder(uint _price, uint _amount, address _owner) onlyOwner() {
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
      if (list[current].order.price >= _price) {
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

  function getList() public constant returns (uint[] _prices, uint[] _amounts,
    address[] _owners) {
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

  function getOrdersByAddress(address _owner) public constant returns (uint[] _prices, uint[] _amounts,
    uint[] _ids) {
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

  /* function tryToClose(uint _price, uint _amount, address _address)
  onlyCreator() returns (uint _amountLeft) {
      require(_price > 0 && _amount > 0);

      if (list[last].order.price < _price) {
        _amountLeft = _amount;
        return _amountLeft;
      }
      if (list[last].order.amount > _amount) {
        //reduce order, update balance
        return 0;
      }
      if(list[last].order.amount <= _amount) {
        //delete order, update balance
        return tryToClose(_price, _amountLeft, _address);
      }
  } */

  /* function reduceBalance(string _currency, address _owner, uint amount) internal {
    balanceBook.reduceBalance(_currency, _owner, amount);
  }

  function increaseBalance(string _currency, address _owner, uint amount) internal {
    balanceBook.increaseBalance(_currency, _owner, amount);
  } */

  function getLastItem() constant returns (uint, uint, address) {
    Order memory item = list[last].order;
    return (item.price, item.amount, item.owner);
  }
}
