import React from 'react'

const ReportSchedule = (props) => {
  const { report } = props
  return (
    <div>
      <h2 className="event-report__report-title">Schedule</h2>
      { (report.schedule || []).map((m,i) => (
        <table className="print-table" key={i}>
          <tbody>
            <tr>
              <td colSpan="2" className="big">{m.location}</td>
              <td className="big">{m.date}</td>
              <td>
                <div><strong>{m.start_time}</strong></div>
                <div><strong>{m.end_time}</strong></div>
              </td>
            </tr>
            <tr>
              <td><strong>Title</strong></td>
              <td>{m.name}</td>
              <td><strong>Type</strong></td>
              <td>{m.meeting_type}</td>
            </tr>
            <tr>
              <td><strong>Host</strong></td>
              <td>{m.lead_host}</td>
              <td><strong>Companies</strong></td>
              <td>{m.non_vip_guests_companies}</td>
            </tr>
            <tr>
              <td><strong>Attendees</strong></td>
              <td>{m.non_vip_guests}</td>
              <td><strong>VIP Atten</strong></td>
              <td>{m.vip_guests}</td>
            </tr>
            <tr>
              <td className="no-border" colSpan="3"></td>
              <td>{m.meeting_attendees_count}/{m.meeting_capacity}</td>
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  )
}

export default ReportSchedule