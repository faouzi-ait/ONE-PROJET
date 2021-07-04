import React from 'react'
import moment from 'moment'
import pluralize from 'pluralize'

import listsVariablesClientVariables from 'javascript/views/lists/lists.variables'
import listsFoldersClientVariables from './variables'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

// Stores
import FoldersStore from 'javascript/stores/folders'
import ListsStore from 'javascript/stores/lists'
import ListSharesStore from 'javascript/stores/list-shares'
import ListDuplicatesStore from 'javascript/stores/list-duplicates'

// Actions
import ListsActions from 'javascript/actions/lists'
import ListDuplicateActions from 'javascript/actions/list-duplicates'

// Components
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import Card from 'javascript/components/card'
import CreateForm from 'javascript/components/create-form'
import DeleteForm from 'javascript/views/lists/delete-list'
import Icon from 'javascript/components/icon'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import PageHelper from 'javascript/views/page-helper'
import PageLoader from 'javascript/components/page-loader'
import Paginator from 'javascript/components/paginator'
import Share from 'javascript/views/lists/share'
import Toggle from 'javascript/components/toggle'

// Services
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import ListControls from './ListControls'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'

class ListsFolder extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      user: this.props.user,
      folder: false,
      resources: [],
      selectedTotal: 0,
      duplicatedCount: 0,
      modal: () => { },
      createListValidate: false,
      query: Object.assign({
        'page[number]': 1,
        'page[size]': props.listsFoldersVariablesCV.initialPageSize
      }, props.location.query)
    }
  }

  componentWillMount() {
    this.setState({
      folder: FoldersStore.getResource(this.props.match.params.folder, this.props.theme)
    }, () => {
      ListsStore.on('change', this.getResources)
      ListsStore.on('error', this.receivedError)
      ListsStore.on('listDeleted', this.refreshResources)
      ListSharesStore.on('change', this.listShared)
      ListDuplicatesStore.on('change', this.redirect)
      if (this.props.listsVariablesCV.stickyControls) {
        window.addEventListener('scroll', this.checkPosition)
      }
    })
  }

  componentWillUnmount() {
    ListsStore.removeListener('change', this.getResources)
    ListsStore.removeListener('error', this.receivedError)
    ListsStore.removeListener('listDeleted', this.refreshResources)
    ListSharesStore.removeListener('change', this.listShared)
    ListDuplicatesStore.removeListener('change', this.redirect)
    if (this.props.listsVariablesCV.stickyControls) {
      window.removeEventListener('scroll', this.checkPosition)
    }
  }

  componentDidMount() {
    if (this.state.folder) {
      this.getLists()
    } else {
      this.receivedError()
    }
  }

  listShared = () => {
    this.unsetModal()
    this.props.history.replace({
      pathname: this.props.location.pathname,
      state: {
        notification: {
          message: `${this.props.theme.localisation.list.upper} successfully shared`,
          type: 'success'
        }
      }
    })
    setTimeout(() => {
      this.props.history.replace({
        state: {}
      })
    }, 6000)
  }

  checkPosition = () => {
    const container = this.refs.stickyContainer
    const elem = this.refs.stickyElement
    if (elem) {
      const height = elem.clientHeight
      const offset = container.offsetTop
      const top = typeof window.scrollY === "undefined" ? window.pageYOffset : window.scrollY
      if (top > offset) {
        elem.classList.add('sticky')
        container.style['padding-top'] = height + 'px'
      } else {
        container.style['padding-top'] = '0'
        elem.classList.remove('sticky')
      }
    }
  }

  getLists = () => {
    const {folder, user} = this.state
    const query = Object.assign({
      include: 'list-programmes,list-programmes.programme,list-series,list-series.series,list-series.series.programme,list-videos,list-videos.video,list-videos.video.parent',
      fields: {
        'lists': 'name,programmes-count-without-restricted,videos-count-without-restricted,series-count-without-restricted,global,meeting-list,updated-at,images,list-programmes,list-series,list-videos,list-elements',
        'list-programmes': 'programme,list-position',
        'list-videos': 'video,list-position',
        'list-series': 'series,list-position',
        'programmes' : 'title,restricted',
        'series': 'name,programme,restricted',
        'videos' : 'name,parent,restricted'
      },
      filter: {
        'global': folder.global,
        'meeting-list': false
      },
      sort: '-updated_at'
    }, this.state.query)
    if (!folder.global) {
      query['filter[user_id]'] = user.id
    }
    if(folder.global && !user['user-type'] === 'internal'){
      options['filter[internal]'] = false
    }
    ListsActions.getResources(query)
  }

  getResources = () => {
    this.setState({
      resources: ListsStore.getResources()
    }, () => {
      if(this.state.resources && this.state.folder){
        this.setState({
          totalPages: this.state.resources.meta['page-count'],
          selectedTotal: this.getSelectedTotal()
        })
        this.finishedLoading()
      }
    })

    this.unsetModal()
  }

  refreshResources = () => {
    const resources = ListsStore.getResources()
    //check if user has have ended up on an empty page - then return to page 1
    if(!resources.length) {
      this.updatePage(1)
    } else {
      this.getResources()
    }
  }

  updatePage = (page) => {
    const update = this.state.query
    update['page[number]'] = parseInt(page)
    this.setState({
      query: update
    })
    this.getLists()
  }

  createList = (e) => {
    e.preventDefault()
    if (this.refs.resourceName.value) {
      ListsActions.createResource({
        name: this.refs.resourceName.value,
        user: {
          id: this.state.user.id
        },
        global: this.state.folder.global
      })
    }
    this.setState({ createListValidate: !this.refs.resourceName.value })
    this.refs.resourceName.value = ''
  }

  shareList = () => {
    const resource = this.state.resources.find(({ selected }) => selected)
    this.setState({
      listShared: false,
      modal: () => {
        return (
          <Modal closeEvent={this.unsetModal} title={`Share a ${this.props.theme.localisation.list.lower}`} ref="modal" customContent={true}>
            <div className="modal__wrapper modal__wrapper--wide">
              <div className="modal__content">
                <Share list={resource} user={this.state.user} closeEvent={this.unsetModal} listCount={this.sumResources(resource)} />
              </div>
            </div>
          </Modal>
        )
      }
    })
  }

  redirect = () => {
    this.props.history.replace({
      pathname: this.props.location.pathname,
      state: {
        notification: {
          message: `${this.props.theme.localisation.list.upper} successfully duplicated`,
          type: 'success',
          count: this.state.duplicatedCount
        }
      }
    })
  }

  duplicateList = () => {
    const resource = this.state.resources.find(({ selected }) => selected)
    this.setState({
      duplicatedCount: ++this.state.duplicatedCount
    })
    ListDuplicateActions.createResource({list: resource})
  }

  selectResource = (resource, index) => {
    resource.selected = !resource.selected
    this.setState({
      selectedTotal: this.getSelectedTotal()
    })
  }

  selectAll = () => {
    let state = this.state.selectedTotal < this.state.resources.length
    this.state.resources.map((resource) => {
      resource.selected = state
    })
    this.setState({
      selectedTotal: this.getSelectedTotal()
    })
  }

  unSelectAll = () => {
    this.state.resources.map((resource) => {
      resource.selected = false
    })
    this.setState({
      selectedTotal: this.getSelectedTotal()
    })
  }

  deleteResources = () => {
    this.setState({
      modal: () => {
        return (
          <Modal closeEvent={this.unsetModal} title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
            <div className="modal__content">
              <DeleteForm resources={this.state.resources} closeEvent={this.unsetModal} />
            </div>
          </Modal>
        )
      }
    })
  }

  getSelectedTotal = () => this.state.resources.filter(({ selected }) => selected).length

  exportDownload = type => {
    const { id, name } = this.state.resources.find(({ selected }) => selected)
    ListsActions.exportResource(id, type, name)
  }

  sumResources = (resource) => (resource['programmes-count-without-restricted'] + resource['series-count-without-restricted'] + resource['videos-count-without-restricted'])

  canManageList() {
    const { user, folder } = this.state
    return !folder.global || (folder.global && (isAdmin(user) || hasPermission(user, 'manage_global_lists')))
  }

  displayCount(resource, suffix) {
    return (
      <>
        <p className="card__count">
          {this.props.theme.variables.ListFolderIcon ?
            <>
              <Icon id="i-folder" />
              <span>
                {this.sumResources(resource)}
              </span>
            </>
          : this.sumResources(resource)} {suffix}
        </p>
        <p className={this.props.listsFoldersVariablesCV.listDateClasses}>{moment(resource['updated-at']).format('D MMM YYYY')}</p>
      </>
    )
  }

  render() {
    let { selectedTotal } = this.state
    const { theme } = this.props
    const selectedList = this.state.resources.find(({ selected }) => selected)

    const {
      bannerClasses,
      bannerImage,
      breadcrumbClasses,
      selectButtonClasses
    } = this.props.listsVariablesCV

    const {
      actionsClasses,
      gridClasses,
      sectionClasses,
      newListButtonText
    } = this.props.listsFoldersVariablesCV

    return (
      <Meta
        title={`${theme.localisation.client} :: ${this.state.folder.localizedName}`}
        meta={{
          description: this.state.folder.localizedName
        }}>
        <PageLoader {...this.state}>
          <main>
            <div className="fade-on-load">
              <LoadPageBannerImage slug={theme.variables.SystemPages.list.path} fallbackBannerImage={bannerImage}>
                {({ image }) => (
                  <Banner
                    title={this.state.folder.localizedName}
                    classes={bannerClasses}
                    image={image}
                  />
                )}
              </LoadPageBannerImage>
              <Breadcrumbs classes={breadcrumbClasses} paths={[
                { name: theme.variables.SystemPages.account.upper, url: `/${theme.variables.SystemPages.account.path}` },
                { name: theme.variables.SystemPages.list.upper, url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}` },
                { name: this.state.folder.localizedName, url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/${this.state.folder.localizedId}` }
              ]} />

              <AccountNavigation currentPage={`/${theme.variables.SystemPages.list.path}`} />

              {this.canManageList() &&
                <div className="actions">
                  <div className="container">
                    <div className={actionsClasses}>
                      <div>
                        <CreateForm onSubmit={this.createList} buttonCopy={newListButtonText(theme.localisation.list.lower)} validateMessage={this.state.createListValidate && 'Please enter a name'}>
                          <input type="text" ref="resourceName" className="create-form__input" placeholder={`Create a new ${theme.localisation.list.lower}`} />
                        </CreateForm>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <div className={sectionClasses}>
                <div className="container">
                  {this.state.resources.length <= 0 ? (
                    <p>{`You have no ${pluralize(theme.localisation.list.lower)} in ${this.state.folder.localizedName}`}</p>
                  ) : (
                      <div>
                        <div ref="stickyContainer" className="sticky-container">
                          <div ref="stickyElement">
                            <div className="list-controls">
                              <div className="list-controls__list">
                                <span className="list-controls__count">{selectedTotal} {(selectedTotal === 1) ? theme.localisation.list.upper : pluralize(theme.localisation.list.upper)} selected</span>
                                <ClientChoice>
                                  <ClientSpecific client="default">
                                    <span className="list-controls__divider">|</span>
                                    <button onClick={this.selectAll} className={selectButtonClasses}>
                                      {selectedTotal >= this.state.resources.length && 'Un-'}Select All
                                    </button>
                                  </ClientSpecific>
                                  <ClientSpecific client="amc">
                                    <button onClick={this.selectAll} className={selectButtonClasses}>
                                      {selectedTotal >= this.state.resources.length ? 'Des' : 'S'}elect All
                                    </button>
                                  </ClientSpecific>
                                  <ClientSpecific client="cineflix | demo | fremantle">
                                    <button onClick={this.selectAll} className={selectButtonClasses}>
                                      {selectedTotal >= this.state.resources.length && 'Un-'}Select All
                                    </button>
                                  </ClientSpecific>
                                </ClientChoice>
                              </div>
                              <div>
                                {this.state.selectedTotal > 0 &&
                                  <ListControls
                                    canManageList={this.canManageList()}
                                    shareList={this.shareList}
                                    selectedTotal={this.state.selectedTotal}
                                    folder={this.state.folder}
                                    duplicateList={this.duplicateList}
                                    exportDownload={this.exportDownload}
                                    deleteResources={this.deleteResources}
                                    unSelectAll={this.unSelectAll}
                                    selectedList={this.state.resources.find(({ selected }) => selected)}
                                  />
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={gridClasses}>
                          {this.state.resources.map((resource, index) => {
                            return (
                            <Card
                              title={resource.name}
                              key={index}
                              classes={[resource.selected && 'active', 'list', 'toggle']}
                              images={resource.images.length >= 4 ? resource.images : [resource.images[0]]}
                              url={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/${this.state.folder.localizedId}/${resource.id}`}
                            >
                            <Toggle onClick={() => { this.selectResource(resource, index) }} classes={resource.selected && ['active']} />
                            <ClientChoice>
                              <ClientSpecific client="default">
                                {this.displayCount(resource)}
                              </ClientSpecific>
                              <ClientSpecific client="drg">
                                {this.displayCount(resource, pluralize(theme.localisation.programme.upper))}
                              </ClientSpecific>
                              <ClientSpecific client="banijaygroup | itv | endeavor | storylab | wildbrain">
                                <div>
                                  {this.displayCount(resource)}
                                </div>
                              </ClientSpecific>
                            </ClientChoice>
                          </Card>
                          )
                        })}
                      </div>
                      { this.state.totalPages > 1 &&
                        <Paginator currentPage={ parseInt(this.state.query['page[number]']) } totalPages={ this.state.totalPages } onChange={ this.updatePage } />
                      }
                      </div>
                    )}
                </div>
              </div>
              {this.state.modal()}
            </div>
          </main>
        </PageLoader>
      </Meta>
    )
  }
}

const enhance = compose(
  withClientVariables('listsVariablesCV', listsVariablesClientVariables),
  withClientVariables('listsFoldersVariablesCV', listsFoldersClientVariables),
)

export default enhance(ListsFolder)

