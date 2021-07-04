import React, {useEffect, useState, useRef} from 'react'
import moment from 'moment'

import { Features, Localisation } from 'javascript/config/features'

let logo = require('images/theme/logo-header.svg')

import 'stylesheets/core/components/producer-hub/print-preview'

//Components
import SeriesTable from 'javascript/views/producer-hub/series/series-table'
import Disclaimer from 'javascript/views/producer-hub/series/disclaimer'


class PrintPage extends React.Component {
  render() {
    const {
      allVisibleRows,
      endDate,
      producerName,
      seriesName,
      startDate,
    } = this.props

    return (
      <div className="print-preview__page">
        <div className="print-preview__header">
          <img className="print-preview__logo"src={logo} />
          <div className="print-preview__title">
            <h3>
              {producerName}
              {producerName.length && seriesName.length ? <span style={{padding: '0px 20px'}}>: :</span> : null}
              {seriesName}
            </h3>
          </div>
          <div className="print-preview__dates">
            <h4>
              {moment(startDate).format(Features.ShortDateFormat)}
              <span style={{padding: '0px 8px'}}>-</span>
              {moment(endDate).format(Features.ShortDateFormat)}
            </h4>
          </div>
        </div>
        <Disclaimer />
        <div className="print-preview__table">
          <SeriesTable
            totalRows={this.props.allVisibleRows}
          />
        </div>
        <div className="print-preview__footer"></div>
      </div>
    )
  }
}

export default PrintPage