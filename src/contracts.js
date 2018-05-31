import contract from 'truffle-contract'
import Network from "./network"

export async function getTokenVesting(address, provider) {
  if(address === "0x0") return null;
  const TokenVesting = contract(require('./contracts/SvdVesting.json'))
  provider = provider || await Network.provider()
  TokenVesting.setProvider(provider)
  return TokenVesting.at(address)
}

export async function getSimpleToken(address, provider) {
  const SimpleToken = contract(require('./contracts/SvdToken.json'))
  provider = provider || await Network.provider()
  SimpleToken.setProvider(provider)
  return SimpleToken.at(address)
}

export async function getVestedAmountAt(address, holder, date) {
  console.log("getVestedAmountAt", address)
  const vesting = await getTokenVesting(address)
  const amount = await vesting.vestedTokens(holder, date)
  return amount; 
}

