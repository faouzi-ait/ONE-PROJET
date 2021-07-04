import React from 'react'
import PageHelper from 'javascript/views/page-helper'
import pluralize from 'pluralize'
import { NavLink } from 'react-router-dom'
import uuid from 'uuid/v4'

import allClientVariables from 'javascript/views/lists/show/variables'
import listsVariablesClientVariables from 'javascript/views/lists/lists.variables'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

// Stores
import FoldersStore from 'javascript/stores/folders'
import ListsStore from 'javascript/stores/lists'
import ListProgrammesStore from 'javascript/stores/lists-programmes'
import ListVideosStore from 'javascript/stores/list-videos'
import ListSeriesStore from 'javascript/stores/list-series'
import LikeStore from 'javascript/stores/likes'
import ProgrammeStore from 'javascript/stores/programmes'

// Actions
import ListsActions from 'javascript/actions/lists'
import ListProgrammesActions from 'javascript/actions/lists-programmes'
import ListVideosActions from 'javascript/actions/list-videos'
import ListSeriesActions from 'javascript/actions/list-series'
import ProgrammeActions from 'javascript/actions/programmes'

// Components
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import AccountNavigation from 'javascript/components/account-navigation'
import Card from 'javascript/components/card'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import DeleteForm from 'javascript/views/lists/delete-resource'
import DeleteNote from 'javascript/views/lists/delete-note'
import EditForm from 'javascript/views/lists/edit'
import Icon from 'javascript/components/icon'
import Like from 'javascript/components/like'
import ListCard from 'javascript/components/cards/list'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import Notes from 'javascript/views/lists/notes'
import PageLoader from 'javascript/components/page-loader'
import ProgrammesForm from 'javascript/views/lists/form'
import Toggle from 'javascript/components/toggle'

// Services
import { isAdmin, hasPermission, isInternal } from 'javascript/services/user-permissions'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'


class ListsShow extends PageHelper {
  constructor(props) {
    super(props)
    this.state = {
      folder: false,
      dragged: {
        id: false
      },
      list: false,
      selectedTotal: 0,
      selected: [],
      modal: () => { },
      programmes: []
    }
  }

  transformAction = (type) => {
    return {
      'list-videos': ListVideosActions,
      'list-series': ListSeriesActions,
      'list-programmes': ListProgrammesActions
    }[type]
  }

  componentWillMount() {
    if (this.props.listsVariablesCV.stickyControls) {
      window.addEventListener('scroll', this.checkPosition)
    }
    LikeStore.on('change', this.refreshList)

    ProgrammeStore.on('change', this.getProgrammes)

    ListsStore.on('change', this.setList)
    ListsStore.on('error', this.receivedError)

    ListProgrammesStore.on('resourceUpdatedChange', this.actionList)
    ListVideosStore.on('change', this.actionList)
    ListSeriesStore.on('change', this.actionList)
  }

  componentWillUnmount() {
    if (this.props.listsVariablesCV.stickyControls) {
      window.removeEventListener('scroll', this.checkPosition)
    }
    LikeStore.removeListener('change', this.refreshList)

    ProgrammeStore.removeListener('change', this.getProgrammes)

    ListsStore.removeListener('change', this.setList)
    ListsStore.removeListener('error', this.receivedError)

    ListProgrammesStore.removeListener('resourceUpdatedChange', this.actionList)
    ListVideosStore.removeListener('change', this.actionList)
    ListSeriesStore.removeListener('change', this.actionList)
  }

  checkPosition = () => {
    const container = this.refs.stickyContainer
    const elem = this.refs.stickyElement
    const height = elem ? elem.clientHeight : 0
    const offset = container ? container.offsetTop : 0
    const top = typeof window.scrollY === "undefined" ? window.pageYOffset : window.scrollY
    if (elem && container) {
      if (top > offset) {
        elem.classList.add('sticky')
        container.style['padding-top'] = height + 'px'
      } else {
        container.style['padding-top'] = '0'
        elem.classList.remove('sticky')
      }
    }
  }

