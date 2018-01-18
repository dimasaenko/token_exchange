var TokenABC = artifacts.require("./TokenABC.sol");
var TokenXYZ = artifacts.require("./TokenXYZ.sol");
var TokenCDF = artifacts.require("./TokenCDF.sol");
var Exchange = artifacts.require("./Exchange.sol");

contract('Exchange', function(accounts) {
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

    it("should be possible to add tokens", function ( ) {
        return Exchange.deployed().then(function (instance) {
            exchangeInstance = instance;
            return instance;
        }).then(function (instance) {
            return exchangeInstance.addToken(tokenCodeABC, tokenInstanceABC.address);
        }).then(function (txResult) {
            assert.equal(txResult.logs[0].event, "TokenAdded", "TokenAddedtoSystem Event should be emitted");
            return exchangeInstance.hasToken.call(tokenCodeABC);
        }).then(function (booleanHasToken) {
            assert.equal(booleanHasToken, true, "The Token has been added");
            return exchangeInstance.hasToken.call(tokenCodeXYZ);
        }).then(function (booleanHasNotToken) {
            assert.equal(booleanHasNotToken, false, "Token XYZ doesn't exist yet");
            return TokenXYZ.deployed();
        }).then(function (instance){
            tokenInstanceXYZ = instance;
            return exchangeInstance.addToken(tokenCodeXYZ, tokenInstanceXYZ.address);
        }).then(function (txResult) {
            assert.equal(txResult.logs[0].event, "TokenAdded", "TokenAddedtoSystem Event should be emitted");
            return exchangeInstance.hasToken.call(tokenCodeXYZ);
        }).then(function(booleanHasToken){
            assert.equal(booleanHasToken, true, "Exchange has TokenXYZ");
            return exchangeInstance.getTokenList();
        }).then(function(result) {
            var codes = result[0];
            assert.equal(codes.length, 2, "Exchange should contain only 2 tokens");
            assert.equal(web3.toUtf8(codes[0]), tokenCodeABC, "First token should be ABC");
            assert.equal(web3.toUtf8(codes[1]), tokenCodeXYZ, "First token should be XYZ");
        });
    });

    it("should throw exception if the same token tried to be added", function(){
        return Exchange.new().then(function (instance) {
            exchangeInstance = instance;
            return exchangeInstance.addToken(tokenCodeABC, tokenInstanceABC.address);
        }).then(function(){
            return exchangeInstance.addToken(tokenCodeABC, tokenInstanceABC.address);
        }).then(function(){
            assert.fail('Expected throw not received');
        }).catch(function(exception) {
            assert.success;
        });
    })
});
