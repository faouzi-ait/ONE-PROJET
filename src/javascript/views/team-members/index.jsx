import React from 'react'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'

// Actions
import TeamMemberActions from 'javascript/actions/team-members'
import TeamRegionsActions from 'javascript/actions/team-regions'
import TeamDepartmentsActions from 'javascript/actions/team-departments'
import PageActions from 'javascript/actions/pages'

// Stores
import TeamMemberStore from 'javascript/stores/team-members'
import TeamRegionsStore from 'javascript/stores/team-regions'
import TeamDepartmentsStore from 'javascript/stores/team-departments'
import PagesStore from 'javascript/stores/pages'

// Components
import Banner, { getBannerImageUrls } from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import Select from 'react-select'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import Card from 'javascript/components/card'
import Paginator from 'javascript/components/paginator'
import Meta from 'react-document-meta'
import TeamMemberShow from './show'

import 'stylesheets/core/components/team-search'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import { NO_CUSTOM_BANNER } from 'javascript/utils/constants'

export default class TeamIndex extends PageHelper {

  constructor(props) {
    super(props)

    const query = Object.assign({
      'page[number]': 1,
      'page[size]': 12,
    }, props.location.query)

    this.state = {
      resources: null,
      modal: () => { },
      query,
      regions: [],
      departments: [],
      teamPage: {}
    }

    this.browserListener = null
  }

  componentWillMount() {
    TeamMemberStore.on('change', this.getResources)
    TeamRegionsStore.on('change', this.mapRegionsToState)
    TeamDepartmentsStore.on('change', this.mapDepartmentsToState)
    PagesStore.on('change', this.getTeamPage)
    this.browserListener = this.props.history.listen(this.fetchTeamMemberResources)
  }

  componentWillUnmount() {
    TeamMemberStore.removeListener('change', this.getResources)
    TeamRegionsStore.removeListener('change', this.mapRegionsToState)
    TeamDepartmentsStore.removeListener('change', this.mapDepartmentsToState)
    PagesStore.removeListener('change', this.getTeamPage)
    this.browserListener()
  }

  componentDidMount() {

    TeamRegionsActions.getResources({
      page: {
        size: 200
      },
      fields: {
        'team-regions': 'name'
      }
    })

    TeamDepartmentsActions.getResources({
      page: {
        size: 200
      },
      fields: {
        'team-departments': 'name'
      }
    })

    PageActions.getResources({
      page: {
        size: 200
      },
      include: 'meta-datum',
      fields: {
        'pages': 'banner-text-color,banner-urls,meta-datum',
        'meta-datums': 'description'
      },
      'filter[page-type]': 'team'
    })

    this.fetchTeamMemberResources(this.props.location)
  }

  fetchTeamMemberResources = (location) => {
    this.setState({
      query: Object.assign({}, this.state.query, location.query)
    }, () => {
      const query = Object.assign({
        include: 'team-region,team-department',
        fields: {
          'team-members': 'first-name,last-name,job-title,image,email,phone,bio,team-region,team-department',
          'team-regions': 'name',
          'team-departments': 'name'
        }
      }, this.state.query)
      TeamMemberActions.getResources(query)
    })
  }

  mapDepartmentsToState = () => {
    const departments = TeamDepartmentsStore.getResources()
    this.setState({
      departments: [
        {
          value: '',
          label: 'All'
        },
        ...departments.map(department => ({
          value: department.id,
          label: department.name
        }))
      ]
    })
  }

  mapRegionsToState = () => {
    const members = TeamRegionsStore.getResources()
    this.setState({
      regions: [
        {
          value: '',
          label: 'All'
        },
        ...members.map(region => ({
          value: region.id,
          label: region.name
        }))
      ]
    })
  }

  getTeamPage = () => {
    const pages = PagesStore.getResources()
    this.setState({
      teamPage: pages?.[0]
    })
  }

  getResources = () => {
    this.setState({
      resources: TeamMemberStore.getResources()
    })
    const { resources } = this.state
    if (resources) {
      this.finishedLoading()
      this.setState({
        totalPages: this.state.resources.meta['page-count']
      })
    }
  }