  refreshList = () => {
    const { wistia } = this.props.videoProviders
    const { theme, listsShowCV } = this.props
    const videos = ['name,poster,parent,restricted', wistia && 'wistia-thumbnail-url'].filter(Boolean).join(',')

    const programmes = [
      'thumbnail,title,short-description,genres,restricted',
      theme.features.programmeOverview.logoTitle && 'logo',
      theme.features.programmeTypes.enabled && 'programme-type',
      listsShowCV.durationTag && 'custom-attributes',
      theme.features.customCatalogues.enabled && 'catalogues'
    ].filter(Boolean).join(',')

    const fields = {
      'lists': 'list-elements,name,programmes-count-without-restricted,videos-count-without-restricted,series-count-without-restricted,global,meeting-list,list-programmes,list-series,list-videos,internal',
        'list-programmes': 'programme,list-position,notes-count,like',
        'list-videos': 'video,list-position,notes-count,programme-id,like',
        'list-series': 'series,list-position,notes-count,like',
        programmes,
        'series': 'name,short-description,programme,restricted',
        'genres': 'name',
        videos
    }

    if(theme.features.customCatalogues.enabled){
      fields['catalogues'] = 'name'
    }
    if(listsShowCV.durationTag){
      fields['custom-attributes'] = 'custom-attribute-type,value,position'
    }
    if(theme.features.programmeTypes.enabled){
      fields['programme-type'] = 'name'
    }

    ListsActions.getResource(this.props.match.params.list, {
      'include': [
        'list-programmes,list-programmes.programme,list-programmes.programme.genres,list-series,list-series.series,list-series.series.programme,list-series.series.programme.genres,list-videos,list-videos.video,list-videos.video.parent,list-programmes.like,list-videos.like,list-series.like',
        theme.features.customCatalogues.enabled && 'list-programmes.programme.catalogues,list-series.series.programme.catalogues',
        listsShowCV.durationTag && 'list-programmes.programme.custom-attributes,list-programmes.programme.custom-attributes.custom-attribute-type,list-series.series.programme.custom-attributes,list-series.series.programme.custom-attributes.custom-attribute-type'
      ].filter(Boolean).join(','),
      fields
    })
  }

  actionList = () => {
    this.unsetModal()
    this.refreshList()
  }

  getProgrammes = () => {
    this.setState({
      programmes: ProgrammeStore.getResources()
    })
  }

  setList = () => {
    const { theme, listsShowCV } = this.props
    const list = ListsStore.getResource()
    const programmeIds = list['list-videos'].map(v => v['programme-id'])
    const fields = {
      programmes: ['genres',
        theme.features.customCatalogues.enabled && 'catalogues',
        theme.features.programmeTypes.enabled && 'programme-type',
        listsShowCV.durationTag && 'custom-attributes'
      ].filter(Boolean).join(','),
      genres: 'name'
    }
    if(theme.features.customCatalogues.enabled){
      fields['catalogues'] = 'name'
    }
    if(listsShowCV.durationTag){
      fields['custom-attributes'] = 'custom-attribute-type,value,position'
    }
    if(theme.features.programmeTypes.enabled){
      fields['programme-type'] = 'name'
    }
    ProgrammeActions.getResources({
      filter: {
        ids: programmeIds.join(',')
      },
      include: ['genres',
        theme.features.programmeTypes.enabled && 'programme-type',
        theme.features.customCatalogues.enabled && 'catalogues',
        listsShowCV.durationTag && 'custom-attributes,custom-attributes.custom-attribute-type'
      ].filter(Boolean).join(','),
      fields
    })

    this.setState(() => ({
      list,
      selectedTotal: 0,
      selected: []
    }), () => {
      this.finishedLoading()
    })
  }

  componentDidMount() {
    this.setState(() => ({
      folder: FoldersStore.getResource(this.props.match.params.folder, this.props.theme)
    }), () => {
      if (this.state.folder) {
        this.actionList()
      } else {
        this.receivedError()
      }
    })
  }

