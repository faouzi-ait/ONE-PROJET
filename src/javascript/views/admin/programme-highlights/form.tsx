// React
import React from 'react'
// Stores
import ProgrammeHighlightsStore from 'javascript/stores/programme-highlights'
// Actions
import ProgrammeHighlightsActions from 'javascript/actions/programme-highlights'
// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import AsyncSearchProgrammes from 'javascript/components/async-search-programmes'
// HOC
import withTheme from 'javascript/utils/theme/withTheme'
// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  category?: {}
  highlightPageId: string | undefined
  closeEvent: () => void
  theme: CustomThemeType
}

interface State {
  highlight: {}
  errors?: {
    programme?: string
  }
  selected: {}
}

class ProgrammeHighlightsFormView extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      highlight: {},
      selected: null,
    }
  }

  componentWillMount() {
    ProgrammeHighlightsStore.on('change', this.props.closeEvent)
    ProgrammeHighlightsStore.on('error', this.setErrorsToState)
  }

  componentWillUnmount() {
    ProgrammeHighlightsStore.removeListener('change', this.props.closeEvent)
    ProgrammeHighlightsStore.removeListener('error', this.setErrorsToState)
  }

  setErrorsToState = () => {
    this.setState({
      errors: ProgrammeHighlightsStore.getErrors(),
    })
  }

  onChange = value => {
    this.setState({
      highlight: {
        programme: value,
      },
      selected: value,
    })
  }

  onSubmit = (e) => {
    const { category, highlightPageId } = this.props
    e.preventDefault()
    ProgrammeHighlightsActions.createResource({
      ...this.state.highlight,
      ...(category && {'programme-highlight-category': category}),
      ...(highlightPageId && {'programme-highlight-page': { id: highlightPageId }}),
    })
  }

  render() {
    const { errors = {} } = this.state
    return (
      <form ref="cms-form" onSubmit={this.onSubmit}>
        <FormControl error={errors.programme}>
          <AsyncSearchProgrammes
            onChange={this.onChange}
            value={this.state.selected}
            // filter={{ restricted: false }}
          />
        </FormControl>

        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className="cms-button">{`Add ${this.props.theme.localisation.programme.upper}`}</Button>
        </div>
      </form>
    )
  }
}

export default withTheme(ProgrammeHighlightsFormView)
