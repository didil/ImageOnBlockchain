var CredentialsStore = artifacts.require("./CredentialsStore.sol");
const Web3 = require('web3');

module.exports = function (deployer) {
  const web3 = new Web3(deployer.provider);
  deployer.deploy(CredentialsStore);
};