  selectResource = (resource) => {
    this.setState(({ list }) => {
      const nList = { ...list }
      const resources = nList[resource.type]
      const index = resources.findIndex(d => d.id === resource.id)
      let selected = this.state.selected
      resources[index].selected = !resources[index].selected
      if (resources[index].selected) {
        selected.push(resources[index])
      } else {
        const selectedIndex = selected.findIndex(i => i.id === resource.id)
        selected.splice(selectedIndex, 1)
      }
      return {
        list: nList,
        selected: selected,
        selectedTotal: this.sumSelectedTotal(nList)
      }
    })
  }

  updateSelected = (state) => () => {
    this.setState(({ list, selectedTotal }) => {
      const nList = { ...list }
      const resources = this.combineResources(list)
      let selected = []

      resources.forEach(r => {
        const index = nList[r.type].findIndex(d => d.id === r.id)
        nList[r.type][index].selected = state
        if (state) {
          selected.push(nList[r.type][index])
        }
      })

      return {
        list: nList,
        selected: selected,
        selectedTotal: this.sumSelectedTotal(nList)
      }
    })
  }

  closeNotes = () => {
    this.refreshList()
    this.unsetModal()
  }

  combineResources = (list) => [
    ...list['list-videos'],
    ...list['list-series'],
    ...list['list-programmes']
  ]

  sumResources = (r) => (r['programmes-count-without-restricted'] + r['series-count-without-restricted'] + r['videos-count-without-restricted'])

  sumSelectedTotal = (list) => this.combineResources(list).reduce((n, r) => n + (r.selected || 0) * 1, 0)

  openProgrammeModal = () => {
    this.setState({
      modal: () => (
        <Modal
          ref="modal"
          delay={500}
          title={`Add ${pluralize(this.props.theme.localisation.programme.upper)}`}
          closeEvent={this.unsetModal}
          wrapperStyling={{ overflow: 'visible' }}
        >
          <div className="modal__content">
            <ProgrammesForm list={this.state.list} addedProgrammes={this.state.list['list-programmes'].map(({ programme }) => programme.id)} closeEvent={this.actionList} />
          </div>
        </Modal>
      )
    })
  }

  openEditModal = () => {
    this.setState({
      modal: () => (
        <Modal title={`Edit ${this.props.theme.localisation.list.upper}`} delay={500} closeEvent={this.unsetModal} ref="modal">
          <div className="modal__content">
            <EditForm list={this.state.list} user={this.props.user} closeEvent={this.actionList} />
          </div>
        </Modal>
      )
    })
  }

  deleteResourcesModal = () => {
    this.setState({
      modal: () => (
        <Modal closeEvent={this.unsetModal} title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
          <div className="modal__content">
            <DeleteForm
              resources={this.combineResources(this.state.list).filter(d => d.selected)}
              listId={this.state.list.id}
              closeEvent={this.actionList}
            />
          </div>
        </Modal>
      )
    })
  }

  notesModal = () => {
    const resource = this.combineResources(this.state.list).find(d => d.selected)
    const resourceType = pluralize.singular(resource.type.replace('list-', ''))
    this.setState({
      modal: () => (
        <Modal closeEvent={this.closeNotes} title={`Notes for ${resource[resourceType].title || resource[resourceType].name}`} ref="modal" modifiers={['notes']}>
          <div className="modal__content">
            <Notes resource={resource} hideDelete={false} resourceType={resourceType} deleteNote={this.deleteNote} />
          </div>
        </Modal>
      )
    })
  }

  deleteNote = (note) => {
    this.setState({
      modal: () => {
        return (
          <Modal closeEvent={this.notesModal} title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
            <div className="modal__content">
              <DeleteNote resource={note} closeEvent={this.notesModal} />
            </div>
          </Modal>
        )
      }
    })
  }

  dragStart = (e, resource) => {
    this.state.dragged = resource
    e.dataTransfer.setData('text', e.currentTarget.getAttribute('data-reactid'))
  }

