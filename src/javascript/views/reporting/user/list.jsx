import React from 'react'
import pluralize from 'pluralize'
import Meta from 'react-document-meta'

import compose from 'javascript/utils/compose'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'

import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'
import ListsActions from 'javascript/actions/lists'
import ListsStore from 'javascript/stores/lists'
import Modal from 'javascript/components/modal'
import Notes from 'javascript/views/reporting/user/notes'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import ProgrammeActions from 'javascript/actions/programmes'
import ProgrammeStore from 'javascript/stores/programmes'
import ReportingBanner from "javascript/components/reporting/banner"
import UserActions from 'javascript/actions/users'
import UserStore from 'javascript/stores/users'
import allClientVariables from 'javascript/views/reporting/variables'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

class UserListReports extends PageHelper {

  constructor(props) {
    super(props)
    this.reportingPath = `/${props.theme.variables.SystemPages.account.path}/${props.theme.variables.SystemPages.reporting.path}`
    this.state = { modal: () => { } }
  }

  componentWillMount() {
    ListsStore.on('change', this.getResources)
    ListsStore.on('error', this.receivedError)
    UserStore.on('change', this.getResources)
    ProgrammeStore.on('change', this.getProgrammes)
    this.fetchResources()
  }

  componentWillUnmount() {
    ListsStore.removeListener('change', this.getResources)
    ListsStore.removeListener('error', this.receivedError)
    UserStore.removeListener('change', this.getResources)
    ProgrammeStore.removeListener('change', this.getProgrammes)
  }

  fetchResources = () => {
    const { wistia } = this.props.videoProviders
    const videos = ['name,poster,parent', wistia && 'wistia-thumbnail-url'].filter(Boolean).join(',')
    ListsActions.getResource(this.props.match.params.list, {
      'include': 'list-programmes,list-programmes.programme,list-programmes.programme.genres,list-series,list-series.series,list-series.series.programme,list-series.series.programme.genres,list-videos,list-videos.video,list-videos.video.parent,list-programmes.like,list-videos.like,list-series.like',
      'fields': {
        'lists': 'list-elements,name,programmes-count-without-restricted,videos-count-without-restricted,series-count,global,meeting-list,list-programmes,list-series,list-videos',
        'list-programmes': 'programme,list-position,notes-count,like',
        'list-videos': 'video,list-position,notes-count,programme-id,like',
        'list-series': 'series,list-position,notes-count,like',
        'programmes': 'thumbnail,title,short-description,genres',
        'series': 'name,short-description,programme',
        'genres': 'name',
        videos
      }
    })
    UserActions.getResource(this.props.match.params.userId, {
      fields: {
        users: 'first-name,last-name'
      }
    })
  }

  getProgrammes = () => {
    this.setState({
      programmes: ProgrammeStore.getResources()
    }, this.finishedLoading)
  }

  getResources = () => {
    this.setState({
      list: ListsStore.getResource(),
      user: UserStore.getResource()
    }, () => {
      if (this.state.list && this.state.user) {
        const programmeIds = this.state.list['list-videos'].map(v => v['programme-id'])
        ProgrammeActions.getResources({
          filter: {
            ids: programmeIds.join(',')
          },
          include: 'genres',
          fields: {
            programmes: 'genres',
            genres: 'name'
          }
        })
      }
    })
  }

  combineResources = (list) => [
    ...list['list-videos'],
    ...list['list-series'],
    ...list['list-programmes']
  ]

  findProgrammeName = (r) => {
    const { data } = this.state.list?.['list-elements']?.find(({ data }) => data.id === r.id && data.type === r.type)
    if (data) {
      return data.attributes['programme-name']
    }
  }

  findProgrammeId = (r) => {
    const { data } = this.state.list?.['list-elements']?.find(({ data }) => data.id === r.id && data.type === r.type)
    if (data) {
      return data.attributes['programme-id']
    }
  }

  notes = (r) => () => {
    const resourceType = pluralize.singular(r.type.replace('list-', ''))
    this.setState({
      modal: () => (
        <Modal closeEvent={this.unsetModal} title={`Notes for ${r[resourceType].title || r[resourceType].name}`} ref="modal" modifiers={['notes']}>
          <div className="modal__content">
            <Notes resource={r} resourceType={resourceType} />
          </div>
        </Modal>
      )
    })
  }

