// React
import React from 'react'
import pluralize from 'pluralize'
// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import NavLink from 'javascript/components/nav-link'
// Actions
import ProgrammeActions from 'javascript/actions/programmes'
// Store
import ProgrammesStore from 'javascript/stores/programmes'
// hoc
import withTheme from 'javascript/utils/theme/withTheme'

class ProgrammesDeleteFrom extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  componentWillMount() {
    ProgrammesStore.on('change', this.onDeletion)
  }

  componentWillUnmount() {
    ProgrammesStore.removeListener('change', this.onDeletion)
  }

  onDeletion = () => {
    this.props.onDeletion()
  }

  deleteProgramme = (programme) => {
    this.setState({ loading: true })
    ProgrammeActions.deleteResource(programme)
  }

  renderDeleteForm = () => {
    const { deleteProgramme, closeEvent, theme } = this.props
    let buttonClasses = this.state.loading ? 'button button--filled button--reversed button--loading' : 'button button--filled button--reversed'
    if(deleteProgramme) {
      if(deleteProgramme['series-count'] > 0) {
        return (
          <div className="u-align-center">
            <p>This {theme.localisation.programme.lower} has { deleteProgramme['series-count'] } {theme.localisation.series.lower}(s). Please delete all <NavLink to={`/admin/${theme.localisation.programme.path}/${deleteProgramme.id}/${theme.localisation.series.path}/` }>{pluralize(theme.localisation.series.lower)}</NavLink> first.</p>
            <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
          </div>
        )
      } else if (deleteProgramme['videos-count'] > 0) {
        return (
          <div className="u-align-center">
            <p>This {theme.localisation.programme.lower} has { deleteProgramme['videos-count'] } video(s). Please delete all <NavLink to={`/admin/programmes/${deleteProgramme.id}/videos` }>videos</NavLink> first.</p>
            <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
          </div>
        )
      } else {
        return (
          <div>
            <div className="cms-form__control">
              <p>Are you sure you want to delete the {theme.localisation.programme.upper} <strong>{ deleteProgramme.title }</strong>? This will delete all associated assets.</p>
            </div>
            <div class="cms-form__control cms-form__control--actions">
              <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
              <Button type="button" className={ buttonClasses } onClick={() => { this.deleteProgramme(deleteProgramme) } }>Delete</Button>
            </div>
          </div>
        )
      }
    }
  }

  render() {
    const { programme } = this.props
    return (
      <form className="cms-form" onSubmit={ this.deleteProgramme }>
        { this.renderDeleteForm() }
      </form>
    )
  }
}

export default withTheme(ProgrammesDeleteFrom)