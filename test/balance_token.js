var TokenABC = artifacts.require("./TokenABC.sol");
var Exchange = artifacts.require("./Exchange.sol");

contract('Exchange', function(accounts) {
	var tokenInstanceABC;
	var tokenCodeABC;
	var exchangeInstance;
    var acc = accounts[1];
    var amount = 100;
    var deposit1 = 80;
    var withdraw = 50;

	it("save deployed tokenInstanceABC", function(){
		return TokenABC.deployed().then(function (instance) {
		    tokenInstanceABC = instance;
		    return tokenInstanceABC.symbol.call();
		}).then(function (symbol) {
		    tokenCodeABC = symbol;
            tokenInstanceABC.transfer(acc, amount, {from: accounts[0]});
		});
	});

    function assertEvent(eventLog, eventName, sender, amount, token) {
        assert.equal(eventLog.event,
            eventName, eventName + " Event should be emitted");
        assert.equal(eventLog.args.sender, sender,
            "Sender address in Event should be account address");
        assert.equal(eventLog.args.amount.toNumber(), amount,
            "Amount in Event should be deposit/withdraw amount");
        assert.equal(web3.toUtf8(eventLog.args.token), token,
            "Token in Event should be token symbol");
    }

	it("it should be possible to deposit tokens", function() {
        var tokenBalanceBefore = amount;

        return Exchange.deployed().then(function(instance) {
            exchangeInstance = instance;
            return exchangeInstance.addToken(tokenCodeABC, tokenInstanceABC.address);
        }).then(function(){
            return exchangeInstance.getTokenBalance.call(tokenCodeABC, {from: acc});
        }).then(function(balance) {
            assert.equal(balance, 0, 'Exchange balance should 0');
            return tokenInstanceABC.approve(exchangeInstance.address, deposit1, {from: acc});
        }).then(function(txResult) {
            return exchangeInstance.depositToken(tokenCodeABC, deposit1, {from: acc});
        }).then(function(txResult) {
            assertEvent(txResult.logs[0], 'DepositToken', acc, deposit1, tokenCodeABC);
            return exchangeInstance.getTokenBalance.call(tokenCodeABC, {from: acc});
        }).then(function(balance) {
            assert.equal(
                balance,
                deposit1,
                'Exchange balance should be equal to deposit amount'
            );
            return tokenInstanceABC.balanceOf(acc);
        }).then(function(tokenBalance){
            assert.equal(
                tokenBalance.toNumber() + deposit1,
                tokenBalanceBefore,
                'Token Balance check'
            );
        });
	});

    it("it should be possible to withdraw token", function() {
        var exchangeBalanceBefore;
        var tokenBalanceBefore;

        return exchangeInstance.getTokenBalance(tokenCodeABC, {from: acc}).then(function(balance) {
            exchangeBalanceBefore = balance;
            return tokenInstanceABC.balanceOf.call(acc);
        }).then(function(tokenBalance){
            tokenBalanceBefore = tokenBalance;
            return exchangeInstance.withdrawToken(tokenCodeABC, withdraw, {from: acc});
        }).then(function(txResult){
            assertEvent(txResult.logs[0], 'WithdrawalToken', acc, withdraw, tokenCodeABC);
            return exchangeInstance.getTokenBalance.call(tokenCodeABC, {from: acc});
        }).then(function(exchangeBalance) {
            assert.equal(
                exchangeBalance.plus(withdraw).toNumber(),
                exchangeBalanceBefore.toNumber(),
                'Exchange balance should be withdraw+balanceBefore'
            );
            return tokenInstanceABC.balanceOf.call(acc);
        }).then(function(tokenBalance){
            assert.equal(
                tokenBalance.toNumber(),
                tokenBalanceBefore.plus(withdraw).toNumber(),
                'Token balance should be withdraw + balanceBefore'
            );
        });
    });
});
