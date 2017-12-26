var OrderBuyBook = artifacts.require("./OrderBuyBook.sol");
var TokenABC = artifacts.require("./TokenABC.sol");
var TokenXYZ = artifacts.require("./TokenABC.sol");
var TokenCDF = artifacts.require("./TokenABC.sol");
var Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer) {
    deployer.deploy(OrderBuyBook);
    deployer.deploy(TokenABC);
    deployer.deploy(TokenXYZ);
    deployer.deploy(TokenCDF);
    deployer.deploy(Exchange);
};
