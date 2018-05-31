'use strict';

const SvdToken = artifacts.require("SvdToken");
const SvdVesting = artifacts.require("SvdVesting");

// console.log(distribution)
var amounts;
var addresses;
var gasEstimate;

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 12 * MONTH;

let endDate = new Date(2018, 1, 9, 15, 0, 0);
let start = ((endDate).getTime() / 1000);

module.exports = async function(ending_callback) {
  var token = await SvdToken.deployed()
  var trustee = await SvdVesting.deployed()
  var balance = 323;

  const addresses = [
    "0x9d08f87cbea4ff72e8c102398c9942974fa85c7d",
    "0x66255e94cc3d9845174d1fc1fe131b3c65304920",
    trustee.address
  ];

  await token.mint(trustee.address, balance)
  await token.mint(addresses[0], 311)
  await token.transfer(addresses[1], 11, {from: addresses[0]})

  for (const i in addresses) {
    console.log(addresses[i], (await token.balanceOf(addresses[i])).valueOf())
  }

  await trustee.granting(
    addresses[0],
    200,
    start,
    start, //uint256 _cliff,
    start + YEAR, //uint256 _end,
    MONTH, //uint256 _installmentLength,
    false); //bool _revocable) */

  for (const i in [1,2,3,4,5,6,7,8,9,10,11,12,13,14]) {
    console.log(i, (await trustee.vestedTokens(addresses[0], start + i * MONTH)).valueOf())
    console.log(i, (await trustee.vestedTokens(addresses[0], start + i * MONTH + 2 * DAY)).valueOf())
  }
  
  // console.log(3, (await trustee.vestedTokens(addresses[0], start + 3 * MONTH)).valueOf())
  // console.log(8, (await trustee.vestedTokens(addresses[0], start + 8 * MONTH)).valueOf())

}


/*  //ChocoToken.deployed().then(token => {
  SvdToken.deployed().then(instance => {
    token = instance;
    return token.DECIMALS()
  })
  .then(decimals => {
    // console.log(token)
    amounts = Object.keys(distribution).map(a => distribution[a] * Math.pow(10, decimals))
    addresses = Object.keys(distribution)

    return token.batchMint.estimateGas(addresses, amounts)
  })
  .then(_gasEstimate => {
    gasEstimate = _gasEstimate;
    console.log('gasEstimate: ', gasEstimate)
    console.log('gasPrice: ', SvdToken.web3.eth.gasPrice)
    return token.batchMint.call(addresses, amounts, {gas: gasEstimate})
  })
  .then(status => {
    console.log('Simulation status: ', status)
    if (true) {
      return token.batchMint(addresses, amounts, {gas: gasEstimate})
    }
  })
  .then(tx => {
    console.log('tx: ', tx)
    if (tx.receipt.status === '0x0') {
      throw 'transaction failed';
    }
    console.log(`Successfully minted ${amounts} to ${addresses}`);
    console.log(`Gas used ${tx.receipt.gasUsed}`);
  })
  .catch(err =>
    console.log(`FAILED to mint ${amounts} to ${addresses}:`, err)
  )
}; */
