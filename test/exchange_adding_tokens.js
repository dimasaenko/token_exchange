var TokenABC = artifacts.require("./TokenABC.sol");
var TokenXYZ = artifacts.require("./TokenXYZ.sol");
var TokenCDF = artifacts.require("./TokenCDF.sol");
var Exchange = artifacts.require("./Exchange.sol");

contract('exchange_adding_tokens', function(accounts) {
  it("should be possible to add tokens", function () {
      var tokenInstanceABC;
      var exchangeInstance;

      return TokenABC.deployed().then(function (instance) {
          tokenInstanceABC = instance;
          return Exchange.deployed();
      }).then(function (instance) {
          exchangeInstance = instance;
          return exchangeInstance.addToken(
            tokenInstanceABC.symbol,
            tokenInstanceABC.address
          );
      }).then(function (txResult) {
          assert.equal(txResult.logs[0].event, "TokenAdded", "TokenAddedtoSystem Event should be emitted");
          return exchangeInstance.hasToken.call(tokenInstanceABC.symbol);
      }).then(function (booleanHasToken) {
          assert.equal(booleanHasToken, true, "The Token was not added");
          return exchangeInstance.hasToken.call("XYZ");
      }).then(function (booleanHasNotToken) {
          assert.equal(booleanHasNotToken, false, "A Token that doesn't exist was found.");
      });
  });
});
