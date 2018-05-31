'use strict';

function latestTime() {
  return web3.eth.getBlock('latest').timestamp;
}

// Increases testrpc time by the passed duration in seconds
function increaseTime(duration) {
  const id = Date.now();

  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [duration],
      id: id,
    }, err1 => {
      if (err1) return reject(err1);

      web3.currentProvider.sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: id+1,
      }, (err2, res) => {
        return err2 ? reject(err2) : resolve(res);
      });
    });
  });
}

/**
 * Beware that due to the need of calling two separate testrpc methods and rpc calls overhead
 * it's hard to increase time precisely to a target point so design your test to tolerate
 * small fluctuations from time to time.
 *
 * @param target time in seconds
 */
function increaseTimeTo(target) {
  let now = latestTime();
  if (target < now) throw Error(`Cannot increase current time(${now}) to a moment in the past(${target})`);
  let diff = target - now;
  return increaseTime(diff);
}


//const time = require('../test/helpers/increaseTime');
//import increaseTimeTo from '../test/helpers/increaseTime';
const SvdToken = artifacts.require("SvdToken");
const SvdVesting = artifacts.require("SvdVesting");

var amounts;
var addresses;
var gasEstimate;

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 12 * MONTH;

//let end = new Date(2018, 1, 9, 15, 0, 0);
//let start = ((end).getTime() / 1000);

let now = web3.eth.getBlock(web3.eth.blockNumber).timestamp;
let start = now;
let end = start + 5 * YEAR;

module.exports = async function(ending_callback) {
 
  var token = await SvdToken.deployed();
  var trustee = await SvdVesting.deployed();
  var balance = 323;

  //Increase by 2 before each new run. Only 5 runs are possible, since only 10 addresses are given. After the fifth run, a new blockchain instance has to be launched.
  var addressIndex = 0;
  const addresses = [
    web3.eth.accounts[addressIndex],
    web3.eth.accounts[addressIndex + 1],
    trustee.address
  ];
  
  await token.mint(trustee.address, balance);
  await token.mint(addresses[0], 311);
  await token.transfer(addresses[1], 11, {from: addresses[0]});

  for (const i in addresses) {
    console.log(addresses[i], (await token.balanceOf(addresses[i])).valueOf());
  }

  await trustee.granting(
    addresses[0],
    200,
    start,
    start, //uint256 _cliff,
    end, //uint256 _end,
    3 * MONTH, //uint256 _installmentLength,
    false); //bool _revocable) */

  for (var i = 1; i < 61; i++) {
    console.log('Tokens vested after', i, 'months:', (await trustee.vestedTokens(addresses[0], start + i * MONTH)).valueOf());
    //console.log('Tokens vested after', i, 'months and 2 days:', (await trustee.vestedTokens(addresses[0], start + i * MONTH + 2 * DAY)).valueOf());
    await increaseTimeTo(start + i * MONTH);
    await trustee.unlockVestedTokens({from: addresses[0]});
    console.log('After', i, 'months,', addresses[0], 'has', (await token.balanceOf(addresses[0])).valueOf(), 'tokens (initial + unlocked).');
  }
  
  //await increaseTimeTo(end);
  //await trustee.unlockVestedTokens({from: addresses[0]});
  //console.log('At the end,', addresses[0], 'has', (await token.balanceOf(addresses[0])).valueOf(), 'tokens (initial + unlocked).');
}