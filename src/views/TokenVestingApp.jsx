import React, { Component } from 'react'
import { Grid, Row, Col } from 'react-bootstrap'

import { getTokenVesting, getSimpleToken } from '../contracts'

import Header from './Header'
import VestingDetails from './VestingDetails'
import VestingSchedule from './VestingSchedule'
import Spinner from './Spinner'

import '../stylesheets/TokenVestingApp.css'


class TokenVestingApp extends Component {
  constructor() {
    super()
    this.state = { name: 'Token', loading: true }
  }

  componentDidMount() {
    this.getData().then((s) => {
      this.setState(s)
    })
  }

  render() {
    console.log("TokenVestingApp", this.props)
    const { address, holder } = this.props
    return (
      <div className="TokenVestingApp">

        { this.state.loading ? <Spinner /> : null }

        <Header address={ address } token={ this.state.token } tokenName={ this.state.name } />

        <Grid>
          <Row>
            <Col md={12}>
              <VestingDetails
                address={ address }
                token={ this.state.token }
                holder = { holder }
                details={ this.state }
                getData={ () => this.getData().bind(this) }
                setLoader={ x => this.setLoader(x) }
              />
            </Col>
            <Col md={12}>
              <VestingSchedule
                details={ this.state }
                address={ address }
                holder={ holder } />
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }

  setLoader(loading) {
    this.setState({ loading })
  }

  async getData() {
    const { address, holder } = this.props

    const tokenVesting = await getTokenVesting(address)
    const token = await tokenVesting.token()
    const tokenContract = await getSimpleToken(token)

    const grant = await tokenVesting.grants(holder);
    const vested = await tokenVesting.vestedTokens(holder, new Date() / 1000)
    console.log("grant", grant)

    const start = grant[1]
    const end = grant[3]

    const balance  = await tokenContract.balanceOf(address)
    const decimals = await tokenContract.DECIMALS()
    const owner = await tokenVesting.owner()
    // const released = await tokenVesting.released(token)
    const total = grant[0] // balance.plus(released)
    const released = grant[5]
    const name = await tokenContract.NAME()
    const symbol = await tokenContract.SYMBOL()

    return {
      start: start,
      end: end,
      cliff: grant[2],
      total: total,
      released: released,
      vested: vested,
      decimals: decimals,
      beneficiary: holder,
      owner: owner,
      token: token,
      revocable: grant[6],
      revoked: false,
      name: name,
      symbol: symbol,
      loading: false
    }
  }
}


export default TokenVestingApp
