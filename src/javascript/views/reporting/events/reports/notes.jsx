import React from 'react'

const ReportNotes = (props) => {
  const report = props.report['event-notes']
  return (
    <div>
      <h1 className="event-report__report-title">Event Notes</h1>
      {report.map((meeting,i) => (
        <table className="print-table" key={i}>
          <tbody>
            <tr>
              <td className="big">{meeting.meeting}</td>
            </tr>
            {meeting.notes.map((n,j) => (
              <tr>
                <td>{n.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}

export default ReportNotes