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

    function assertNewSellOrderEvent(tx, price, amount, owner) {
        var log = tx.logs[0];
        assert.equal(log.event, 'NewSellOrder', "Event Name should be NewSellOrder");
        assert.equal(log.args.price.toNumber(), price, 'Event price should be ' + price);
        assert.equal(log.args.amount.toNumber(), amount, 'Event amount should be ' + amount);
        assert.equal(log.args.owner, owner, 'Order owner should be ' + owner);
        return log.args.id;
    }

    function assertNewBuyOrderEvent(tx, price, amount, owner) {
        var log = tx.logs[0];
        assert.equal(log.event, 'NewBuyOrder', "Event Name should be NewBuyOrder");
        assert.equal(log.args.price.toNumber(), price, 'Event price should be ' + price);
        assert.equal(log.args.amount.toNumber(), amount, 'Event amount should be ' + amount);
        assert.equal(log.args.owner, owner, 'Order owner should be ' + owner);
        return log.args.id.toNumber();
    }

    function assertOrderCancelEvent(tx, price, amount, owner, id) {
        var log = tx.logs[0];
        assert.equal(log.event, 'OrderCancel', "Event Name should be OrderCancel");
        assert.equal(log.args.price.toNumber(), price, 'Event price should be ' + price);
        assert.equal(log.args.amount.toNumber(), amount, 'Event amount should be ' + amount);
        assert.equal(log.args.owner, owner, 'Order owner should be ' + owner);
        assert.equal(log.args.id.toNumber(), id, 'Order id should be ' + id);
    }

    function assertOrderClosedEvent(tx, price, amount, buyer, seller) {
        var log = tx.logs[0];
        assert.equal(log.event, 'OrderClosed', "Event Name should be OrderClosed");
        assert.equal(log.args.price.toNumber(), price, 'Event price should be ' + price);
        assert.equal(log.args.amount.toNumber(), amount, 'Event price should be ' + amount);
        assert.equal(log.args.buyer, buyer, 'Event owner should be ' + buyer);
        assert.equal(log.args.seller, seller, 'Event owner should be ' + seller);
    }

    it("Place 1 sell order, cancel this order, check balance", function() {
        var price1 = 5;
        var amount1 = 20;
        var orderId;

        return exchangeInstance.addSellOrder(tokenCodeABC, price1, amount1, {from: accounts[2]})
        .then(function(result){
            orderId = assertNewSellOrderEvent(result, price1, amount1, accounts[2]);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[2]});
        }).then(function(result){
            tokenBalance2 -= amount1;
            assert.equal(result.toNumber(), tokenBalance2, 'Token Balance ABC for acc[2] should be '+tokenBalance2);
            return exchangeInstance.cancelSellOrder(tokenCodeABC, orderId, {from: accounts[2]});
        }).then(function(result){
            assertOrderCancelEvent(result, price1, amount1, accounts[2], orderId);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[2]});
        }).then(function(result){
            tokenBalance2 += amount1;
            assert.equal(result.toNumber(), tokenBalance2, 'Token Balance ABC for acc[2] should be '+tokenBalance2);
            return sellBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Sell book should be empty");
        });
    });

    it("Place 1 buy order, cancel this order, check balance", function() {
        var price1 = 5;
        var amount1 = 20;
        var orderId;

        return exchangeInstance.addBuyOrder(tokenCodeABC, price1, amount1, {from: accounts[1]})
        .then(function(result){
            orderId = assertNewBuyOrderEvent(result, price1, amount1, accounts[1]);
            return exchangeInstance.getEthBalance.call({from: accounts[1]});
        }).then(function(result){
            ethBalance1 -= amount1*price1;
            assert.equal(result.toNumber(), ethBalance1, 'Ether Balance for acc[1] should be '+ethBalance1 + ' before cancel');
            return exchangeInstance.cancelBuyOrder(tokenCodeABC, orderId, {from: accounts[1]});
        }).then(function(result){
            assertOrderCancelEvent(result, price1, amount1, accounts[1], orderId);
            return exchangeInstance.getEthBalance.call({from: accounts[1]});
        }).then(function(result){
            ethBalance1 += amount1*price1;
            assert.equal(result.toNumber(), ethBalance1, 'Ether Balance for acc[1] should be '+ethBalance1 + ' after cancel');
            return sellBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Sell book should be empty");
        });
    });
});
