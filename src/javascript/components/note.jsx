import React from 'react'
import moment from 'moment'
import Icon from 'javascript/components/icon'
import withTheme from 'javascript/utils/theme/withTheme'

const Note = ({ note, ...props }) => {
  const { theme } = props
  switch (props.parent) {
    case 'table':
      return (
        <tr className="note note--table">
          <td>
            <time className="note__date">{`${moment(note['created-at']).format(theme.features.formats.longDate)} at ${moment(note['created-at']).format('HH:mm')}`}</time>
          </td>
          <td>
            <p className="note__text">{note.text}</p>
          </td>
          <td>
            <button onClick={() => { props.deleteNote(note) }} className="delete">
              <Icon width="10" height="10" id="i-close" classes="delete__icon" />
            </button>
          </td>
        </tr>
      )
    default:
      return (
        <div className="note">
          <time className="note__date">{`${moment(note['created-at']).format(theme.features.formats.longDate)} at ${moment(note['created-at']).format('HH:mm')}`}</time>
          <p className="note__text">{note.text}</p>
          <button onClick={() => { props.deleteNote(note) }} className="delete">
            <Icon width="10" height="10" id="i-close" classes="delete__icon" />
          </button>
        </div>
      )
  }
}

export default withTheme(Note)