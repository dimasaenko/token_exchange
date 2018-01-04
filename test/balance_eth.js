var TokenABC = artifacts.require("./TokenABC.sol");
var TokenXYZ = artifacts.require("./TokenXYZ.sol");
var TokenCDF = artifacts.require("./TokenCDF.sol");
var Exchange = artifacts.require("./Exchange.sol");

contract('balanceEth', function(accounts) {
	var tokenInstanceABC;
	var tokenCodeABC;
	var tokenInstanceXYZ;
	var tokenCodeXYZ;
	var exchangeInstance;

	it("save deployed tokenInstanceABC", function(){
		return TokenABC.deployed().then(function (instance) {
		    tokenInstanceABC = instance;
		    return tokenInstanceABC.symbol.call();
		}).then(function (symbol) {
		    tokenCodeABC = symbol;
		});
	});

	it("save deployed tokenInstanceXYZ", function(){
		return TokenXYZ.deployed().then(function (instance) {
			tokenInstanceXYZ = instance;
			return tokenInstanceXYZ.symbol.call();
		}).then(function (symbol) {
			tokenCodeXYZ = symbol;
		});
	});

	it("add few tokens to the exchange", function() {
		return Exchange.deployed().then(function(instance) {
			exchangeInstance = instance;
		}).then(function() {
			return exchangeInstance.addToken(tokenCodeABC, tokenInstanceABC.address);
		}).then(function() {
			return exchangeInstance.addToken(tokenCodeXYZ, tokenInstanceXYZ.address)
		});
	});

	it("it should be possible to deposit eth", function() {
        var gasPrice = 100000000000; //Default price on testRPC
        var accountBalanceBefore = web3.eth.getBalance(accounts[1]).toNumber();
        var amount = Number(web3.toWei(1, 'ether'));

        return exchangeInstance.getEthBalance({from: accounts[1]}).then(function(balance) {
            assert.equal(balance, 0, 'Exchange balance should 0');
            return exchangeInstance.depositEth({from: accounts[1], value: amount})
        }).then(function(txResult){
            assert.equal(txResult.logs[0].event,
                "DepositEth", "DepositEth Event should be emitted");
            assert.equal(txResult.logs[0].args.sender, accounts[1],
                "Sender address in Event should be account address");
            assert.equal(txResult.logs[0].args.amount, amount,
                "Amount in Event should be deposit amount");

            var etherSpent = Number(txResult.receipt.gasUsed) * gasPrice + amount;
            assert.equal(
                etherSpent + web3.eth.getBalance(accounts[1]).toNumber(),
                accountBalanceBefore, 'Account balance check');
            return exchangeInstance.getEthBalance({from: accounts[1]});
        }).then(function(balance) {
            assert.equal(balance, amount, 'Exchange balance should be equal to deposit amount');
        });
	});

    // it("it should be possible to withdraw eth", function() {
    //     var gasPrice = 100000000000; //Default price on testRPC
    //     var accountBalanceBefore = web3.eth.getBalance(accounts[1]).toNumber();
    //     var amount = Number(web3.toWei(0.65, 'ether'));
    //     var exchangeBalanceBefore;
    //
    //     return exchangeInstance.getEthBalance({from: accounts[1]}).then(function(balance) {
    //         assert.equal(balance, 0, 'Exchange balance should 0');
    //         return exchangeInstance.depositEth({from: accounts[1], value: amount})
    //     }).then(function(txResult){
    //         assert.equal(txResult.logs[0].event,
    //             "DepositEth", "DepositEth Event should be emitted");
    //         assert.equal(txResult.logs[0].args.sender, accounts[1],
    //             "Sender address in Event should be account address");
    //         assert.equal(txResult.logs[0].args.amount, amount,
    //             "Amount in Event should be deposit amount");
    //
    //         var etherSpent = Number(txResult.receipt.gasUsed) * gasPrice + amount;
    //         assert.equal(
    //             etherSpent + web3.eth.getBalance(accounts[1]).toNumber(),
    //             accountBalanceBefore, 'Account balance check');
    //         return exchangeInstance.getEthBalance({from: accounts[1]});
    //     }).then(function(balance) {
    //         assert.equal(balance, amount, 'Exchange balance should be equal to deposit amount');
    //     });
    // });

});
