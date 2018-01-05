var Exchange = artifacts.require("./Exchange.sol");

contract('balanceEth', function(accounts) {
	var exchangeInstance;
    var gasPrice = 100000000000; //Default price on testRPC
    var acc = accounts[1];

    function assertEvent(eventLog, eventName, sender, amount) {
        assert.equal(eventLog.event,
            eventName, eventName + " Event should be emitted");
        assert.equal(eventLog.args.sender, sender,
            "Sender address in Event should be account address");
        assert.equal(eventLog.args.amount, amount,
            "Amount in Event should be deposit amount");
    }

	it("it should be possible to deposit eth", function() {
        var accountBalanceBefore;
        var amount = web3.toWei(1, 'ether');

        return Exchange.deployed().then(function(instance) {
            exchangeInstance = instance;
            accountBalanceBefore = web3.eth.getBalance(acc);
            return exchangeInstance.getEthBalance({from: acc});
        }).then(function(balance) {
            assert.equal(balance, 0, 'Exchange balance should 0');
            return exchangeInstance.depositEth({from: acc, value: amount});
        }).then(function(txResult){
            assertEvent(txResult.logs[0], 'DepositEth', acc, amount);

            assert.equal(
                accountBalanceBefore
                    .minus(amount)
                    .minus(txResult.receipt.gasUsed * gasPrice)
                    .toNumber(),
                web3.eth.getBalance(acc).toNumber(),
                'Account balance check'
            );
            return exchangeInstance.getEthBalance({from: acc});
        }).then(function(balance) {
            assert.equal(
                balance,
                amount,
                'Exchange balance should be equal to deposit amount'
            );
        });
	});

    it("it should be possible to withdraw eth", function() {
        var accountBalanceBefore = web3.eth.getBalance(accounts[1]);
        var amount = web3.toWei(0.65, 'ether');
        var exchangeBalanceBefore;

        return exchangeInstance.getEthBalance({from: acc}).then(function(balance) {
            exchangeBalanceBefore = balance;
            return exchangeInstance.withdrawEth(amount, {from: acc});
        }).then(function(txResult){
            assertEvent(txResult.logs[0], 'WithdrawalEth', acc, amount);

            var etherGet = web3.toBigNumber(amount)
                .minus(txResult.receipt.gasUsed * gasPrice);

            assert.equal(
                accountBalanceBefore.plus(etherGet).toNumber(),
                web3.eth.getBalance(acc).toNumber(),
                'Account balance check'
            );
            return exchangeInstance.getEthBalance({from: acc});
        }).then(function(currentBalance) {
            assert.equal(
                currentBalance.plus(amount).toNumber(),
                exchangeBalanceBefore.toNumber(),
                'Exchange balance should be amount+balanceBefore'
            );
        });
    });

});