  dragOver = (e, r) => {
    e.preventDefault()
    const lp = 'list-position'

    if (r[lp] === this.state.dragged[lp]) {
      return false
    }

    this.setState(({ list, dragged }) => {
      const nList = { ...list }
      const resources = nList[dragged.type]
      const i = resources.findIndex(d => d.id === dragged.id)
      const direction = Math.min(Math.max(dragged[lp] - r[lp], -1), 1)

      this.combineResources(nList).forEach(d => {
        if (d[lp] >= r[lp] && d[lp] < dragged[lp] || d[lp] > dragged[lp] && d[lp] <= r[lp]) {
          const index = nList[d.type].findIndex(a => a.id === d.id)
          nList[d.type][index] = {
            ...d,
            [lp]: d[lp] + direction
          }
        }
      })

      resources[i] = {
        ...resources[i],
        [lp]: r[lp]
      }

      return {
        list: nList,
        dragged: resources[i]
      }
    })
  }

  dragEnd = (e) => {
    e.preventDefault()
    this.setState(({ dragged }) => {
      this.transformAction(dragged.type).updateResource({
        id: dragged.id,
        'list-position': dragged['list-position']
      })
      return { dragged: false }
    })
  }

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

  canManageList() {
    const { folder } = this.state
    const { user } = this.props
    return !folder.global || (folder.global && (isAdmin(user) || hasPermission(user, 'manage_global_lists')))
  }

  displaySelectedTotal (selectedTotal) {
    if(selectedTotal <= 1) {
      return "Item"
    } else {
      return "Items"
    }
  }

