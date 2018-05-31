import React from 'react'

function ContractLink({ address }) {
  const href = `https://rinkeby.etherscan.io/address/${address}`
  return <a href={ href } target="_blank">{ address }</a>
}

function TokenLink({ address, name }) {
  const href = `https://rinkeby.etherscan.io/token/${address}`
  return <a href={ href } target="_blank">{ name }</a>
}


export { ContractLink, TokenLink }