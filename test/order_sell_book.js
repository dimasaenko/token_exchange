var OrderSellBook = artifacts.require("./OrderSellBook.sol");
var newOrderEventName = 'NewSellOrder';

function addOrder(book, item) {
    return book.addOrder(item.price, item.amount, item.address);
};

function assertItem(list, checkIndex, item) {
    try {
        assert.equal(list[0][checkIndex].toNumber(), item.price,
        "Price "+checkIndex+" should be " + item.price);

        assert.equal(list[1][checkIndex].toNumber(), item.amount,
        "Amount "+checkIndex+" should be " + item.amount);

        assert.equal(list[2][checkIndex], item.address,
        "Address "+checkIndex+" should be " + item.address);
    } catch (e) {
        console.log('---------------------------------\n');
        console.log(list);
        console.log('\n---------------------------------');
        throw e;
    }
}

function assertLength(list, length){
    assert.equal(list[0].length, length, "Price Length should be "+length);
    assert.equal(list[1].length, length, "Amount Length should be "+length);
    assert.equal(list[2].length, length, "Address Length should be "+length);
}

function assertEvent(txResult, item){
    assert.equal(txResult.logs[0].event,
        newOrderEventName, newOrderEventName + " Event should be emitted");
    assert.equal(txResult.logs[0].args.price.toNumber(), item.price,
        "Price in Event should be " + item.price);
    assert.equal(txResult.logs[0].args.amount.toNumber(), item.amount,
        "Amount in Event should be " + item.amount);
    assert.equal(txResult.logs[0].args.owner, item.address,
        "Address in Event should be account address");
}

