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

	it("it should be possible to deposit and withdraw eth", function() {

	});

});
