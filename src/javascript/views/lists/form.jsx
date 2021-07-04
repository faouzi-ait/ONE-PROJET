// React
import React from 'react'
import pluralize from 'pluralize'

// Stores
import ListsProgrammesStore from 'javascript/stores/lists-programmes'

// Actions
import ListsProgrammesActions from 'javascript/actions/lists-programmes'

// Components
import FormControl from 'javascript/components/form-control'
import ProgrammeSearchSuggestions from 'javascript/components/programme-search-suggestions'

import withTheme from 'javascript/utils/theme/withTheme'

class ListsProgrammesForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      programmes: [],
      selectedProgramme: false,
    }
    this.onResults = []
  }

  componentDidMount() {
    ListsProgrammesStore.on('resourceUpdated', this.props.closeEvent)
  }

  componentWillUnmount() {
    ListsProgrammesStore.removeListener(
      'resourceUpdated',
      this.props.closeEvent,
    )
  }

  updateSelected = selectedProgramme => {
    this.setState(() => ({ selectedProgramme }))
  }

  onSubmit = e => {
    e.preventDefault()
    ListsProgrammesActions.createResource({
      list: this.props.list,
      programme: this.state.selectedProgramme,
    })
  }

  render() {
    const classes = ['form', 'skinny'].join(' form--')
    const { addedProgrammes, theme } = this.props
    return (
      <form class={classes} ref="form" onSubmit={this.onSubmit}>
        <FormControl label={`${pluralize(theme.localisation.programme.upper)}`}>
          <ProgrammeSearchSuggestions
            clearQuery={true}
            onSubmit={() => {/* Does nothing - only works for a selected suggestion */ }}
            onSuggestionSelected={(e, p) => this.updateSelected(p.suggestion.programme)}
            modifiers={['compact']}
            isFiltered={true}
            appliedFilters={{
              'filter[not-ids]': addedProgrammes.join(',')
            }}
          />
        </FormControl>

        <div class="form__control form__control--actions">
          /* #region  ae | all3 | amc | banijaygroup | cineflix | demo | discovery | endeavor | fremantle | itv | keshet | rtv | storylab | wildbrain */
          <input
            type="submit"
            className="button button--filled"
            value={`Add ${theme.localisation.programme.upper}`}
          />
          /* #endregion */
          /* #region  drg */
          <input
            type="submit"
            className="button button--secondary button--small"
            value={`Add ${theme.localisation.programme.upper}`}
          />
          /* #endregion */
        </div>
      </form>
    )
  }
}

export default withTheme(ListsProgrammesForm)