  render() {
    const { theme } = this.props
    const { list, folder, selectedTotal } = this.state
    const {
      containerStyling,
      editButtonClasses,
      exitButtonClasses,
      errorButtonClasses,
      notesButtonClasses,
      gridClasses,
      listButtonClasses,
      sectionClasses,
      shouldRenderDeleteButton,
    } = this.props.listsShowCV

    const {
      bannerClasses,
      breadcrumbClasses,
      bannerImage,
      selectButtonClasses
    } = this.props.listsVariablesCV

    const totalResources = this.sumResources(list)

    return (
      <Meta
        title={`${theme.localisation.client} :: ${list.name}`}
        meta={{
          description: 'Description Here'
        }}>
        <PageLoader {...this.state}>
          <main>
            <div className="fade-on-load">
              <LoadPageBannerImage slug={theme.variables.SystemPages.list.path} fallbackBannerImage={bannerImage}>
                {({ image }) => (
                  <Banner
                    title={list.name}
                    classes={bannerClasses}
                    image={image}
                  />
                )}
              </LoadPageBannerImage>
              <Breadcrumbs classes={breadcrumbClasses} paths={[
                { name: theme.variables.SystemPages.account.upper, url: `/${theme.variables.SystemPages.account.path}` },
                { name: theme.variables.SystemPages.list.upper, url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}` },
                { name: folder.localizedName, url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/${folder.localizedId}` },
                { name: list.name, url: `/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/${folder.localizedId}/${list.id}` }
              ]} />

              <AccountNavigation currentPage={`/${theme.variables.SystemPages.list.path}`} />

              <div className="actions">
                <div className="container">
                  <div className="actions__inner">
                    <ClientChoice>
                      <ClientSpecific client="default">
                        {(this.canManageList()) && [
                          <button key='programme-button' className={editButtonClasses} onClick={this.openProgrammeModal}>Add {theme.localisation.programme.upper}</button>,
                          <button key='edit-button' className={editButtonClasses} onClick={this.openEditModal}>Edit {theme.localisation.list.upper}</button>
                        ]}
                      </ClientSpecific>
                      <ClientSpecific client="banijaygroup">
                        {(this.canManageList()) && [
                          <button key='programme-button' className={editButtonClasses} onClick={this.openProgrammeModal}>
                            <Icon id="i-add" classes="button__icon" />
                            Add {theme.localisation.programme.upper}
                          </button>,
                          <button key='edit-button' className={editButtonClasses} onClick={this.openEditModal}>
                            <Icon width="20" height="20" id="i-edit" classes="button__icon" />
                            Edit {theme.localisation.list.upper}
                          </button>
                        ]}
                      </ClientSpecific>
                      <ClientSpecific client="amc">
                        {list.global &&
                          <button className={editButtonClasses} onClick={this.duplicateList}>Duplicate</button>
                        }
                        {(this.canManageList()) && [
                          <button key='programme-button' className="button button--filled button--with-icon button--deep" onClick={this.openProgrammeModal}>
                            <Icon width="32" height="32" id="i-add" classes="button__icon" />
                            Add {theme.localisation.programme.upper}
                          </button>,
                          <button key='edit-button' className="button button--filled button--deep" onClick={this.openEditModal}>
                            Edit {theme.localisation.list.upper}
                          </button>
                        ]}
                      </ClientSpecific>
                    </ClientChoice>
                  </div>
                </div>
              </div>

              <div className={sectionClasses}>
                <div className="container" style={containerStyling}>
                  <div ref="stickyContainer" className="sticky-container">
                    <div ref="stickyElement">
                      <div className="list-controls">
                        <div className="list-controls__list">
                          <span className="list-controls__count">{selectedTotal} {this.displaySelectedTotal(selectedTotal)} selected</span>
                          {totalResources > 0 &&
                            <ClientChoice>
                              <ClientSpecific client="default">
                                <span className="list-controls__divider">|</span>
                                <button onClick={this.updateSelected(selectedTotal < totalResources)} className={selectButtonClasses}>
                                  {selectedTotal >= totalResources && 'Un-'}Select All
                                </button>
                              </ClientSpecific>
                              <ClientSpecific client="amc">
                                <button onClick={this.updateSelected(selectedTotal < totalResources)} className={selectButtonClasses}>
                                  {selectedTotal >= totalResources ? 'Des' : 'S'}elect All
                                </button>
                              </ClientSpecific>
                              <ClientSpecific client="cineflix | demo | fremantle">
                                <button onClick={this.updateSelected(selectedTotal < totalResources)} className={selectButtonClasses}>
                                  {selectedTotal >= totalResources && 'Un-'}Select All
                                </button>
                              </ClientSpecific>
                            </ClientChoice>
                          }
                        </div>
                        <div>
                          {selectedTotal > 0 &&
                            <div className="list-controls__list">
                              {(this.canManageList() && selectedTotal === 1) &&
                                <button className={notesButtonClasses} onClick={this.notesModal}>
                                  <ClientSpecific client="ae">
                                    <Icon id="i-note" className="button__icon" />
                                  </ClientSpecific>
                                  Notes
                                </button>
                              }
                              {this.canManageList() && shouldRenderDeleteButton(selectedTotal) &&
                                <button className={errorButtonClasses} onClick={this.deleteResourcesModal}>
                                  <ClientSpecific client="ae">
                                    <Icon id="i-bin" className="button__icon" />
                                  </ClientSpecific>
                                  Delete
                                </button>
                              }
                              <button onClick={this.updateSelected(false)} className={exitButtonClasses}>
                                <ClientSpecific client="ae">
                                  <Icon id="i-close" className="button__icon" height="12" width="12" />
                                </ClientSpecific>
                                Exit
                              </button>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={gridClasses}>
                    {list && this.combineResources(list).sort((a, b) => a['list-position'] - b['list-position']).map((r, i) =>
                      <ListCard
                        resource={r}
                        list={this.state.list}
                        programmes={this.state.programmes}
                        showLike={true}
                        dragged={this.state.dragged}
                        onClick={() => this.selectResource(r)}
                        onDragStart={e => this.dragStart(e, r)}
                        onDragEnd={e => this.dragEnd(e)}
                        onDragOver={e => this.dragOver(e, r)}
                        onDrop={e => this.dragEnd(e)} />
                    )}
                  </div>
                </div>
              </div>
            </div>
            {this.state.modal()}
          </main>
        </PageLoader>
      </Meta>
    )
  }
}

const enhance = compose(
  withVideoProviders,
  withClientVariables('listsShowCV', allClientVariables),
  withClientVariables('listsVariablesCV', listsVariablesClientVariables)
)

export default enhance(ListsShow)