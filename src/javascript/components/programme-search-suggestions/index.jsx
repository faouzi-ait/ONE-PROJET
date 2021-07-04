import React from 'react'
import { withRouter } from 'react-router-dom';
import pluralize from 'pluralize'
import striptags from 'striptags'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import searchSuggestionsClientVariables from './variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

import ProgrammeSearchSuggestionActions from 'javascript/actions/programme-search-suggestions'

import ProgrammeSearchSuggestionStore from 'javascript/stores/programme-search-suggestions'

import Autosuggest from 'react-autosuggest'
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import StylePrefixConsumer from 'javascript/utils/style-prefix/style-prefix-consumer'

class ProgrammeSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      query: this.props.value ? decodeURIComponent(this.props.value) : '',
      suggestions: []
    }
  }

  componentWillMount() {
    ProgrammeSearchSuggestionStore.on('change', this.setSuggestions)
  }

  componentWillUnmount() {
    ProgrammeSearchSuggestionStore.removeListener('change', this.setSuggestions)
    ProgrammeSearchSuggestionStore.unsetResources()
  }

  componentDidMount() {
    if (this.props.focusOnMount) {
      document.getElementById('global-search').focus()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      if (this.props.value) {
        this.updateQuery(null, this.props.value)
      } else {
        this.clearQuery()
      }
    }
  }

  updateQuery = (e, newValue) => {
    let searchValue = typeof newValue === 'object' ? newValue.newValue : newValue
    if (searchValue !== undefined){
      try {
        this.setState({
          query: decodeURIComponent(searchValue)
        })
      }
      catch (err) {
        this.setState({
          query: searchValue
        })
      }
    }
  }

  clearQueryAndSubmitQuery = () => {
    this.clearQuery()
    const keywordQuery = {
      'filter[keywords]': ''
    }
    this.props.onSubmit(keywordQuery, false)
  }

  clearQuery = () => {
    this.setState({
      query: ''
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    setTimeout(() => {
      const keywordQuery = {
        'filter[keywords]': encodeURIComponent(this.state.query)
      }
      this.props.onSubmit(keywordQuery, false, this.props.isFiltered)
    }, 100)
  }

  setSuggestions = () => {
    const results = ProgrammeSearchSuggestionStore.getResources()
    const suggestions = [{
      title: `${pluralize(this.props.theme.localisation.programme.upper)}`,
      suggestions: results
    }]
    this.setState({
      suggestions
    })
  }

  fetchSuggestions = ({value}) => {
    const {searchSuggestionsCV, allProgrammes, isFiltered, appliedFilters} = this.props
    clearTimeout(this.timer)
    let params = {
      include: [
        'programme',
        searchSuggestionsCV.programmeFields.includes('catalogues') && 'programme.catalogues'
      ].filter(Boolean).join(','),
      fields: {
        programmes: searchSuggestionsCV.programmeFields
      },
      page: {
        size: 6
      },
      main: 1
    }
    if (allProgrammes) {
      params['filter[all]'] = true
    }
    if (isFiltered) {
      params = { ...params, ...appliedFilters}
    }
    if(searchSuggestionsCV.programmeFields.includes('catalogues')){
      params['fields[catalogues]'] = 'name'
    }
    params['filter[keywords]'] = encodeURIComponent(value)
    this.timer = setTimeout(() => {
      ProgrammeSearchSuggestionActions.getResources(params)
    }, 300)
  }

  renderClear = () => {
    if(this.state.query && this.props.clearQuery) {
      const classes = this.state.focus ? 'programme-search__clear programme-search__clear--focused' : 'programme-search__clear'
      return (
        <Button
          type="button"
          className={ classes }
          classesToPrefix={['programme-search']}
          onClick={ this.clearQueryAndSubmitQuery }
        >
          <Icon id="i-close" />
          Clear Search
        </Button>
      )
    }
  }

  render() {
    const { searchSuggestionsCV, theme} = this.props
    const modifiers = this.props.modifiers ? ['programme-search', ...this.props.modifiers, this.state.query && 'filled'] : ['programme-search', this.state.query && 'filled']
    return (
      <StylePrefixConsumer>
        {(entryPoint) => {
          let formClasses = modifiers.join(' programme-search--')
          if (entryPoint === 'admin') {
            formClasses = formClasses.replace('programme-search', 'cms-programme-search')
          }
          return (
            <form className={ formClasses } onSubmit={ this.handleSubmit }>
              <div className="container">
                <Autosuggest
                  multiSection={true}
                  suggestions={ this.state.suggestions }
                  onSuggestionsFetchRequested={ this.fetchSuggestions }
                  onSuggestionsClearRequested={() => { this.setState({suggestions: []}) }}
                  getSuggestionValue={(suggestion) => (suggestion.title)}
                  renderSuggestion={(suggestion) => {
                    let content = (suggestion.programme || {})['title-with-genre'] || suggestion['title-highlight'] || suggestion.title
                    if(searchSuggestionsCV.programmeFields.includes('catalogues') && suggestion.programme.catalogues?.[0]){
                      content = content + ' - ' + (suggestion.programme.catalogues[0]?.name)
                    }
                    if(searchSuggestionsCV.programmeFields.includes('production-end') && suggestion.programme['production-end']){
                      content = content + ' - ' + (moment(suggestion.programme['production-end']).format('YYYY'))
                    }
                    if (suggestion['introduction-highlight'] || suggestion['description-highlight']){
                      content = content + ' - ' + (suggestion['introduction-highlight'] || suggestion['description-highlight'])
                    }
                    return <span dangerouslySetInnerHTML={{ __html: striptags(content, '<b>') }}></span>
                  }}
                  onSuggestionSelected={this.props.onSuggestionSelected}
                  renderSectionTitle={(section) => (<span>{ section.title }</span>)}
                  getSectionSuggestions={(section) => (section.suggestions)}
                  inputProps={{
                    placeholder: this.props.placeholder || `Search for ${pluralize(theme.localisation.programme.lower)}...`,
                    onChange: this.updateQuery,
                    value: this.state.query,
                    'aria-label': 'programme-autosuggest',
                    className: entryPoint === 'admin' ? 'cms-programme-search__input' : 'programme-search__input',
                    onFocus: () => { this.setState({ focus: true })},
                    onBlur: () => { this.setState({ focus: false })},
                    id: (!this.props.modifiers || this.props.modifiers?.includes('space-above')) ? 'catalogue-search' : 'global-search'
                  }}
                />
                { this.renderClear() }
                <Button type="submit" className={this.props.searchSuggestionsCV.buttonClasses}>
                  <ClientChoice>
                    <ClientSpecific client="default">
                      <Icon id="i-mag"classes="button__icon"/>
                    </ClientSpecific>
                    <ClientSpecific client ="amc | all3 | cineflix | storylab | wildbrain">
                    </ClientSpecific>
                  </ClientChoice>
                  Search
                </Button>
              </div>
            </form>
          )
        }}
      </StylePrefixConsumer>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('searchSuggestionsCV', searchSuggestionsClientVariables),
)
const EnhancedProgrammeSearch = enhance(ProgrammeSearch)

export default React.forwardRef((props, ref) => <EnhancedProgrammeSearch {...props} ref={ref} />)