import React, { useState } from 'react'
import moment from 'moment'

import Tabs from 'javascript/components/tabs'
import Note from 'javascript/components/note'

import Actions from 'javascript/actions/meeting-notes'

class Notes extends React.Component {
  deleteNote = n => {
    Actions.deleteResource(n)
  }
  render() {
    const isAfterMeeting =
      new Date().getTime() >
      moment.utc(this.props.meeting['start-time']).unix() * 1000

    return (
      <div className="meeting-notes">
        <Tabs>
          <div title="Pre-meeting notes">
            <table className="meeting-notes__table">
              <tbody>
                {this.props.meeting['meeting-notes']
                  .filter(n => n['pre-meeting-note'])
                  .map(n => (
                    <Note
                      note={n}
                      deleteNote={n => {
                        this.deleteNote(n)
                      }}
                      parent="table"
                      key={n.id}
                    />
                  ))}
              </tbody>
            </table>
            {this.props.editable && !isAfterMeeting && (
              <MeetingNotesForm meeting={this.props.meeting} />
            )}
          </div>
          <div title="Post-meeting notes">
            <table className="meeting-notes__table">
              <tbody>
                {this.props.meeting['meeting-notes']
                  .filter(n => !n['pre-meeting-note'])
                  .map(n => (
                    <Note
                      note={n}
                      deleteNote={n => {
                        this.deleteNote(n)
                      }}
                      parent="table"
                      key={n.id}
                    />
                  ))}
              </tbody>
            </table>
            {this.props.editable && isAfterMeeting && (
              <MeetingNotesForm meeting={this.props.meeting} />
            )}
          </div>
        </Tabs>
      </div>
    )
  }
}

const MeetingNotesForm = ({ meeting }) => {
  const [note, setNote] = useState('')
  const addNote = e => {
    e.preventDefault()

    if (note.length) {
      Actions.createResource({
        meeting: { id: meeting.id },
        text: note,
        'pre-meeting-note': moment.utc(meeting['start-time']) > moment(),
      })
      setNote('')
    }
  }
  return (
    <form className="meeting-notes__form" onSubmit={addNote}>
      <textarea
        className="form__input form__input--textarea"
        placholder="Note"
        value={note}
        onChange={e => setNote(e.target.value)}
      ></textarea>
      <button type="submit" className="button button--filled">
        Add note
      </button>
    </form>
  )
}

export default Notes
