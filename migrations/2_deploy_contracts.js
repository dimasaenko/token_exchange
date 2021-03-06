var OrderBuyBook = artifacts.require("./OrderBuyBook.sol");
var OrderSellBook = artifacts.require("./OrderSellBook.sol");
var TokenABC = artifacts.require("./TokenABC.sol");
var TokenXYZ = artifacts.require("./TokenXYZ.sol");
var TokenCDF = artifacts.require("./TokenCDF.sol");
var Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer) {
    deployer.deploy(OrderBuyBook);
    deployer.deploy(OrderSellBook);
    deployer.deploy(TokenABC);
    deployer.deploy(TokenXYZ);
    deployer.deploy(TokenCDF);
    deployer.deploy(Exchange);
};
