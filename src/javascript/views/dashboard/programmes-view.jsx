import React from 'react'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import pluralize from 'pluralize'
import uuid from 'uuid/v4'

// Actions
import UserProgrammeActions from 'javascript/actions/user-programmes'

// Stores
import UserProgrammeStore from 'javascript/stores/user-programmes'

// Components
import Banner from 'javascript/components/banner'
import Meta from 'react-document-meta'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'
import Paginator from 'javascript/components/paginator'
import Modal from 'javascript/components/modal'
import ListModal from 'javascript/components/list-modal'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

export default class DashboardProgrammesView extends PageHelper {

  constructor(props) {
    super(props)
    const query = Object.assign({
      'page[number]': 1,
      'page[size]': 12,
      'sort': '-created-at'
    }, props.location.query)

    this.state = {
      resources: null,
      tabPosition: 0,
      modal: () => { },
      query
    }
    this.relationship = {
      resourceName: 'user',
      resourceId: this.props.user.id,
      relationName: 'user-programme'
    }
    this.browserListener = null
  }

  componentWillMount() {
    UserProgrammeStore.on('change', this.getResources)
    this.browserListener = this.props.history.listen(this.fetchUserProgrammeResources)
  }

  componentWillUnmount() {
    UserProgrammeStore.removeListener('change', this.getResources)
    this.browserListener()
  }

  componentDidMount() {
    this.fetchUserProgrammeResources(this.props.location)
  }


  fetchUserProgrammeResources = (location) => {
    const { theme } = this.props
    const programmes = [
      'id,title,thumbnail,short-description,genres,introduction,data,custom-attributes',
      theme.features.programmeOverview?.logoTitle && 'logo',
      theme.features.programmeOverview?.episodeTag && 'number-of-episodes'
    ].filter(Boolean).join(',')
    this.setState({
      query: Object.assign({}, this.state.query, location.query)
    }, () => {
      const query = Object.assign({
        include: 'programme,programme.genres,programme.custom-attributes,programme.custom-attributes.custom-attribute-type',
        fields: {
          programmes,
          genres: 'name,parent-id',
          'custom-attributes': 'custom-attribute-type,value,position'
        },
        'filter[restricted]': false,
        sort: '-created-at'
      }, this.state.query)
      UserProgrammeActions.getRelationshipResources(this.relationship, query)
    })
  }

  getResources = () => {
    const userProgrammes = UserProgrammeStore.getResources()
    if (userProgrammes) {
      this.finishedLoading()
      this.setState({
        resources: userProgrammes.map((userProgrammes) => userProgrammes.programme),
        totalPages: userProgrammes.meta['page-count']
      })
    }
  }

  addProgrammeToList = (resources) => {
    this.setState(() => ({
      modal: () => (
        <Modal delay={500} ref="modal" customContent={true} modifiers={['custom-content']} closeEvent={this.unsetModal}>
          <ListModal resourcesToAddToList={resources} closeEvent={this.unsetModal} user={this.props.user} />
        </Modal>
      )
    }))
  }

  filter = (newQuery, pageChange) => {
    const { theme } = this.props
    this.setState((prevState) => {
      const query = {
        ...prevState.query,
        ...newQuery
      }
      if (!pageChange) {
        query['page[number]'] = 1
      }
      Object.keys(query).map((key) => {
        if (query[key].length < 1) {
          delete query[key]
        }
      })
      return { query }
    }, () => {
      this.props.history.push({ pathname: `/${theme.variables.SystemPages.dashboard.path}/programmes`, query: this.state.query })
    })
  }

  renderProgrammes() {
    const { theme } = this.props
    if (!this.state.resources) return
    const programmeCards = this.state.resources.map((resource) => {
      const genres = resource.genres.filter(g => !g['parent-id'])
      let episodeTag = {}
      if (theme.features.programmeOverview?.episodeTag) {
        const episodeCount = resource['number-of-episodes']
        if (episodeCount > 0) {
          episodeTag = {
            name: `${episodeCount} ${episodeCount === 1 ? theme.localisation.episodes.shorthand : pluralize(theme.localisation.episodes.shorthand)}`,
            id: uuid(),
            alt: true
          }
        }
      }
      return (
        <Card key={resource.id}
          image={{ src: resource.thumbnail.url, alt: resource.title }}
          url={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(resource.programme, theme)}`}
          title={resource.title}
          description={resource['short-description']}
          tags={[episodeTag, ...genres]}>

          {resource['custom-attributes'].map((i, index) => {
            if (i['custom-attribute-type'].name === 'Brand') {
              const brand = i.value
              const img = theme.variables.Brands[brand]
              if (!img) {
                return false
              }
              return (
                <img key={index} src={img} className="card__brand" />
              )
            } else {
              return false
            }
          })}
          <div className="card__actions">
            <button onClick={() => this.addProgrammeToList(resource)} className="card__icon">
              <Icon width="45px" height="44px" viewbox="0 0 45 44" id="i-add-to-list" />
            </button>
          </div>
        </Card>
      )
    })
    if (!programmeCards.length) {
      const programmesStr = pluralize(theme.localisation.programme.lower)
      const noProgrammesMsg = this.state.tabPosition ? `There are no ${programmesStr} shared with you` : `There are no ${programmesStr} to show`
      return (
        <div className="grid">
          {noProgrammesMsg}
        </div>
      )
    }
    return (
      <div className="grid grid--four">
        {programmeCards}
      </div>
    )
  }

  render() {
    const { theme } = this.props
    return (
      <Meta
        title={`${theme.localisation.client} :: ${theme.variables.SystemPages.dashboard.upper}`}
        meta={{
          description: "Buyers Dashboard shared programmes view"
        }}>
        <PageLoader {...this.state}>
          <main>
            <div className="fade-on-load">
              <Banner
                title={ `Shared ${pluralize(theme.localisation.programme.upper)}` }
                copy="Our worldwide audience is growing fast and they're falling in love with home grown shows made by us and our partners." classes={ ['short', 'center'] }
              />
            </div>
            <Breadcrumbs paths={[
              { name: theme.variables.SystemPages.dashboard.upper, url: `/${theme.variables.SystemPages.dashboard.path}/` },
              { name: theme.localisation.programme.upper }
              ]} />
            <section className="section section--shade">
              <div className="container">
                {this.renderProgrammes()}
                {this.state.totalPages > 1 &&
                  <Paginator currentPage={parseInt(this.state.query['page[number]'])} totalPages={this.state.totalPages} onChange={(page) => { this.filter({ 'page[number]': page }, true) }} />
                }
              </div>
            </section>
            {this.state.modal()}
          </main>
        </PageLoader>
      </Meta>
    )
  }
}
