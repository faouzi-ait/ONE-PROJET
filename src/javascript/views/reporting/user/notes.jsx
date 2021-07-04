import React from 'react'
import moment from 'moment'

// Actions
import ListProgrammeNotesAction from 'javascript/actions/list-programme-notes'
import ListSeriesNotesAction from 'javascript/actions/list-series-notes'
import ListVideoNotesAction from 'javascript/actions/list-video-notes'

// Store
import ListProgrammeNotesStore from 'javascript/stores/list-programme-notes'
import ListSeriesNotesStore from 'javascript/stores/list-series-notes'
import ListVideoNotesStore from 'javascript/stores/list-video-notes'

class ViewListProgrammeNotes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ...props.resource,
      resources: []
    }
    this.types = {
      programme: {
        store: ListProgrammeNotesStore,
        actions: ListProgrammeNotesAction
      },
      series: {
        store: ListSeriesNotesStore,
        actions: ListSeriesNotesAction
      },
      video: {
        store: ListVideoNotesStore,
        actions: ListVideoNotesAction
      }
    }
    this.type = props.resourceType
  }

  componentWillMount() {
    ListProgrammeNotesStore.on('change', this.getResources)
    ListSeriesNotesStore.on('change', this.getResources)
    ListVideoNotesStore.on('change', this.getResources)
  }

  componentWillUnmount() {
    ListProgrammeNotesStore.removeListener('change', this.getResources)
    ListSeriesNotesStore.removeListener('change', this.getResources)
    ListVideoNotesStore.removeListener('change', this.getResources)
  }

  getResources = () => {
    this.setState(() => ({
      resources: this.types[this.type].store.getResources(),
      loading: false,
      text: ''
    }))
  }

  componentDidMount() {
    this.types[this.type].actions.getResources({
      filter: {
        [`list_${this.type}_id`]: this.props.resource.id
      },
      fields: {
        [`list-${this.type}-notes`]: 'text,created-at'
      }
    })
  }

  render() {
    return (
      <div className="notes">
        <ul className="notes__list">
          { this.state.resources.map((note, key) => (
            <li class="note" key={key}>
              <span className="note__date">{ `${moment(note['created-at']).format('ddd Do MMMM')} at ${moment(note['created-at']).format('HH:mm')}` }</span>
              <p className="note__text">{ note.text }</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }
}

export default ViewListProgrammeNotes