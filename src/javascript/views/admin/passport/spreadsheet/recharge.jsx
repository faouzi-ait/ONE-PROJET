import React, { useState } from 'react'

import { Features } from 'javascript/config/features'

const RechargeBlock = (props) => {
  return (
    <div className="grid grid--justify" style={{
      flexDirection: 'column',
      border: '1px solid black',
      padding: '20px 10px'
    }}>
      <h3 className="grid grid--justify">{props.title}</h3>
      <h2 className="grid grid--justify">{`${Features.passport.rechargePrefix}  ${props.amount}`}</h2>
    </div>
  )
}

const PassportSpreadsheetRecharges = (props) => {

  const { market } = props
  return (
    <div className="container">
      <section className="panel ">
        <h3 className="cms-form__title cms-form__title--compact">Recharge Costs</h3>
        <div className="grid grid--stretch grid-three">
          <RechargeBlock title={'Hotel Recharge'} amount={market['hotel-recharge-amount']} />
          <RechargeBlock title={'Attendee Recharge'} amount={market['trip-recharge-amount']} />
          <RechargeBlock title={'Total Recharge'} amount={market['total-recharge-amount']} />
        </div>
      </section>
    </div>
  )
}

export default PassportSpreadsheetRecharges
