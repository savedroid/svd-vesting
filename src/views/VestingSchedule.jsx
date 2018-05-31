import React from 'react'
import VestingChart from './VestingChart'
import Emoji from './Emoji'


function VestingSchedule({ details, address, holder }) {
  return  (
    <div>
      <h4>Vesting schedule</h4>
      { ! details.revoked
          ? details.total > 0
            ? <VestingChart details={ details } address = { address } holder = { holder }/>
            : <Empty />
          : <Revoked />
      }
    </div>
  )
}

function Empty() {
  return <div className="warning">
    <span className="warning-message">
      <Emoji e="⚠️" /> No funds in the contract
    </span>
    <VestingChart details={ {} }
      address = {"0x0"} holder = {{}} />
  </div>
}

function Revoked() {
  return <div className="warning">
    <span className="warning-message">
      <Emoji e="⚠️" /> Revoked
    </span>
    <VestingChart details={ {} }
      address = {"0x0"} holder = {{} } />
  </div>
}

export default VestingSchedule