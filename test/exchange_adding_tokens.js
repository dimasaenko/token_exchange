var TokenABC = artifacts.require("./TokenABC.sol");
var TokenXYZ = artifacts.require("./TokenXYZ.sol");
var TokenCDF = artifacts.require("./TokenCDF.sol");
var Exchange = artifacts.require("./Exchange.sol");

contract('exchange_adding_tokens', function(accounts) {
  var tokenInstanceABC;
  var tokenInstanceXYZ;
  var exchangeInstance;

  it("should be possible to add tokens", function () {
      return TokenABC.deployed().then(function (instance) {
          tokenInstanceABC = instance;
          return Exchange.deployed();
      }).then(function (instance) {
          exchangeInstance = instance;
          return exchangeInstance.addToken("ABC", tokenInstanceABC.address);
      }).then(function (txResult) {
          assert.equal(txResult.logs[0].event, "TokenAdded", "TokenAddedtoSystem Event should be emitted");
          return exchangeInstance.hasToken.call("ABC");
      }).then(function (booleanHasToken) {
          assert.equal(booleanHasToken, true, "The Token has been added");
          return exchangeInstance.hasToken.call("XYZ");
      }).then(function (booleanHasNotToken) {
          assert.equal(booleanHasNotToken, false, "Token XYZ doesn't exist yet");
          return TokenXYZ.deployed();
      }).then(function (instance){
          tokenInstanceXYZ = instance;
          return exchangeInstance.addToken("XYZ", tokenInstanceXYZ.address);
      }).then(function (txResult) {
          assert.equal(txResult.logs[0].event, "TokenAdded", "TokenAddedtoSystem Event should be emitted");
          return exchangeInstance.hasToken.call("XYZ");
      }).then(function(booleanHasToken){
          assert.equal(booleanHasToken, true, "Exchange has TokenXYZ");
          return exchangeInstance.getTokenList();
      }).then(function(result) {
          var codes = result[0];
          assert.equal(codes.length, 2, "Exchange should contain only 2 tokens");
          assert.equal(web3.toUtf8(codes[0]), "ABC", "First token should be ABC");
          assert.equal(web3.toUtf8(codes[1]), "XYZ", "First token should be XYZ");
      });
  });
});
