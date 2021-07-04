import React from 'react'
import moment from 'moment'

import { Features } from 'javascript/config/features'
import { formatCurrency } from 'javascript/utils/generic-tools'

//Components
import NoResults from 'javascript/components/reporting/no-results'


const SeriesTable = ({
  totalRows,
  toggleEpisodeVisiblity
}) => {

  const renderEpisodeRow = (licence) => (
    <tr key={licence.id} >
      <td>{licence['licence-ref']}</td>
      <td>{licence['customer-name']}</td>
      <td>{moment(licence['date-signed']).format(Features.ShortDateFormat)}</td>
      <td>{moment(licence['start-date']).format(Features.ShortDateFormat)}</td>
      <td>{moment(licence['end-date']).format(Features.ShortDateFormat)}</td>
      <td>{licence['territories']}</td>
      <td>{licence['slot-time']}</td>
      <td colSpan="2">{licence['media']}</td>
      <td>{formatCurrency(licence['total-price-sterling'])}</td>
    </tr>
  )

  const renderSubTotalRow = (totalRow) => [
    (
      <tr key={totalRow.id} className="table__sub-total" >
        <td colSpan="2"></td>
        <td colSpan="2">
          { totalRow.episodeRows.length <= 1 || !toggleEpisodeVisiblity ? null : (
            <button type="button" className="button button--filled button--highlight-hover" onClick={toggleEpisodeVisiblity(totalRow.id)}>
              { totalRow.episodesVisible ? 'Hide Episodes' : 'Show All Episodes'}
            </button>
          )}
        </td>
        <td colSpan="4"></td>
        <td style={{textAlign: 'right'}}>
          Sub-Total
        </td>
        <td>
          {formatCurrency(totalRow.subTotal)}
        </td>
      </tr>
    ), (
      <tr className="table__spacer" key={totalRow.id + '-spacer'}>
        <td colSpan="10"></td>
      </tr>
    )
  ]

  if (!totalRows.length) {
    return <NoResults />
  }

  return (
    <table className="table table--report">
      <thead>
        <tr>
          <th>Licence No.</th>
          <th>Customer</th>
          <th>Licence Signed Date</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Territory</th>
          <th>Slot Time</th>
          <th colSpan="2">Media</th>
          <th>Total Licence Price</th>
        </tr>
      </thead>
      <tbody>
      {totalRows.map((totalRow) => {
        const allEpisodes = !totalRow.episodesVisible
          ? [renderEpisodeRow(totalRow.episodeRows[0])]
          : totalRow.episodeRows.map((licence) => renderEpisodeRow(licence))
        return [
          ...allEpisodes,
          renderSubTotalRow(totalRow)
        ]
      })}
      </tbody>
    </table>
  )
}

export default SeriesTable