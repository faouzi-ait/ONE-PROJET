import React from 'react'
import {ProducerHubDisclaimer} from 'javascript/config/features'


const Disclaimer = (props) => {
  return (
    <div className="producer-hub__disclaimer">
      <h3>DATA DISCLAIMER</h3>
      <p>{ProducerHubDisclaimer}</p>
    </div>
  )
}

export default Disclaimer