  renderResource = (r, index) => {
    const { wistia } = this.props.videoProviders
    const renderFuncs = {
      'list-videos': () => {
        const programme = this.state.programmes.find(p => p.id == r['programme-id'])
        let thumbnail = r.video.poster.small.url
        if (wistia && thumbnail === null) {
          thumbnail = r.video['wistia-thumbnail-url']
        }
        return (
          <Card key={`${r.id}-${r.type}`}
            image={{ src: thumbnail, alt: r.video.name }}
            title={r.video.name}
            tags={programme ? programme.genres : []}>
            <p className="card__copy">{this.findProgrammeName(r)}</p>
            {r.video.parent.type === 'series' &&
              <p className="card__title card__title--small">{r.video.parent.name}</p>
            }
            <div className="like like--reporting"><span className={`like__trigger like__trigger--${r.like ? r.like.action : 'its_ok'}`}></span></div>
            {r['notes-count'] !== false && r['notes-count'] > 0 &&
              <button className="button button--icon button--filled button--reporting" onClick={this.notes(r)}>
                <Icon id='i-note' width="16" height="18" viewBox="0 0 20 22" classes="button__icon" />
              </button>
            }
          </Card>
        )
      },
      'list-series': () => (
        <Card key={`${r.id}-${r.type}`}
          image={true}
          title={r.series.name}
          tags={r.series.programme.genres}>
          <p className="card__copy">{this.findProgrammeName(r)}</p>
          <div className="like like--reporting"><span className={`like__trigger like__trigger--${r.like ? r.like.action : 'its_ok'}`}></span></div>
          {r['notes-count'] !== false && r['notes-count'] > 0 &&
            <button className="button button--icon button--filled button--reporting" onClick={this.notes(r)}>
              <Icon id='i-note' width="16" height="18" viewBox="0 0 20 22" classes="button__icon" />
            </button>
          }
        </Card>
      ),
      'list-programmes': () => (
        <Card key={`${r.id}-${r.type}`}
          image={{ src: r.programme.thumbnail.small.url, alt: r.programme.title }}
          title={r.programme.title}
          tags={r.programme.genres}>
          <div className="like like--reporting"><span className={`like__trigger like__trigger--${r.like ? r.like.action : 'its_ok'}`}></span></div>
          {r['notes-count'] !== false && r['notes-count'] > 0 &&
            <button className="button button--icon button--filled button--reporting" onClick={this.notes(r)}>
              <Icon id='i-note' width="16" height="18" viewBox="0 0 20 22" classes="button__icon" />
            </button>
          }
        </Card>
      )
    }
    return renderFuncs[r.type]()
  }

  render() {
    const { list } = this.state
    const { theme, clientVariables } = this.props
    return (
      <Meta
        title={`${theme.localisation.client} :: Reports`}
        meta={{
          description: 'View your reports'
        }}>
        <PageLoader {...this.state}>
          <main>
            {this.state.loaded &&
              <div>
                <ReportingBanner copy={`${this.state.list.name} by ${this.state.user['first-name']} ${this.state.user['last-name']}`} theme={theme} />

                <Breadcrumbs paths={[
                  { name: theme.variables.SystemPages.account.upper, url: `/${theme.variables.SystemPages.account.path}` },
                  { name: theme.variables.SystemPages.reporting.upper, url: this.reportingPath },
                  { name: 'Users', url: `${this.reportingPath}/users/?u=${this.props.match.params.userId}` },
                  { name: `${this.state.list.name} by ${this.state.user['first-name']} ${this.state.user['last-name']}` }
                ]} classes={clientVariables.breadcrumbClasses} />
                <AccountNavigation currentPage={`/${theme.variables.SystemPages.reporting.path}`} />
                <section className="section section--shade">
                  <div className="container">
                    <div className="grid grid--four">
                      {list && this.combineResources(list).sort((a, b) => a['list-position'] - b['list-position']).map(this.renderResource)}
                    </div>
                  </div>
                </section>
              </div>
            }
            {this.state.modal()}
          </main>
        </PageLoader>
      </Meta>
    )
  }
}
const enhance = compose(
  withVideoProviders,
  withClientVariables('clientVariables', allClientVariables)
)

export default enhance(UserListReports)
