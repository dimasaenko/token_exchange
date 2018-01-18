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
        assert.equal(log.args.amount.toNumber(), amount, 'Event price should be ' + amount);
        assert.equal(log.args.owner, owner, 'Event owner should be ' + owner);
    }

    function assertOrderClosedEvent(tx, price, amount, buyer, seller) {
        var log = tx.logs[0];
        assert.equal(log.event, 'OrderClosed', "Event Name should be OrderClosed");
        assert.equal(log.args.price.toNumber(), price, 'Event price should be ' + price);
        assert.equal(log.args.amount.toNumber(), amount, 'Event price should be ' + amount);
        assert.equal(log.args.buyer, buyer, 'Event owner should be ' + buyer);
        assert.equal(log.args.seller, seller, 'Event owner should be ' + seller);
    }

    it("place simple sell order, then place buy order, check close order, check balance", function() {
        var price1 = 5;
        var amount1 = 20;

        ethBalance1 -= amount1 * price1;
        ethBalance2 += amount1 * price1;
        tokenBalance1 += amount1;
        tokenBalance2 -= amount1;

        return exchangeInstance.addSellOrder(tokenCodeABC, price1, amount1, {from: accounts[2]})
        .then(function(result){
            assertNewSellOrderEvent(result, price1, amount1, accounts[2]);
            return exchangeInstance.addBuyOrder(tokenCodeABC, price1, amount1, {from: accounts[1]});
        }).then(function(result){
            assertOrderClosedEvent(result, price1, amount1, accounts[1], accounts[2]);
            return exchangeInstance.getEthBalance({from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance1, 'Balance eth for acc[1] should be ' + ethBalance1);
            return exchangeInstance.getEthBalance({from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance2, 'Balance eth for acc[2] should be '+ethBalance2);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance1, 'Token Balance ABC for acc[1] should be '+ tokenBalance1);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance2, 'Token Balance ABC for acc[2] should be '+tokenBalance2);
        }).then(function(result){
            return sellBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Sell book should be empty");
            return buyBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Buy book should be empty");
        });
    });

    it("place simple 3 sell order, then place buy orders, check balance", function() {
        var sellPrice1 = 20;
        var sellAmount1 = 20;

        var sellPrice2 = 10;
        var sellAmount2 = 30;

        var sellPrice3 = 5;
        var sellAmount3 = 12;

        var buyPrice1 = 5;
        var buyAmount1 = 24;

        var buyPrice2 = 10;
        var buyAmount2 = 15;

        var buyPrice3 = 20;
        var buyAmount3 = 15;

        var buyPrice4 = 20;
        var buyAmount4 = 30;

        ethBalance2 += (sellPrice1*sellAmount1 + sellPrice2*sellAmount2 + sellPrice3*sellAmount3);
        ethBalance1 -= (sellPrice1*sellAmount1 + sellPrice2*sellAmount2 + sellPrice3*sellAmount3);

        tokenBalance1 += (sellAmount1 + sellAmount2 + sellAmount3);
        tokenBalance2 -= (sellAmount1 + sellAmount2 + sellAmount3);

            return exchangeInstance.addSellOrder(tokenCodeABC, sellPrice1, sellAmount1, {from: accounts[2]})
        .then(function(result){
            return exchangeInstance.addSellOrder(tokenCodeABC, sellPrice2, sellAmount2, {from: accounts[2]});
        }).then(function(result){
            return exchangeInstance.addSellOrder(tokenCodeABC, sellPrice3, sellAmount3, {from: accounts[2]});
        }).then(function(result){
            return exchangeInstance.addBuyOrder(tokenCodeABC, buyPrice1, buyAmount1, {from: accounts[1]});
        }).then(function(result){
            assertOrderClosedEvent(result, buyPrice1, sellAmount3, accounts[1], accounts[2]);
            return exchangeInstance.addBuyOrder(tokenCodeABC, buyPrice2, buyAmount2, {from: accounts[1]});
        }).then(function(result){
            assertOrderClosedEvent(result, buyPrice2, buyAmount2, accounts[1], accounts[2]);
            return exchangeInstance.addBuyOrder(tokenCodeABC, buyPrice3, buyAmount3, {from: accounts[1]});
        }).then(function(result){
            assertOrderClosedEvent(result, buyPrice2, buyAmount2, accounts[1], accounts[2]);
            return exchangeInstance.addBuyOrder(tokenCodeABC, buyPrice4, buyAmount4, {from: accounts[1]});
        }).then(function(result){
            assertOrderClosedEvent(result, sellPrice1, sellAmount1, accounts[1], accounts[2]);
            return exchangeInstance.getEthBalance.call({from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance1, 'Balance eth for acc[1] should be ' + ethBalance1);
            return exchangeInstance.getEthBalance({from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance2, 'Balance eth for acc[2] should be '+ethBalance2);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance1, 'Token Balance ABC for acc[1] should be '+ tokenBalance1);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance2, 'Token Balance ABC for acc[2] should be '+tokenBalance2);
            return sellBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Sell book should be empty");
            return buyBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Buy book should be empty");
        });
    });


    it("1 buy order, the same 1 sell order ", function() {
        var buyPrice1 = 12;
        var buyAmount1 = 20;

        var sellPrice1 = 12;
        var sellAmount1 = 20;

        ethBalance2 += buyPrice1*buyAmount1;
        ethBalance1 -= buyPrice1*buyAmount1;

        tokenBalance1 += buyAmount1;
        tokenBalance2 -= buyAmount1;

            return exchangeInstance.addBuyOrder(tokenCodeABC, buyPrice1, buyAmount1, {from: accounts[1]})
        .then(function(result){
            return exchangeInstance.addSellOrder(tokenCodeABC, sellPrice1, sellAmount1, {from: accounts[2]});
        }).then(function(result){
            assertOrderClosedEvent(result, buyPrice1, buyAmount1, accounts[1], accounts[2]);
            return exchangeInstance.getEthBalance.call({from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance1, 'Balance eth for acc[1] should be ' + ethBalance1);
            return exchangeInstance.getEthBalance({from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance2, 'Balance eth for acc[2] should be '+ethBalance2);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance1, 'Token Balance ABC for acc[1] should be '+ tokenBalance1);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance2, 'Token Balance ABC for acc[2] should be '+tokenBalance2);
            return sellBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Sell book should be empty");
            return buyBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Buy book should be empty");
        });
    });

    // it("initial check", function(){
    //         return exchangeInstance.getEthBalance.call({from: accounts[1]})
    //     .then(function(result){
    //         console.log('Balance eth for acc[1]: ' + result.toNumber());
    //         return exchangeInstance.getEthBalance({from: accounts[2]});
    //     }).then(function(result){
    //         console.log('Balance eth for acc[2]: ' + result.toNumber());
    //         return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[1]});
    //     }).then(function(result){
    //         console.log('Token Balance ABC for acc[1]: ' + result.toNumber());
    //         return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[2]});
    //     }).then(function(result){
    //         console.log('Token Balance ABC for acc[2]: ' + result.toNumber());
    //     });
    // });

    it("1 big buy order, then 2 small sell orders", function() {
        var buyPrice1 = 12;
        var buyAmount1 = 50;

        var sellPrice1 = 12;
        var sellAmount1 = 20;

        var sellPrice2 = 11;
        var sellAmount2 = 30;

        ethBalance2 += sellPrice1*sellAmount1;
        ethBalance1 -= buyPrice1*buyAmount1;

        tokenBalance1 += sellAmount1;
        tokenBalance2 -= sellAmount1;

            return exchangeInstance.addBuyOrder(tokenCodeABC, buyPrice1, buyAmount1, {from: accounts[1]})
        .then(function(result){
            return exchangeInstance.addSellOrder(tokenCodeABC, sellPrice1, sellAmount1, {from: accounts[2]});
        }).then(function(result){
            assertOrderClosedEvent(result, buyPrice1, sellAmount1, accounts[1], accounts[2]);
            return exchangeInstance.getEthBalance.call({from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance1, 'Balance eth for acc[1] should be ' + ethBalance1);
            return exchangeInstance.getEthBalance.call({from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance2, 'Balance eth for acc[2] should be '+ethBalance2);
            return exchangeInstance.getTokenBalance.call(tokenCodeABC, {from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance1, 'Token Balance ABC for acc[1] should be '+ tokenBalance1);
            return exchangeInstance.getTokenBalance.call(tokenCodeABC, {from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance2, 'Token Balance ABC for acc[2] should be '+tokenBalance2);
            return exchangeInstance.addSellOrder(tokenCodeABC, sellPrice2, sellAmount2, {from: accounts[2]});
        }).then(function(result){
            assertOrderClosedEvent(result, buyPrice1, sellAmount2, accounts[1], accounts[2]);
            ethBalance2 += buyPrice1*sellAmount2;
            tokenBalance1 += sellAmount2;
            tokenBalance2 -= sellAmount2;
            return exchangeInstance.getEthBalance.call({from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance1, 'Balance eth for acc[1] should be ' + ethBalance1);
            return exchangeInstance.getEthBalance.call({from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance2, 'Balance eth for acc[2] should be '+ethBalance2);
            return exchangeInstance.getTokenBalance.call(tokenCodeABC, {from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance1, 'Token Balance ABC for acc[1] should be '+ tokenBalance1);
            return exchangeInstance.getTokenBalance.call(tokenCodeABC, {from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance2, 'Token Balance ABC for acc[2] should be '+tokenBalance2);
            return sellBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Sell book should be empty");
            return buyBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Buy book should be empty");
        });
    });


    it("2 buy orders, then 2 sell orders with less price with over amount", function() {
        var buyPrice1 = 12;
        var buyAmount1 = 30;

        var buyPrice2 = 14;
        var buyAmount2 = 20;

        var sellPrice1 = 12;
        var sellAmount1 = 30;

        var sellPrice2 = 8;
        var sellAmount2 = 50;


        ethBalance2 += buyPrice1*buyAmount1 + buyPrice2*buyAmount2;
        ethBalance1 -= buyPrice1*buyAmount1 + buyPrice2*buyAmount2;

        tokenBalance1 += buyAmount1 + buyAmount2;
        tokenBalance2 -= buyAmount1 + buyAmount2;

            return exchangeInstance.addBuyOrder(tokenCodeABC, buyPrice1, buyAmount1, {from: accounts[1]})
        .then(function(result){
            return exchangeInstance.addBuyOrder(tokenCodeABC, buyPrice2, buyAmount2, {from: accounts[1]});
        }).then(function(result){
            return exchangeInstance.addSellOrder(tokenCodeABC, sellPrice1, sellAmount1, {from: accounts[2]});
        }).then(function(result){
            assertOrderClosedEvent(result, buyPrice2, buyAmount2, accounts[1], accounts[2]);
            return exchangeInstance.addSellOrder(tokenCodeABC, sellPrice2, sellAmount2, {from: accounts[2]});
        }).then(function(result){
            return exchangeInstance.getEthBalance.call({from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance1, 'Balance eth for acc[1] should be ' + ethBalance1);
            return exchangeInstance.getEthBalance({from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), ethBalance2, 'Balance eth for acc[2] should be '+ethBalance2);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[1]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance1, 'Token Balance ABC for acc[1] should be '+ tokenBalance1);
            return exchangeInstance.getTokenBalance(tokenCodeABC, {from: accounts[2]});
        }).then(function(result){
            assert.equal(result.toNumber(), tokenBalance2, 'Token Balance ABC for acc[2] should be '+tokenBalance2);
            return sellBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Sell book should be empty");
            return buyBook.getList.call();
        }).then(function(result){
            assert.equal(result[0].length, 0, "Buy book should be empty");
        });
    });
});