  renderClear = () => {
    if (this.state.query) {
      const classes = this.state.focus ? 'team-search__clear team-search__clear--focused' : 'team-search__clear'
      return (
        <button type="button" className={classes} onClick={(e) => {
          e.preventDefault()
          this.setState({
            'query': { ...this.state.query, 'filter[search]': '' }
          }, () => {
            this.filter({ 'filter[search]': this.state.query['filter[search]'] }, false)
          })
        }}>
          <Icon id="i-close" />
          Clear Search
        </button>
      )
    }
  }

  filter = (newQuery, pageChange) => {
    this.setState((prevState) => {
      const query = {
        ...prevState.query,
        ...newQuery
      }
      if (!pageChange) {
        query['page[number]'] = 1
      }
      Object.keys(query).map((key) => {
        if (!query[key] || query[key] && query[key].length < 1) {
          delete query[key]
        }
      })
      return { query }
    }, () => {
      this.props.history.push({ pathname: `/${this.props.theme.variables.SystemPages.team.path}`, query: this.state.query })
    })
  }

  openMember = (resource) => () => {
    this.setState({
      modal: () => (
        <Modal ref="modal" customContent={true} closeEvent={this.unsetModal}>
          <TeamMemberShow resource={resource} closeEvent={this.unsetModal} />
        </Modal>
      )
    })
  }

  renderTeam = () => {
    const { resources } = this.state
    const items = resources.map((resource) => {
      return (
        <Card key={resource.id}
          image={{ src: resource.image.url }}
          onClick={this.openMember(resource)}
          classes={['team']}
          size="people"
          title={`${resource['first-name']} ${resource['last-name']}`}
        >
          <div>
            <h4 className="card__copy card__job">{resource['job-title']}</h4>
            {(resource?.['team-region'] || resource?.['team-department']) &&
              <div className="tags">
                {resource['team-region'] &&
                  <span key={`${resource.id}-region`} className="tag">{resource['team-region']?.name}</span>
                }
                {resource['team-department'] &&
                  <span key={`${resource.id}-department`} className="tag">{resource['team-department']?.name}</span>
                }
              </div>
            }
          </div>
        </Card>
      )
    })
    if (items.length > 0) {
      return (
        <div className="grid grid--four fade-on-load">
          {items}
        </div>
      )
    } else {
      return <div className="fade-on-load grid grid--justify grid--center" style={{minHeight: '200px'}}>{`There are no ${this.props.theme.localisation.team.lower} to show`}</div>
    }
  }

  render() {
    const { theme } = this.props
    const meta = this.state.teamPage?.['meta-datum']
    return (
      <Meta
        title={meta?.title || `${theme.localisation.client} :: ${theme.variables.SystemPages.team.upper}`}
        meta={{
          description: meta?.description || `Viewing ${theme.variables.SystemPages.team.upper}`,
          keywords: meta?.keywords || '',
        }}
      >
        <PageLoader {...this.state}>
          <main>
            <div className="fade-on-load">
              <Banner
                title={theme.variables.SystemPages.team.upper}
                classes={['short']}
                image={getBannerImageUrls(this.state.teamPage)}
              />
              <Breadcrumbs paths={[{ name: theme.variables.SystemPages.team.upper, url: theme.variables.SystemPages.team.path }]} />
              <section>
                <div className="container">
                  <div className="page-controls">
                    {this.state.regions.length > 1 && <div className="page-controls__control page-controls__center">
                      <span>Region:</span>
                      <Select options={this.state.regions} simpleValue={true}
                        clearable={true} searchable={false}
                        value={this.state.query['filter[team-region]']}
                        onChange={(id) => this.filter({ 'filter[team-region]': id }, false)}
                      />
                    </div>}
                    {this.state.departments.length > 1 && <div class="page-controls__control page-controls__center">
                      <span>Department:</span>
                      <Select options={this.state.departments} simpleValue={true}
                        searchable={false} clearable={true}
                        value={this.state.query['filter[team-department]']}
                        onChange={(id) => this.filter({ 'filter[team-department]': id }, false)}
                      />
                    </div>}
                  </div>
                  {this.state.resources && this.renderTeam()}
                  {this.state.totalPages > 1 &&
                    <Paginator currentPage={parseInt(this.state.query['page[number]'])}
                      totalPages={this.state.totalPages}
                      onChange={(page) => { this.filter({ 'page[number]': page }, true) }}
                    />
                  }
                </div>
              </section>
            </div>
            {this.state.modal()}
          </main>
        </PageLoader>
      </Meta>
    )
  }

}
