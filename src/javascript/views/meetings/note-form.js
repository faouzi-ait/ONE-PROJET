import React from 'react'
import pluralize from 'pluralize'

import Icon from 'javascript/components/icon'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

import ListProgrammeNotesActions from 'javascript/actions/list-programme-notes'
import ListSeriesNotesActions from 'javascript/actions/list-series-notes'
import ListVideoNotesActions from 'javascript/actions/list-video-notes'


const ActionsIndex = {
  'list-programmes': ListProgrammeNotesActions,
  'list-series': ListSeriesNotesActions,
  'list-videos': ListVideoNotesActions
}

class NoteForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      text: ''
    }
  }

  toggle = () => {
    const { open } = this.state
    this.setState({
      open: !open
    })
  }

  onTextChange = (e) => {
    this.setState({
      text: e.target.value
    })
  }

  onSubmit = (e) => {
    const { text } = this.state
    const { resource } = this.props
    const type = resource.type === 'list-series' ? resource.type : pluralize.singular(resource.type)
    e.preventDefault()

    ActionsIndex[resource.type].createResource({
      [type]: resource,
      text
    })

    this.setState({
      text: ''
    })
  }

  render() {
    const { text, open } = this.state

    if (open) {
      return (
        <form onSubmit={this.onSubmit} className="meeting-notes__form">
          <textarea
            value={text}
            className="form__input form__input--textarea"
            onChange={this.onTextChange}
            name="text"
            placholder="Note" />
          <button type="submit" className="button button--filled">Save note</button>
        </form>
      )
    }

    return (
      <button type="button" className="button button--filled button--with-icon" onClick={this.toggle}>
        <ClientChoice>
          <ClientSpecific client="default">
            <Icon width="14" height="14" id="i-add" classes="button__icon" />
          </ClientSpecific>
          <ClientSpecific client="amc | cineflix">
            <Icon width="14" height="14" viewBox="0 0 32 32" id="i-add" classes="button__icon" />
          </ClientSpecific>
        </ClientChoice>
        Add note
      </button>
    )
  }
}

export default NoteForm
