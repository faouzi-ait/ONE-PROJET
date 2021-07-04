import React from 'react'
import moment from 'moment'
import { Features } from 'javascript/config/features' //not one-lite

const ReportResource = (props) => {
  const { report } = props
  return (
    <div>
      <h2 className="event-report__report-title">Resource Usage</h2>
      <h4 className="event-report__sub">Busiest Times</h4>
      <h5>For Bookings</h5>
      <table className="print-table print-table--list">
        <tbody>
          {Object.keys(report['busiest-times'].bookings).sort().map((key, i) => (
            <tr key={i}>
              <td>Day {i + 1}, {moment.utc(key).format(Features.formats.mediumDate)}, {moment.utc(key).format('HH:mm')}</td>
              <td className="u-align-right">{report['busiest-times'].bookings[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h5>For Clients</h5>
      <table className="print-table print-table--list">
        <tbody>
          {Object.keys(report['busiest-times'].clients).sort().map((key, i) => (
            <tr key={i}>
              <td>Day {i + 1}, {moment.utc(key).format(Features.formats.mediumDate)}, {moment.utc(key).format('HH:mm')}</td>
              <td className="u-align-right">{report['busiest-times'].clients[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr/>
      <h4 className="event-report__sub">Lunch Bookings</h4>
      <h5>Usage</h5>
      <table className="print-table print-table--list">
        <tbody>
          <tr>
            <td>All Days</td>
            <td className="u-align-center"></td>
            <td className="u-align-right">{report['lunch-bookings-usage']['event usage']['all days'].percentage}%</td>
          </tr>
          {Object.keys(report['lunch-bookings-usage']['event usage']).sort().map((key, i) => {
            if (key === 'all days') {
              return null
            }
            return (
              <tr key={i}>
                <td>Day {i + 1}, {moment.utc(key).format(Features.formats.mediumDate)}</td>
                <td className="u-align-center">{report['lunch-bookings-usage']['event usage'][key].used}/{report['lunch-bookings-usage']['event usage'][key].available}</td>
                <td className="u-align-right">{report['lunch-bookings-usage']['event usage'][key].percentage}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {report['lunch-bookings-usage']['top 3'] && [
        <h5>Top 3</h5>,
        <table className="print-table print-table--list">
          <tbody>
            {report['lunch-bookings-usage']['top 3'].map((item, i) => {
              return (
                <tr key={i}>
                  <td>{item.locaton}</td>
                  <td className="u-align-center">Slots: {item.usage.slots}</td>
                  <td className="u-align-right">{item.usage.usage}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ]}
      {report['lunch-bookings-usage']['bottom 3'] && [
        <h5>Bottom 3</h5>,
        <table className="print-table print-table--list">
          <tbody>
            {report['lunch-bookings-usage']['bottom 3'].map((item, i) => {
              return (
                <tr key={i}>
                  <td>{item.locaton}</td>
                  <td className="u-align-center">Slots: {item.usage.slots}</td>
                  <td className="u-align-right">{item.usage.usage}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ]}
      <hr/>
      <h4 className="event-report__sub">Meetings</h4>
      <h5>Usage</h5>
      <table className="print-table print-table--list">
        <tbody>
          <tr>
            <td>All Days</td>
            <td className="u-align-right">{report['meeting-usage']['event usage']['all days'].percentage}%</td>
          </tr>
          {Object.keys(report['meeting-usage']['event usage']).sort().map((key, i) => {
            if (key === 'all days') {
              return null
            }
            return (
              <tr key={i}>
                <td>Day {i + 1}, {moment.utc(key).format(Features.formats.mediumDate)}</td>
                <td className="u-align-right">{report['meeting-usage']['event usage'][key].percentage}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {report['meeting-usage']['top 3'] && [
        <h5>Top 3</h5>,
        <table className="print-table print-table--list">
          <tbody>
            {report['meeting-usage']['top 3'].map((item, i) => {
              return (
                <tr key={i}>
                  <td>{item.locaton}</td>
                  <td className="u-align-center">Slots: {item.usage.slots}</td>
                  <td className="u-align-right">{item.usage.usage}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ]}
      {report['meeting-usage']['bottom 3'] && [
        <h5>Bottom 3</h5>,
        <table className="print-table print-table--list">
          <tbody>
            {report['meeting-usage']['bottom 3'].map((item, i) => {
              return (
                <tr key={i}>
                  <td>{item.locaton}</td>
                  <td className="u-align-center">Slots: {item.usage.slots}</td>
                  <td className="u-align-right">{item.usage.usage}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ]}
      <hr/>
      <h4 className="event-report__sub">Locations</h4>
      {report['location-usage'].map((location,i) => (
        <div>
          <h4>{location.location}<br/><small>{location['slots per day']} slots per day</small></h4>
          <table className="print-table print-table--list">
            <tbody>
              {Object.keys(location.days).sort().map((key,i) => (
                <tr key={i}>
                  <td>Day {i + 1}, {moment.utc(key).format(Features.formats.mediumDate)}</td>
                  <td className="u-align-right">{location.days[key].percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

export default ReportResource
