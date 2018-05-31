import React, { Component } from 'react'
import { Line } from 'react-chartjs-2'
import moment from 'moment'

import { displayAmount } from '../utils'
import { getTokenVesting, getVestedAmountAt } from '../contracts'

import Promise  from 'bluebird'

class VestingChart extends Component {

  componentWillMount() {
    this.setState({'points': []})
    this.getPoints().then( (p) => {
      this.setState({'points': p})
    })
  }

  render() {
    const chartData = this.chartData()
    console.log("chartData", chartData)
    return <Line data={ chartData } options={ this.chartOptions() } />
  }

  chartData() {
    return {
      datasets: [
        this.fromBaseDataset({
          data: this.state.points
        }),
      ],
    }
  }

  getPoints() {
    console.log("VestingChart.getPoints", this.props)
    const { start, cliff, end, decimals } = this.props.details
    const startDate = new Date(start * 1000);
    const endDate = new Date(end * 1000);
    // const now = new Date() / 1000 // normalize to seconds

    // var now = new Date();
    var days = [];
    for (var d = startDate; d <= endDate; d.setDate(d.getDate() + 7)) {
      days.push(new Date(d) / 1000);
    }

    const _vesting_address = this.props.address;
    const _holder = this.props.holder;

    console.log("days", days)
    console.log(_vesting_address)

    return getTokenVesting(_vesting_address)
      .then(vesting => {
        return Promise.map(days, (d) => {
          return this.getDataPointAt(vesting, _holder, d, decimals)
        }, {concurrency: 50})
      })
  }

  async getDataPointAt(vesting, holder, date, decimals) {
    return {
      x: this.formatDate(date),
      y: displayAmount(await vesting.vestedTokens(holder, date), decimals)
    }
  }

  formatDate(date) {
    return moment(date * 1000).format('MM/DD/YYYY HH:mm')
  }

  getAmountAt(date) {
    const { total, start, end, decimals } = this.props.details
    const slope = (date - start) / (end - start)

    return displayAmount(total, decimals) * slope
  }

  chartOptions() {
    return {
      legend: { display: false },
      scales: {
        xAxes: [ {
          type: "time",
          time: {
            format: 'MM/DD/YYYY HH:mm',
            tooltipFormat: 'll HH:mm'
          },
          scaleLabel: {
            display: true,
            labelString: 'Date'
          }
        }, ],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: this.props.details.symbol || ''
          }
        }]
      },
    }
  }

  fromBaseDataset(opts) {
    return {
      lineTension: 0.1,
      backgroundColor: 'rgba(92,182,228,0.4)',
      borderColor: 'rgba(92,182,228,1)',
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(92,182,228,1)',
      pointBackgroundColor: 'rgba(92,182,228,1)',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(92,182,228,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 5,
      pointHitRadius: 10,
      ...opts
    }
  }
}

export default VestingChart