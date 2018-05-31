var SvdVesting = artifacts.require("./SvdVesting.sol");
var SvdToken = artifacts.require("./SvdToken.sol")

module.exports = function(deployer, network, accounts) {
  console.log(accounts);
  
  /*deployer.deploy(SvdToken)
	.then (svd => {
    console.log(svd.address)
		return deployer.deploy(SvdVesting, svd.address)
  })*/
  deployer.deploy(SvdVesting, "0x45f641245453dec6d3a8792b39a4512dcadab81a")
  .then(console.log)
  .catch(console.error);
};


/*
var SvdToken = artifacts.require("./SvdToken.sol");
var SvdVesting = artifacts.require("./SvdVesting.sol");

function ether(n) {
  return new web3.BigNumber(web3.toWei(n, 'ether'))
}

module.exports = async function(deployer, network, accounts) {

  const MINUTE = 60;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;
  const MONTH = 30 * DAY;

  const startDate = new Date(2018, 2, 9, 15, 0, 0);
  const startTime = ((startDate).getTime() / 1000);
  const endDate = new Date(2023, 2, 9, 15, 0, 0);
  const endTime = ((endDate).getTime() / 1000);

  const rate = 1000.0;

  const minWei = ether(10 / rate);
  const maxWei = ether(100000 / rate);
  const minWeiWhitelist = ether(1000 / rate)

  console.log("SvdVesting");

  await deployer.deploy(SvdToken)

  await deployer.deploy(SvdVesting, SvdToken.address)

  const token = await SvdToken.deployed()
  const decimals = await token.DECIMALS()
  const amount = 1000 * Math.pow(10, decimals)
  const vesting = await SvdVesting.deployed()

  await token.mint(SvdVesting.address, amount)
  
  await vesting.granting(
    accounts[0],
    amount,
    startTime,
    startTime, //uint256 _cliff,
    endTime, //uint256 _end,
    MONTH * 3, //uint256 _installmentLength,
    false)

  console.log("done");
};
*/