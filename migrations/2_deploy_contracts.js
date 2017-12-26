var OrderBuyBook = artifacts.require("./OrderBuyBook.sol");
var TokenABC = artifacts.require("./TokenABC.sol");

module.exports = function(deployer) {
  deployer.deploy(OrderBuyBook);
  deployer.deploy(TokenABC);
};
