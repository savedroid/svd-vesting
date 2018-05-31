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

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('/');
  };
  
  var date = new Date();

module.exports = async function(ending_callback) {
    
    const addresses = [
        "0xe5a8fc27f6a8700cbc908a06bf15688eb1dc8ffa",
        "0x6b018f0b646f50a436e25d034624ed9b6a1d0bb7",
        "0xbaf707703b837cdd181e63b59238348d2f0d6906",
        "0x130091726aa60e2d6c6d0aa17920bc1440455701",
        "0x9a17618397cf997a76ca72053f06ef35ed6e258f",
    ];

    const trustee = SvdVesting.at("0x92DF74d066D1D9a921D3CfC242AfBbFeEAFd53Bc")
    // const 
    

    for (var acc = 4; acc < addresses.length; acc++) {
        var vestee = addresses[acc]
        var g_ = await trustee.grants(addresses[acc])
        var start = g_[1].valueOf()
        console.log('start', new Date(start * 1000))
        for (var i = 1; i < 12 * 5 * 30 + 30; i++) {
            const t = (Number(start) + (i * DAY));
            // console.log('Tokens vested to ', vestee, ' in', start, i * DAY, new Date(t * 1000), 'months:', (await trustee.vestedTokens(vestee, t)).valueOf());
            console.log(trustee.address, ", ", vestee, ", ", (new Date(t * 1000)).yyyymmdd(), ', ', (await trustee.vestedTokens(vestee, t)).valueOf());
        }
        // console.log('Now, ', vestee, 'has', (await token.balanceOf(vestee)).valueOf(), 'tokens (initial + unlocked).');
    }
      
    ending_callback();
}