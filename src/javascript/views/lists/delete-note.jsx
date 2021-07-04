import React from 'react'

// Actions
import ListProgrammeNotesAction from 'javascript/actions/list-programme-notes'
import ListSeriesNotesAction from 'javascript/actions/list-series-notes'
import ListVideoNotesAction from 'javascript/actions/list-video-notes'

// Store
import ListProgrammeNotesStore from 'javascript/stores/list-programme-notes'
import ListSeriesNotesStore from 'javascript/stores/list-series-notes'
import ListVideoNotesStore from 'javascript/stores/list-video-notes'

export default class DeleteMeetingsNotes extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resource: props.resource,
      loading: false
    }
    this.types = {
      'list-programme-notes': ListProgrammeNotesAction,
      'list-series-notes': ListSeriesNotesAction,
      'list-video-notes': ListVideoNotesAction
    }
    this.type = props.resource.type
  }

  componentWillMount() {
    ListProgrammeNotesStore.on('change', this.props.closeEvent)
    ListSeriesNotesStore.on('change', this.props.closeEvent)
    ListVideoNotesStore.on('change', this.props.closeEvent)
  }

  componentWillUnmount() {
    ListProgrammeNotesStore.removeListener('change', this.props.closeEvent)
    ListSeriesNotesStore.removeListener('change', this.props.closeEvent)
    ListVideoNotesStore.removeListener('change', this.props.closeEvent)
  }
  
  deleteResource = () => {
    this.setState({
      loading: true
    })
    
    this.types[this.type].deleteResource(this.state.resource)
  }

  render() {
    let classes = ['button', 'filled', 'reversed', this.state.loading && 'loading'].join(' button--')
    return (
      <form className="form form--skinny" onSubmit={ this.deleteResource }>
        <div>
          <div className="form__control">
            <p>Are you sure you want to delete this note?</p>
          </div>
          <div class="form__control form__control--actions">
            <button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</button>
            <button type="button" className={ classes } onClick={ this.deleteResource }>Delete</button>
          </div>
        </div>
      </form>
    )
  }
}