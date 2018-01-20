var TokenABC = artifacts.require("./TokenABC.sol");
var Exchange = artifacts.require("./Exchange.sol");
var OrderSellBook = artifacts.require("./OrderSellBook.sol");
var OrderBuyBook = artifacts.require("./OrderSellBook.sol");

contract('Exchange', function(accounts) {
    var tokenInstanceABC;
    var tokenCodeABC;
    var exchangeInstance;

    var ethBalance1 = 10000;
    var ethBalance2 = 0;
    var tokenBalance1 = 0;
    var tokenBalance2 = 1000;

    var sellBook;
    var buyBook;

    it("save deployed tokenInstanceABC", function(){
        return TokenABC.deployed().then(function (instance) {
            tokenInstanceABC = instance;
            return tokenInstanceABC.symbol.call();
        }).then(function (symbol) {
            tokenCodeABC = symbol;
        }).then(function (){
            tokenInstanceABC.transfer(accounts[2], tokenBalance2, {from: accounts[0]});
        });
    });

    it("add token to exchange, deposit eth, deposit token", function ( ) {
        return Exchange.deployed().then(function (instance) {
            exchangeInstance = instance;
            return exchangeInstance.addToken(tokenCodeABC, tokenInstanceABC.address);
        }).then(function (result) {
            return exchangeInstance.depositEth({from: accounts[1], value: ethBalance1});
        }).then(function (result) {
            return tokenInstanceABC.approve(exchangeInstance.address, tokenBalance2, {from: accounts[2]});
        }).then(function (result) {
            return exchangeInstance.depositToken(tokenCodeABC, tokenBalance2, {from: accounts[2]});
        }).then(function (result) {
            return exchangeInstance.getEthBalance.call({from: accounts[1]});
        }).then(function(result) {
            assert.equal(result.toNumber(), ethBalance1, "Eth balance for accounts[1] should be corrent");
            return exchangeInstance.getTokenBalance.call(tokenCodeABC, {from: accounts[2]});
        }).then(function(result) {
            assert.equal(result.toNumber(), tokenBalance2, "Token balance for accounts[2] should be corrent");
            return exchangeInstance.getSellBook(tokenCodeABC);
        }).then(function(result){
            sellBook = OrderSellBook.at(result);
            return exchangeInstance.getBuyBook(tokenCodeABC);
        }).then(function(result){
            buyBook = OrderBuyBook.at(result);
        });
    });

    function assertNewSellOrderEvent(tx, order) {
        var log = tx.logs[0];
        assert.equal(log.event, 'NewSellOrder', "Event Name should be NewSellOrder");
        assert.equal(log.args.price.toNumber(), order.price, 'Event price should be ' + order.price);
        assert.equal(log.args.amount.toNumber(), order.amount, 'Event amount should be ' + order.amount);
        assert.equal(log.args.owner, order.owner, 'Order owner should be ' + order.owner);
        order.id = log.args.id;
        return order.id;
    }

    function assertNewBuyOrderEvent(tx, order) {
        var log = tx.logs[0];
        assert.equal(log.event, 'NewBuyOrder', "Event Name should be NewBuyOrder");
        assert.equal(log.args.price.toNumber(), order.price, 'Event price should be ' + order.price);
        assert.equal(log.args.amount.toNumber(), order.amount, 'Event amount should be ' + order.amount);
        assert.equal(log.args.owner, order.owner, 'Order owner should be ' + order.owner);
        order.id = log.args.id.toNumber();
        return order.id;
    }

    function assertOrderCancelEvent(tx, order) {
        var log = tx.logs[0];
        assert.equal(log.event, 'OrderCancel', "Event Name should be OrderCancel");
        assert.equal(log.args.price.toNumber(), order.price, 'Event price should be ' + order.price);
        assert.equal(log.args.amount.toNumber(), order.amount, 'Event amount should be ' + order.amount);
        assert.equal(log.args.owner, order.owner, 'Order owner should be ' + order.owner);
        assert.equal(log.args.id.toNumber(), order.id, 'Order id should be ' + order.id);
    }

    it("Place 1 sell order, cancel this order, check balance", function() {
        var order = {price : 5, amount : 20, owner : accounts[2]};
        var orderId;

        return exchangeInstance.addSellOrder(tokenCodeABC, order.price, order.amount, {from: order.owner})
        .then(function(result){
            orderId = assertNewSellOrderEvent(result, order);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[2]});
        }).then(function(result){
            tokenBalance2 -= order.amount;
            assert.equal(result.toNumber(), tokenBalance2, 'Token Balance ABC for acc[2] should be '+tokenBalance2);
            return exchangeInstance.cancelSellOrder(tokenCodeABC, orderId, {from: accounts[2]});
        }).then(function(result){
            assertOrderCancelEvent(result, order);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[2]});
        }).then(function(result){
            tokenBalance2 += order.amount;
            assert.equal(result.toNumber(), tokenBalance2, 'Token Balance ABC for acc[2] should be '+tokenBalance2);
            return sellBook.getList.call();
        }).then(function(result){
            try {
                assert.equal(result[0].length, 0, "Sell book should be empty");
            } catch (e) {
                console.log(result);
                throw e;
            }
        });
    });

    it("Place 1 buy order, cancel this order, check balance", function() {
        var order = {price : 5, amount : 20, total : 5*20, owner : accounts[1]};

        return addBuyOrder(exchangeInstance, order)
        .then(function(result){
            assertNewBuyOrderEvent(result, order);
            return exchangeInstance.getEthBalance.call({from: accounts[1]});
        }).then(function(result){
            ethBalance1 -= order.total;
            assert.equal(result.toNumber(), ethBalance1, 'Ether Balance for acc[1] should be '+ethBalance1 + ' before cancel');
            return exchangeInstance.cancelBuyOrder(tokenCodeABC, order.id, {from: order.owner});
        }).then(function(result){
            assertOrderCancelEvent(result, order);
            return exchangeInstance.getEthBalance.call({from: accounts[1]});
        }).then(function(result){
            ethBalance1 += order.total;
            assert.equal(result.toNumber(), ethBalance1, 'Ether Balance for acc[1] should be '+ethBalance1 + ' after cancel');
            return buyBook.getList.call();
        }).then(function(result) {
            assert.equal(result[0].length, 0, "Sell book should be empty");
        });
    });

    function assertItem(list, checkIndex, item) {
        try {
            assert.equal(list[0][checkIndex].toNumber(), item.price,
            "Price "+checkIndex+" should be " + item.price);

            assert.equal(list[1][checkIndex].toNumber(), item.amount,
            "Amount "+checkIndex+" should be " + item.amount);

            assert.equal(list[2][checkIndex], item.owner,
            "Address "+checkIndex+" should be " + item.owner);
        } catch (e) {
            console.log('---------------------------------\n');
            console.log(list);
            console.log('\n---------------------------------');
            throw e;
        }
    }

    function assertOrderList(list, items){
        assertLength(list, items.length);
        for (var i = 0; i < items.length; i++){
            assertItem(list, i, items[i]);
        }
    }

    function assertLength(list, length){
        assert.equal(list[0].length, length, "Price Length should be "+length);
        assert.equal(list[1].length, length, "Amount Length should be "+length);
        assert.equal(list[2].length, length, "Address Length should be "+length);
    }

    function addBuyOrder(exchange, item) {
        return exchangeInstance.addBuyOrder(tokenCodeABC, item.price, item.amount, {from: item.owner});
    }

    function addSellOrder(exchange, item) {
        return exchangeInstance.addSellOrder(tokenCodeABC, item.price, item.amount, {from: item.owner});
    }

    function cancelBuyOrder(exchange, item) {
        return exchangeInstance.cancelBuyOrder(tokenCodeABC, item.id, {from: item.owner});
    }

    it("Place 5 buy orders, cancel them one by one, check order book, check eth balance", function(){
        var item_100_11 = {price : 100, amount : 11, id : 0, owner : accounts[1]};
        var item_50_27  = {price : 50,  amount : 27, id : 0, owner : accounts[1]};
        var item_20_17  = {price : 20,  amount : 17, id : 0, owner : accounts[1]};
        var item_50_13  = {price : 50,  amount : 13, id : 0, owner : accounts[1]};
        var item_100_14 = {price : 100, amount : 14, id : 0, owner : accounts[1]};

        var balance = ethBalance1;
        ethBalance1 -= item_100_11.price * item_100_11.amount;
        ethBalance1 -= item_50_27.price  * item_50_27.amount;
        ethBalance1 -= item_20_17.price  * item_20_17.amount;
        ethBalance1 -= item_50_13.price  * item_50_13.amount;
        ethBalance1 -= item_100_14.price * item_100_14.amount;


            return addBuyOrder(exchangeInstance, item_100_11)
        .then(function(result){
            assertNewBuyOrderEvent(result, item_100_11);
            return addBuyOrder(exchangeInstance, item_50_27);
        }).then(function(result){
            assertNewBuyOrderEvent(result, item_50_27);
            return addBuyOrder(exchangeInstance, item_20_17);
        }).then(function(result){
            assertNewBuyOrderEvent(result, item_20_17);
            return addBuyOrder(exchangeInstance, item_50_13);
        }).then(function(result){
            assertNewBuyOrderEvent(result, item_50_13);
            return addBuyOrder(exchangeInstance, item_100_14);
        }).then(function(result){
            assertNewBuyOrderEvent(result, item_100_14);
            return buyBook.getList.call();
        }).then(function(result){
            assertOrderList(result, [item_100_11, item_100_14, item_50_27, item_50_13, item_20_17]);
        }).then(function(){

            return cancelBuyOrder(exchangeInstance, item_50_13);
        }).then(function(result){
            assertOrderCancelEvent(result, item_50_13);
            return buyBook.getList.call();
        }).then(function(result){
            assertOrderList(result, [item_100_11, item_100_14, item_50_27, item_20_17]);
            return exchangeInstance.getEthBalance({from: accounts[1]});
        }).then(function(result){
            ethBalance1 += item_50_13.price  * item_50_13.amount;
            assert.equal(result.toNumber(), ethBalance1,
            'Ether Balance for acc[1] should be '+ethBalance1 + ' after cancel');

            return cancelBuyOrder(exchangeInstance, item_100_11);
        }).then(function(result){
            assertOrderCancelEvent(result, item_100_11);
            return buyBook.getList.call();
        }).then(function(result){
            assertOrderList(result, [item_100_14, item_50_27, item_20_17]);
            return exchangeInstance.getEthBalance({from: accounts[1]});
        }).then(function(result){
            ethBalance1 += item_100_11.price  * item_100_11.amount;
            assert.equal(result.toNumber(), ethBalance1,
            'Ether Balance for acc[1] should be '+ethBalance1 + ' after cancel');

            return cancelBuyOrder(exchangeInstance, item_20_17);
        }).then(function(result){
            assertOrderCancelEvent(result, item_20_17);
            return buyBook.getList.call();
        }).then(function(result){
            assertOrderList(result, [item_100_14, item_50_27]);
            return exchangeInstance.getEthBalance({from: accounts[1]});
        }).then(function(result){
            ethBalance1 += item_20_17.price  * item_20_17.amount;
            assert.equal(result.toNumber(), ethBalance1,
            'Ether Balance for acc[1] should be ' + ethBalance1 + ' after cancel');

            return cancelBuyOrder(exchangeInstance, item_50_27);
        }).then(function(result){
            assertOrderCancelEvent(result, item_50_27);
            return buyBook.getList.call();
        }).then(function(result){
            assertOrderList(result, [item_100_14]);
            return exchangeInstance.getEthBalance({from: accounts[1]});
        }).then(function(result){
            ethBalance1 += item_50_27.price  * item_50_27.amount;
            assert.equal(result.toNumber(), ethBalance1,
            'Ether Balance for acc[1] should be ' + ethBalance1 + ' after cancel');

            return cancelBuyOrder(exchangeInstance, item_100_14);
        }).then(function(result){
            assertOrderCancelEvent(result, item_100_14);
            return buyBook.getList.call();
        }).then(function(result){
            assertOrderList(result, []);
            return exchangeInstance.getEthBalance({from: accounts[1]});
        }).then(function(result){
            ethBalance1 += item_100_14.price  * item_100_14.amount;
            assert.equal(result.toNumber(), ethBalance1,
            'Ether Balance for acc[1] should be ' + ethBalance1 + ' after cancel');
        });
    });
});
