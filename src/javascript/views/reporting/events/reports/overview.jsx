import React from 'react'

const ReportOverview = (props) => {
  const report = props.report['event-overview']
  return (
    <div>
      <h2 className="event-report__report-title">Event Overview</h2>
      <h5>Overview</h5>
      <table className="print-table print-table--list">
        <tbody>
          <tr>
            <td>Total number of meetings booked</td>
            <td className="u-align-right">{report['total number of meetings booked']}</td>
          </tr>
          <tr>
            <td>Total number of guests booked into meetings</td>
            <td className="u-align-right">{report['total number of guests booked into meetings']}</td>
          </tr>
        </tbody>
      </table>
      <h5>For Clients</h5>
      <table className="print-table print-table--list">
        <tbody>
          <tr>
            <td>Lunch tables</td>
            <td className="u-align-right">{report['lunch tables']}</td>
          </tr>
          <tr>
            <td>Meeting rooms</td>
            <td className="u-align-right">{report['meeting rooms']}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ReportOverview