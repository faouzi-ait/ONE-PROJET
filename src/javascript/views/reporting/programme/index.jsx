import React from 'react'
import queryString from 'query-string'
import Meta from 'react-document-meta'
import pluralize from 'pluralize'

import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import ReportingBanner from 'javascript/components/reporting/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import ReportTabs from 'javascript/components/reporting/tabs'
import ReportSearch from 'javascript/components/reporting/search'

import ProgrammeService from 'javascript/services/programmes'
import ProgrammeStore from 'javascript/stores/programmes'
import ProgrammeActions from 'javascript/actions/programmes'

import UserViews from 'javascript/views/reporting/programme/reports/user-views'
import ProgrammeActivity from 'javascript/views/reporting/programme/reports/programme-activity'
import SystemActivity from 'javascript/views/reporting/programme/reports/system-activity'
import SmallScreenMessage from 'javascript/components/small-screen-message'
import { ProgrammesAutosuggest } from 'javascript/utils/hooks/use-programmes-autosuggest'
import compose from 'javascript/utils/compose'
import allClientVariables from 'javascript/views/reporting/variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

class ProgrammeReports extends PageHelper {
  constructor(props) {
    super(props)
    this.reportingPath = `/${props.theme.variables.SystemPages.account.path}/${props.theme.variables.SystemPages.reporting.path}`
    this.params = queryString.parse(props.location.search)
    this.state = {
      selectedProgramme: null,
      programmes: [],
      query: '',
    }
    this.browserListener = null
  }

  componentWillMount() {
    ProgrammeStore.on('change', this.getProgramme)
    this.browserListener = this.props.history.listen(this.fetchProgramme)
  }

  componentDidMount() {
    this.fetchProgramme(this.props.location)
  }

  componentWillUnmount() {
    this.browserListener()
    ProgrammeStore.removeListener('change', this.getProgramme)
  }

  navigate = ({ value }) => {
    const { theme } = this.props
    if (value === 0) {
      this.setState(
        {
          selectedProgramme: null,
        },
        () => {
          this.props.history.push(`${this.reportingPath}/${theme.localisation.programme.path}`)
        },
      )
    }
  }

  fetchProgramme = location => {
    if (!this.state.selectedProgramme && this.params && this.params.p) {
      ProgrammeActions.getResource(this.params.p, {
        fields: { programmes: 'title' },
      })
    } else {
      this.finishedLoading()
    }
  }

  updateQuery = (e, { newValue }) => {
    this.setState({
      query: newValue,
    })
  }

  getProgramme = () => {
    const programme = ProgrammeStore.getResource()
    this.setState({
      selectedProgramme: {
        ...programme,
        label: programme.title,
        value: programme.id,
      },
      query: programme.title,
    })
    this.finishedLoading()
  }

  setProgramme = value => {
    this.setState(
      {
        selectedProgramme: value ? value : null,
        query: value ? value['title-with-genre'] : '',
      },
      () => {
        let url = this.props.location.pathname
        if (value) {
          url += `?p=${value.id}`
        } else {
          this.params = null
        }
        this.props.history.push(url)
      },
    )
  }

  searchForProgramme = input => {
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      ProgrammeService.search(
        {
          fields: { programmes: 'title' },
          filter: { search: input.value },
        },
        response => {
          this.setState({
            programmes: response.map(programme =>
              Object.assign(programme, {
                label: programme.title,
                value: programme.id,
              }),
            ),
          })
        },
      )
    }, 300)
  }

  render() {
    const { theme, clientVariables } = this.props
    return (
      <Meta
        title={`${theme.localisation.client} :: Reports`}
        meta={{
          description: 'View your reports',
        }}
      >
        <PageLoader {...this.state}>
          <main>
            <ReportingBanner theme={theme} />
            <Breadcrumbs
              paths={[
                {
                  name: `${theme.variables.SystemPages.account.upper}`,
                  url: `/${theme.variables.SystemPages.account.path}`,
                },
                {
                  name: theme.variables.SystemPages.reporting.upper,
                  url: this.reportingPath,
                },
                {
                  name: `${pluralize(theme.localisation.programme.upper)}`,
                  url: `${this.reportingPath}/${theme.localisation.programme.path}`,
                },
              ]}
              classes={clientVariables.breadcrumbClasses}
            />
            <AccountNavigation currentPage={`/${theme.variables.SystemPages.reporting.path}`} />

            <section className={clientVariables.sectionClasses}>
              <ReportTabs {...this.props} active={2} />
              <ProgrammesAutosuggest
                buildParams={keywords => ({
                  filter: { keywords: encodeURIComponent(keywords) },
                })}
              >
                {({ programmeSuggestions, searchProgrammes, setValue }) => (
                  <ReportSearch
                    modifiers={['reporting']}
                    onChange={this.updateQuery}
                    onSearch={input => searchProgrammes(input.value)}
                    onReset={() => {
                      this.setState({ query: '' })
                      setValue([])
                    }}
                    onClear={() => this.setProgramme(null)}
                    suggestions={programmeSuggestions.map(programme => ({
                      ...programme,
                      value: programme.id,
                      label: programme['title-with-genre'],
                    }))}
                    onSelect={item => {
                      this.setProgramme(item.suggestion)
                      setValue([])
                    }}
                    value={this.state.query}
                    placeholder={`Search for a ${theme.localisation.programme.lower}...`}
                  />
                )}
              </ProgrammesAutosuggest>
              {this.state.selectedProgramme ? (
                <div>
                  <UserViews
                    programme={this.state.selectedProgramme}
                    bg={clientVariables.blockBgClasses}
                    onClick={() => this.setProgramme(null)}
                  />
                  <ProgrammeActivity
                    programme={this.state.selectedProgramme}
                    bg={clientVariables.blockBgClasses}
                    selectUser={id => {
                      this.props.history.push(`${this.reportingPath}/users/search?u=${id}`)
                    }}
                  />
                </div>
              ) : (
                <SystemActivity
                  bg={clientVariables.blockBgClasses}
                  selectProgramme={object => {
                    object['id'] = object['programme-id']
                    object['label'] = object['programme']
                    object['title'] = object['programme']
                    this.setProgramme(object)
                  }}
                />
              )}
            </section>
          </main>
          <SmallScreenMessage />
        </PageLoader>
      </Meta>
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables)
)


export default enhance(ProgrammeReports)