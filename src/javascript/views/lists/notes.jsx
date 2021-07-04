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

// Components
import Icon from 'javascript/components/icon'
import FormControl from 'javascript/components/form-control'
import withTheme from 'javascript/utils/theme/withTheme'

class ViewListProgrammeNotes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ...props.resource,
      resources: [],
      errors: {},
      loading: false
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
    ListProgrammeNotesStore.on('error', this.error)
    ListSeriesNotesStore.on('error', this.error)
    ListVideoNotesStore.on('error', this.error)
  }

  componentWillUnmount() {
    ListProgrammeNotesStore.removeListener('change', this.getResources)
    ListSeriesNotesStore.removeListener('change', this.getResources)
    ListVideoNotesStore.removeListener('change', this.getResources)
    ListProgrammeNotesStore.removeListener('error', this.error)
    ListSeriesNotesStore.removeListener('error', this.error)
    ListVideoNotesStore.removeListener('error', this.error)
  }

  error = (store) => () => {
    this.setState(() => ({
      loading: false,
      errors: this.types[this.type].store.getErrors()
    }))
  }

  saveNote = () => {
    const { id, text, loading } = this.state
    if (text && !loading) {
      this.setState(() => ({
        loading: true
      }), () => {
        this.types[this.type].actions.createResource({
          [`list-${this.type}`]: {id}, text
        })
      })
    }
  }

  inputChange = ({target}) => {
    this.setState(() => ({
      [target.name]: target.value
    }))
  }

  getResources = () => {
    this.setState(() => ({
      resources: this.types[this.type].store.getResources(),
      loading: false,
      text: ''
    }))
  }

  componentDidMount() {
    this.textarea.focus()
    this.types[this.type].actions.getResources({
      filter: {
        [`list_${this.type}_id`]: this.props.resource.id
      },
      fields: {
        [`list-${this.type}-notes`]: 'text,created-at'
      }
    })
  }

  deleteNote = (note) => {
    this.types[this.type].actions.deleteResource(note)
  }

  checknewline = (e) => {
    if (!e.shiftKey && e.which === 13) {
      e.preventDefault()
      this.saveNote()
    }
  }

  render() {
    return (
      <div className="notes">
        <div className="form__control">
          <textarea name="text" className="form__input form__input--textarea" value={this.state.text} name="text" onChange={this.inputChange} onKeyDown={this.checknewline} ref={n => { this.textarea = n }}></textarea>
          <p className="form__info">Hit Enter to save, or Shift + Enter for a new line.</p>
          {this.state.errors.text &&
            <p className="form__error">{this.state.errors.text}</p>
          }
        </div>
        <ul className="notes__list">
          { this.state.resources.sort((a,b) => moment(b['created-at']) - moment(a['created-at'])).map((note, key) => (
            <li class="note" key={key}>
              <span className="note__date">{ `${moment(note['created-at']).format('ddd Do MMMM')} at ${moment(note['created-at']).format('HH:mm')}` }</span>
              <p className="note__text">{ note.text }</p>
              { !this.props.hideDelete &&
                <button onClick={() => { this.props.deleteNote(note) }} className="delete">
                  <Icon width="10" height="10" id="i-close" classes="delete__icon" />
                </button>
              }
            </li>
          ))}
          {this.state.resources.length < 1 &&
            <li className="note">No notes available for this { this.props.theme.localisation[this.type].lower }</li>
          }
        </ul>
      </div>
    )
  }
}

export default withTheme(ViewListProgrammeNotes)