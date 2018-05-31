require('babel-register');
require('babel-polyfill');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "localhost",
      port: 7545,
      //port: 8545,
      network_id: "*", // Match any network id
      gas: 5712388, // Gas limit used for deploys
      //gasPrice: 1,
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "0x6b018f0b646f50a436e25d034624ed9b6a1d0bb7", // default address to use for any transaction Truffle makes during migrations
      //from: "0x009ae1e9fe05a03b4f7bb2facb9e590c5b0fa935", //0x6b018f0b646f50a436e25d034624ed9b6a1d0bb7", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 6712388 // Gas limit used for deploys
    },
    live: {
      network_id: 1,
      port: 8545,
      host: "localhost",
      gasPrice: 10000000000,
      gas: 700000
    }
  }
};
