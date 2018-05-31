'use strict';


//const time = require('../test/helpers/increaseTime');
//import increaseTimeTo from '../test/helpers/increaseTime';
const SvdToken = artifacts.require("SvdToken");
const SvdVesting = artifacts.require("SvdVesting");

// const tokenAddress = '0x0ea90440061580533b7df69ec81872335214ce6f';
// const tokenAddress = '0x9011147b16701d5bde024ddc2ba53e590f270d0a';
// const trusteeAddress = '0xba812ec1cc641d4f901482a541d5ebf2c7922031';
// const trusteeAddress = '0xee91d201ef374f8609348e694e14725e8f22e368';


var amounts;
var addresses;
var gasEstimate;

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY; //2
const YEAR = 12 * MONTH;

//let end = new Date(2018, 1, 9, 15, 0, 0);
//let start = ((end).getTime() / 1000);

let now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
let start = now;
let end = start + 5 * YEAR;

module.exports = async function(ending_callback) {

  //Increase by 2 before each new run. Only 5 runs are possible, since only 10 addresses are given. After the fifth run, a new blockchain instance has to be launched.
  var addressIndex = 0;

  // await web3.personal.unlockAccount(addresses[0], 'rinkeby');
  const tokenAddress = "0x45f641245453dec6d3a8792b39a4512dcadab81a";
  const tokenOwner = '0x6b018f0b646f50a436e25d034624ed9b6a1d0bb7';

  const addresses = [
    "0xe5a8fc27f6a8700cbc908a06bf15688eb1dc8ffa",
    "0x6b018f0b646f50a436e25d034624ed9b6a1d0bb7",
    "0xbaf707703b837cdd181e63b59238348d2f0d6906",
    "0x130091726aa60e2d6c6d0aa17920bc1440455701",
    "0x9a17618397cf997a76ca72053f06ef35ed6e258f",
  ];
  var owner = tokenOwner
  var vestee = addresses[1]

  var token = await SvdToken.at(tokenAddress); // deployed(); //at(tokenAddress);
  var trustee = await SvdVesting.new(tokenAddress, {from: owner}); //at(trusteeAddress);

  var balance = 1200 * Math.pow(10,18);

  console.log("minting");
  await token.mint(trustee.address, balance, {from: tokenOwner});

  console.log("SvdVesting: ", trustee.address)
  // await token.mint(owner, 311, {from: tokenOwner});

  // console.log("transfer")
  // await token.transfer(vestee, 11, {from: owner});

  for (const i in addresses) {
    console.log(addresses[i], (await token.balanceOf(addresses[i])).valueOf());
  }

  await trustee.granting(addresses[0],
    100 * Math.pow(10,18),
    (new Date(2017, 4, 30, 15, 0) / 1000),
    (new Date(2017, 4, 30, 15, 0) / 1000),
    (new Date(2022, 4, 30, 15, 0) / 1000),
    MONTH * 3,
    false, {from: owner}) //approx. one year ago

  await trustee.granting(addresses[1],
    200 * Math.pow(10,18),
    (new Date(2015, 4, 30, 15, 0) / 1000),
    (new Date(2015, 4, 30, 15, 0) / 1000),
    (new Date(2020, 4, 30, 15, 0) / 1000),
    MONTH * 3,
    false, {from: owner}) //approx. one year ago
  
  await trustee.granting(addresses[2],
    300 * Math.pow(10,18),
    (new Date(2018, 2, 9, 15, 0) / 1000),
    (new Date(2018, 2, 9, 15, 0) / 1000),
    (new Date(2023, 2, 9, 15, 0) / 1000),
    MONTH * 3,
    false, {from: owner}) //approx. one year ago

  await trustee.granting(addresses[3],
    300 * Math.pow(10,18),
    (new Date(2018, 2, 9, 15, 0) / 1000),
    (new Date(2018, 2, 9, 15, 0) / 1000),
    (new Date(2023, 2, 9, 15, 0) / 1000),
    MONTH * 3,
    false, {from: owner}) //approx. one year ago

  await trustee.granting(addresses[4],
    300 * Math.pow(10,18),
    (new Date(2018, 2, 9, 15, 0) / 1000),
    (new Date(2018, 2, 9, 15, 0) / 1000),
    (new Date(2023, 2, 9, 15, 0) / 1000),
    MONTH * 3,
    false, {from: owner}) //approx. one year ago

  // await trustee.granting("0x9a17618397cf997a76ca72053f06ef35ed6e258f", 150000, 1433087878, 1433087878, 1590767878, 7884000, false) //approx. three years ago
  // await trustee.granting("0x130091726aa60e2d6c6d0aa17920bc1440455701", 200000, 1370015878, 1370015878, 1527695878, 7884000, false) //approx. five years ago

  // for (var acc = 0; acc < addresses.length; acc++) {
  //   var vestee = addresses[acc]
  //   var g_ = await trustee.grants(addresses[acc])
  //   var start = g_[1]
  //   for (var i = 1; i < 61; i++) {
  //     console.log()
  //     console.log('Tokens vested to ', vestee, ' after', i, 'months:', (await trustee.vestedTokens(vestee, start + i * MONTH)).valueOf());
  //   }
  //   console.log('Now, ', vestee, 'has', (await token.balanceOf(vestee)).valueOf(), 'tokens (initial + unlocked).');
  // }
  
  //await increaseTimeTo(end);
  //await trustee.unlockVestedTokens({from: vestee});
  //console.log('At the end,', vestee, 'has', (await token.balanceOf(addresses[0])).valueOf(), 'tokens (initial + unlocked).');
  ending_callback();
}