contract('orderSellBook', function(accounts) {
    it("20, 50, 100 => 20, 50, 100", function() {
        var orderBook;

        var item_20 = {price : 20, amount : 10, address : accounts[2]};
        var item_50 = {price : 50, amount : 15, address : accounts[1]};
        var item_100 = {price : 100, amount : 20, address : accounts[3]};

        return OrderSellBook.new().then(function(instance) {
            orderBook = instance;
            return addOrder(orderBook, item_20);
        }).then(function(txResult){
            assertEvent(txResult, item_20);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 1);
            assertItem(result, 0, item_20);
            return addOrder(orderBook, item_50);
        }).then(function(txResult){
            assertEvent(txResult, item_50);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 2);
            assertItem(result, 0, item_20);
            assertItem(result, 1, item_50);
            return addOrder(orderBook, item_100);
        }).then(function(txResult){
            assertEvent(txResult, item_100);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 3);
            assertItem(result, 0, item_20);
            assertItem(result, 1, item_50);
            assertItem(result, 2, item_100);
        });
    });

    it("100, 50, 20 => 20, 50, 100", function() {
        var orderBook;
        var item_20 = {price : 20, amount : 10, address : accounts[2]};
        var item_50 = {price : 50, amount : 15, address : accounts[1]};
        var item_100 = {price : 100, amount : 20, address : accounts[3]};

        return OrderSellBook.new().then(function(instance) {
            orderBook = instance;
            return addOrder(orderBook, item_100);
        }).then(function(txResult){
            assertEvent(txResult, item_100);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 1);
            assertItem(result, 0, item_100);
            return addOrder(orderBook, item_50);
        }).then(function(txResult){
            assertEvent(txResult, item_50);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 2);
            assertItem(result, 0, item_50);
            assertItem(result, 1, item_100);
            return addOrder(orderBook, item_20);
        }).then(function(txResult){
            assertEvent(txResult, item_20);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 3);
            assertItem(result, 0, item_20);
            assertItem(result, 1, item_50);
            assertItem(result, 2, item_100);
        });
    });


    it("100, 20, 50 => 20, 50, 100", function() {
        var orderBook;
        var item_20 = {price : 20, amount : 10, address : accounts[2]};
        var item_50 = {price : 50, amount : 15, address : accounts[1]};
        var item_100 = {price : 100, amount : 20, address : accounts[3]};

        return OrderSellBook.new().then(function(instance) {
            orderBook = instance;
            return addOrder(orderBook, item_100);
        }).then(function(txResult){
            assertEvent(txResult, item_100);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 1);
            assertItem(result, 0, item_100);
            return addOrder(orderBook, item_20);
        }).then(function(txResult){
            assertEvent(txResult, item_20);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 2);
            assertItem(result, 0, item_20);
            assertItem(result, 1, item_100);
            return addOrder(orderBook, item_50);
        }).then(function(txResult){
            assertEvent(txResult, item_50);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 3);
            assertItem(result, 0, item_20);
            assertItem(result, 1, item_50);
            assertItem(result, 2, item_100);
        });
    });

    it("50, 20, 50 => 20, 50, 50", function() {
        var orderBook;
        var item_20 = {price : 20, amount : 10, address : accounts[2]};
        var item_50_15 = {price : 50, amount : 15, address : accounts[1]};
        var item_50_20 = {price : 50, amount : 20, address : accounts[3]};

        return OrderSellBook.new().then(function(instance) {
            orderBook = instance;
            return addOrder(orderBook, item_50_15);
        }).then(function(txResult){
            assertEvent(txResult, item_50_15);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 1);
            assertItem(result, 0, item_50_15);
            return addOrder(orderBook, item_20);
        }).then(function(txResult){
            assertEvent(txResult, item_20);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 2);
            assertItem(result, 0, item_20);
            assertItem(result, 1, item_50_15);
            return addOrder(orderBook, item_50_20);
        }).then(function(txResult){
            assertEvent(txResult, item_50_20);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 3);
            assertItem(result, 0, item_20);
            assertItem(result, 1, item_50_15);
            assertItem(result, 2, item_50_20);
        });
    });

    it("100, 50, 20, 100, 50 => 20, 50, 50, 100, 100", function() {
        var orderBook;

        var item_100_11 = {price : 100, amount : 11, address : accounts[5]};
        var item_50_27 = {price : 50, amount : 27, address : accounts[4]};
        var item_20_17 = {price : 20, amount : 17, address : accounts[3]};
        var item_50_13 = {price : 50, amount : 13, address : accounts[4]};
        var item_100_14 = {price : 100, amount : 14, address : accounts[3]};

        return OrderSellBook.new().then(function(instance) {
            orderBook = instance;
            return addOrder(orderBook, item_100_11);
        }).then(function(txResult){
            assertEvent(txResult, item_100_11);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 1);
            assertItem(result, 0, item_100_11);
            return addOrder(orderBook, item_50_27);
        }).then(function(txResult){
            assertEvent(txResult, item_50_27);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 2);
            assertItem(result, 0, item_50_27);
            assertItem(result, 1, item_100_11);
            return addOrder(orderBook, item_20_17);
        }).then(function(txResult){
            assertEvent(txResult, item_20_17);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 3);
            assertItem(result, 0, item_20_17);
            assertItem(result, 1, item_50_27);
            assertItem(result, 2, item_100_11);
            return addOrder(orderBook, item_50_13);
        }).then(function(txResult){
            assertEvent(txResult, item_50_13);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 4);
            // 20, 50@27, 50@13, 100
            assertItem(result, 0, item_20_17);
            assertItem(result, 1, item_50_27);
            assertItem(result, 2, item_50_13);
            assertItem(result, 3, item_100_11);
            return addOrder(orderBook, item_100_14);
        }).then(function(txResult){
            assertEvent(txResult, item_100_14);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 5);
            // 20, 50@27, 50@13, 100@11, 100@14
            assertItem(result, 0, item_20_17);
            assertItem(result, 1, item_50_27);
            assertItem(result, 2, item_50_13);
            assertItem(result, 3, item_100_11);
            assertItem(result, 4, item_100_14);
        });
    });

    it("44@12, 33@3, 33@8, 44@8 => 33@3, 33@8, 44@12, 44@8", function() {
        var orderBook;
        var item_44_12 = {
            price : 44,
            amount : 12,
            address : accounts[5]
        };
        var item_33_3 = {
            price : 33,
            amount : 3,
            address : accounts[4]
        };
        var item_33_8 = {
            price : 33,
            amount : 8,
            address : accounts[3]
        };
        var item_44_8 = {
            price : 44,
            amount : 8,
            address : accounts[4]
        };
        var item_33_7 = {
            price : 33,
            amount : 8,
            address : accounts[4]
        };

        return OrderSellBook.new().then(function(instance) {
            orderBook = instance;
            return addOrder(orderBook, item_44_12);
        }).then(function(txResult){
            assertEvent(txResult, item_44_12);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 1);
            assertItem(result, 0, item_44_12);
            return addOrder(orderBook, item_33_3);
        }).then(function(txResult){
            assertEvent(txResult, item_33_3);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 2);
            assertItem(result, 0, item_33_3);
            assertItem(result, 1, item_44_12);
            return addOrder(orderBook, item_33_8);
        }).then(function(txResult){
            assertEvent(txResult, item_33_8);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 3);
            assertItem(result, 0, item_33_3);
            assertItem(result, 1, item_33_8);
            assertItem(result, 2, item_44_12);
            return addOrder(orderBook, item_44_8);
        }).then(function(txResult){
            assertEvent(txResult, item_44_8);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 4);
            // 33@3, 33@8, 44@12, 44@8
            assertItem(result, 0, item_33_3);
            assertItem(result, 1, item_33_8);
            assertItem(result, 2, item_44_12);
            assertItem(result, 3, item_44_8);
            return addOrder(orderBook, item_33_7);
        }).then(function(txResult){
            assertEvent(txResult, item_33_7);
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 5);
            // 33@3, 33@8, 33@7, 44@12, 44@8
            assertItem(result, 0, item_33_3);
            assertItem(result, 1, item_33_8);
            assertItem(result, 2, item_33_7);
            assertItem(result, 3, item_44_12);
            assertItem(result, 4, item_44_8);
        });
    });

    it("It should be able to reduce first order", function() {
        var orderBook;

        var item_20 = {price : 20, amount : 100, address : accounts[2]};
        var item_25 = {price : 25, amount : 300, address : accounts[1]};
        var item_30 = {price : 30, amount : 40, address : accounts[3]};
        var new_item_20 = {price : 20, amount : 60, address : accounts[2]};

        return OrderSellBook.new().then(function(instance) {
            orderBook = instance;
            return addOrder(orderBook, item_25);
        }).then(function(result){
            return addOrder(orderBook, item_30);
        }).then(function(result){
            return addOrder(orderBook, item_20);
        }).then(function(result){
            return orderBook.reduceFirstOrder(20, 40, accounts[2]);
        }).then(function(result){
            return orderBook.getList.call();
        }).then(function(result){
            assertLength(result, 3);
            // 33@3, 33@8, 33@7, 44@12, 44@8
            assertItem(result, 0, new_item_20);
            assertItem(result, 1, item_25);
            assertItem(result, 2, item_30);
        });
    });
});
