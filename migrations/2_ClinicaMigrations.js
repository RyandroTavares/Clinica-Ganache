const Clinica = artifacts.require("Clinica");

module.exports = function (deployer) {
  deployer.deploy(Clinica);
};