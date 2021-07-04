import React from 'react'
import pluralize from 'pluralize'
import NavLink from 'javascript/components/nav-link'
import IndexHelper from 'javascript/views/admin/index-helper'
import Store from 'javascript/stores/episodes'
import Actions from 'javascript/actions/episodes'
import Form from 'javascript/views/admin/episodes/form'

import SeriesStore from 'javascript/stores/series'
import SeriesActions from 'javascript/actions/series'

import Button from 'javascript/components/button'
import Resource from 'javascript/components/admin/resource'
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Modal from 'javascript/components/modal'
import Icon from 'javascript/components/icon'
import PageLoader from 'javascript/components/page-loader'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Meta from 'react-document-meta'

class EpisodeIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.form = (props) => <Form {...props} />
    this.resourceName = 'Episode'
    this.state.resources = false
    this.state.parent = false
  }

  componentWillMount() {
    this.store.on('change', this.getResources)
    SeriesStore.on('change', this.getParent)
  }

  componentWillUnmount() {
    this.store.removeListener('change', this.getResources)
    SeriesStore.removeListener('change', this.getParent)
  }

  componentDidMount() {
    this.actions.getResources({ filter: { series_id: this.props.match.params.series }, page: { size: 200 }, include: 'series' })
    SeriesActions.getResource(this.props.match.params.series, { include: 'programme', fields: { programmes: 'title', series: 'programme,name' } })
  }

  getResources = () => {
    this.setState({
      resources: this.store.getResources()
    }, this.isLoaded)
    this.unsetModal()
  }

  getParent = () => {
    this.setState({
      parent: SeriesStore.getResource()
    }, this.isLoaded)
    this.unsetModal()
  }

  isLoaded = () => {
    if(this.state.resources && this.state.parent) {
      this.finishedLoading()
    }
  }

  createResource = () => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={ this.unsetModal }
            title={`New ${this.resourceName}`}
            titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
            <div className="cms-modal__content">
              {this.form({
                resource: {
                  series: {
                    id: this.props.match.params.series
                  }
                },
                method: 'createResource'
              })}
            </div>
          </Modal>
        )
      }
    })
  }

  dragStart = (e, index) => {
    this.state.dragged = index
    e.dataTransfer.setData('text', e.currentTarget.getAttribute('data-reactid'))
  }

  dragEnd = (index) => {
    let resource = this.state.resources[this.state.dragged]
    this.actions.updateResource({
      id: resource.id,
      position: resource.position
    })
    this.setState({
      dragged: false
    })
  }

  dragOver = (e, index) => {
    e.preventDefault()
    let resources = this.state.resources
    resources[this.state.dragged].position = index + 1
    resources.splice(index, 0, resources.splice(this.state.dragged, 1)[0])
    this.setState({
      resources: resources,
      dragged: index
    })
  }

  drop = (e) => {
    e.preventDefault()
  }

  renderResources = () => {
    let resources = []
    const { theme } = this.props
    if(this.state.resources) {
      resources = this.state.resources.map((resource, index) => {
        const videoLink = `/admin/${theme.localisation.programme.path}/${this.props.match.params.programme}/${theme.localisation.series.path}/${this.props.match.params.series}/episodes/${resource.id}/${theme.localisation.video.path}`
        return (
          <Resource key={ resource.id }
            name={ resource.name }
            draggable="true"
            classes={ ['draggable', index === this.state.dragged && 'hidden'] }
            onDragStart={(e) => { this.dragStart(e, index)}}
            onDragEnd={() => { this.dragEnd(index)}}
            onDragOver={(e) => { this.dragOver(e, index)}}
            onDrop={this.drop}>
            <ActionMenu name="Actions">
              <ActionMenuItem label={`Manage Episode ${pluralize(theme.localisation.video.upper)}`} link={ videoLink } />
              <ActionMenuItem label="Edit" onClick={() => { this.updateResource(resource) }} divide />
              <ActionMenuItem label="Delete" onClick={() => { this.deleteResource(resource) }} />
            </ActionMenu>
          </Resource>
        )
      })
    }
    if(resources.length > 0) {
      return (
        <div className="container">
          <table className="cms-table">
            <thead>
              <tr>
                <th colSpan="2">Name</th>
              </tr>
            </thead>
            <tbody>
              { resources }
            </tbody>
          </table>
        </div>
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>There are currently no {pluralize(this.resourceName)}, try creating some!</p>
          </div>
        </div>
      )
    }
  }

  render() {
    const { parent } = this.state
    const { location, theme } = this.props
    const pageTitle = parent ? `Manage Episodes for ${this.state.parent.programme.title} ${this.state.parent.name}` : ''
    let buttonLink = `/admin/${theme.localisation.programme.path}/${this.props.match.params.programme}/${theme.localisation.series.path}`
    let buttonText = parent ? `Back to ${this.state.parent.programme.title} ${pluralize(theme.localisation.series.upper)}` : ''
    if (location.state?.backUrl) {
      buttonLink = location.state.backUrl + location.search
      buttonText = `Back to ${pluralize(theme.localisation.series.upper)}`
    }

    const title = parent ? `${theme.localisation.client} :: ${this.state.parent.programme.title} / ${this.state.parent.name} / Episodes` : 'Episodes'
    return (
      <Meta
        title={title}
        meta={{
          description: 'Manage Episodes'
        }}>
        <PageLoader { ...this.state }>
          <main>
            <PageHeader title={ pageTitle }
              subtitle={`${this.state.resources && this.state.resources.meta && this.state.resources.meta['record-count']} ${this.state.resources && this.state.resources.meta && this.state.resources.meta['record-count'] === 1 ? theme.localisation.episodes.lower : pluralize(theme.localisation.episodes.lower)}`}>
              <Button className="button" onClick={ this.createResource }>
                <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                New {this.resourceName}
              </Button>
            </PageHeader>
            <div className="container">
              <div className="page-actions">
                <NavLink to={ buttonLink } className="button">
                  <Icon width="8" height="13" id="i-admin-back" classes="button__icon" />
                  { buttonText }
                </NavLink>
              </div>
            </div>
            { this.renderResources() }
            { this.state.modal() }
          </main>
        </PageLoader>
      </Meta>
    )
  }
}

export default EpisodeIndex