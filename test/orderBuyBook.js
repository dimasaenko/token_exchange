var OrderBuyBook = artifacts.require("./OrderBuyBook.sol");

var items = [
  {
    price : 20,
    amount : 10,
    address : '0x0000000000000000000000000000000000000001'
  }, {
    price : 50,
    amount : 15,
    address : '0x0000000000000000000000000000000000000002'
  }, {
    price : 100,
    amount : 20,
    address : '0x0000000000000000000000000000000000000003'
  }, {
    price : 103,
    amount : 13,
    address : '0x0000000000000000000000000000000000000004'
  }, {
    price : 33,
    amount : 12,
    address : '0x0000000000000000000000000000000000000004'
  }, {
    price : 33,
    amount : 11,
    address : '0x0000000000000000000000000000000000000005'
  } , {
    price : 33,
    amount : 34,
    address : '0x0000000000000000000000000000000000000006'
  }
];

function addOrder(book, index) {
  book.addOrder(items[index].price, items[index].amount, items[index].address);
};

function assertItem(list, checkIndex, expectedIndex) {
  assert.equal(list[0][checkIndex].toNumber(), items[expectedIndex].price,
  "Price "+checkIndex+" should be " + items[expectedIndex].price);

  assert.equal(list[1][checkIndex].toNumber(), items[expectedIndex].amount,
  "Amount "+checkIndex+" should be " + items[expectedIndex].amount);

  assert.equal(list[2][checkIndex], items[expectedIndex].address,
  "Address "+checkIndex+" should be " + items[expectedIndex].address);
}

function assertLength(list, length){
  assert.equal(list[0].length, length, "Price Length should be "+length);
  assert.equal(list[1].length, length, "Amount Length should be "+length);
  assert.equal(list[2].length, length, "Address Length should be "+length);
}

function assertItems(list, indexes) {
  assertLength(list, indexes.length);
  for(var i = 0; i < indexes.length; i++) {
    assertItem(list, i, indexes[i]);
  }
}

contract('OrderBuyBook', function(accounts) {
  it("20, 50, 100 => 20, 50, 100", function() {
    var orderBook;
    return OrderBuyBook.deployed().then(function(instance) {
      orderBook = instance;
      addOrder(instance, 0);
      addOrder(instance, 1);
      addOrder(instance, 2);
      return orderBook.getList.call();
    }).then(function(result){
     assertItems(result, [0, 1, 2]);
    });
  });
});

contract('OrderBuyBook', function(accounts) {
  it("100, 50, 20 => 20, 50, 100", function() {
    var orderBook;
    return OrderBuyBook.deployed().then(function(instance) {
      orderBook = instance;
      addOrder(instance, 2);
      addOrder(instance, 1);
      addOrder(instance, 0);
      return orderBook.getList.call();
    }).then(function(result){
     assertItems(result, [0, 1, 2]);
    });
  });
});

contract('OrderBuyBook', function(accounts) {
  it("100, 20, 50 => 20, 50, 100", function() {
    var orderBook;
    return OrderBuyBook.deployed().then(function(instance) {
      orderBook = instance;
      addOrder(instance, 2);
      addOrder(instance, 0);
      return orderBook.getList.call();
    }).then(function(result){
      addOrder(orderBook, 1);
      return orderBook.getList.call();
    }).then(function(result){
      assertItems(result, [0, 1, 2]);
    });
  });
});

contract('OrderBuyBook', function(accounts) {
  it("50, 100, 50 => 50, 50, 100", function() {
    var orderBook;
    return OrderBuyBook.deployed().then(function(instance) {
      orderBook = instance;
      addOrder(instance, 1);
      addOrder(instance, 2);
      addOrder(instance, 1);
      return orderBook.getList.call();
    }).then(function(result){
     assertItems(result, [1, 1, 2]);
    });
  });
});

contract('OrderBook', function(accounts) {
  it("103, 20, 100, 50 => 20, 50, 100, 103", function() {
    var orderBook;
    return OrderBuyBook.deployed().then(function(instance) {
      orderBook = instance;
      addOrder(instance, 3);
      addOrder(instance, 0);
      addOrder(instance, 2);
      addOrder(instance, 1);
      return orderBook.getList.call();
    }).then(function(result){
     assertItems(result, [0, 1, 2, 3]);
    });
  });
});



contract('OrderBook', function(accounts) {
  it("33@12, 33@11, 33@34 => 33@34, 33@11, 33@12", function() {
    var orderBook;
    return OrderBuyBook.deployed().then(function(instance) {
      orderBook = instance;
      addOrder(instance, 4);
      addOrder(instance, 5);
      addOrder(instance, 6);
      return instance.getList.call();
    }).then(function(result){
      assertItems(result, [6, 5, 4]);
    });
  });
});
