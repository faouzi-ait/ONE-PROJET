import React from 'react'
import pluralize from 'pluralize'
import moment from 'moment'
// Stores
import VideoStore from 'javascript/stores/videos'
import PrivateVideoStore from 'javascript/stores/private-video-access'
// Actions
import Actions from 'javascript/actions/videos'
// Components
import {
  ActionMenu,
  ActionMenuItem,
} from 'javascript/components/admin/action-menu'
import Button from 'javascript/components/button'
import Form from 'javascript/views/admin/videos/private-access-form'
import Icon from 'javascript/components/icon'
import IndexHelper from 'javascript/views/admin/index-helper'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import NavLink from 'javascript/components/nav-link'
import PageHeader from 'javascript/components/admin/layout/page-header'
import PageLoader from 'javascript/components/page-loader'
import Resource from 'javascript/components/admin/resource'

export default class PrivateVideoAccessIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.resourceName = `Private ${pluralize(this.props.theme.localisation.video.upper)} Access`
    this.state.resource = false
    this.form = (props) => <Form {...props} />
  }

  componentWillMount() {
    VideoStore.on('change', this.setResourceToState)
    PrivateVideoStore.on('change', this.getResourcesAfterChange)
    PrivateVideoStore.on('save', this.getResources)
    PrivateVideoStore.on('delete', this.getResourcesAfterChange)
  }

  componentWillUnmount() {
    VideoStore.removeListener('change', this.setResourceToState)
    PrivateVideoStore.removeListener('change', this.getResourcesAfterChange)
    PrivateVideoStore.removeListener('save', this.getResources)
    PrivateVideoStore.removeListener('delete', this.getResourcesAfterChange)
  }

  componentDidMount() {
    this.getResources()
  }

  getResourcesAfterChange = () => {
    this.unsetModal()
    this.getResources()
  }

  getResources = () => {
    Actions.getResource(this.props.match.params.video, {
      include: 'private-video-accesses',
      sort: '-created-at',
      fields: {
        'videos': 'private-video-accesses',
        'private-video-accesses': 'expiry-date,slug,created-at,password'
      }
    })
  }

  setResourceToState = () => {
    this.setState({
      resource: VideoStore.getResource()
    }, this.isLoaded)
  }

  isLoaded = () => {
    if(this.state.resource) {
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
              <Form resource={{
                'video-id': this.state.resource.id
              }} closeEvent={ this.unsetModal } method="createResource" />
            </div>
          </Modal>
        )
      }
    })
  }

  updateResource = (resource) => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={ this.unsetModal }
            title={`Edit ${this.resourceName}`}
            titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
            <div className="cms-modal__content">
              <Form resource={resource} closeEvent={ this.unsetModal } method="updateResource" />
            </div>
          </Modal>
        )
      }
    })
  }

  renderResources = () => {
    const { theme } = this.props
    let resources = []
    if(this.state.resource['private-video-accesses']) {
      resources = this.state.resource['private-video-accesses'].map((resource) => {
        const url = `${window.location.origin}/${theme.localisation.video.path}/${resource.slug}`
        return (
          <Resource key={ resource.id }
            name={ moment(resource['created-at']).format(theme.features.formats.longDate) }
            fields={() => [
              <td key={1}>
                <a href={url} target="_blank">{url}</a>
              </td>,
              <td key={2}>
                <p>{resource.password}</p>
              </td>,
              <td key={3}>
                {resource['expiry-date'] ? (
                  moment(resource['expiry-date']).format(theme.features.formats.longDate)
                ) : (
                  <span>no expiration date</span>
                )}
              </td>,
              <td key={4}>
                { (resource['expiry-date'] && moment(resource['expiry-date']).isBefore(Date.now())) &&
                  <span className="count count--disabled">Expired</span>
                }
              </td>,
              <td key={5}>
                <ActionMenu name="Actions">
                  <ActionMenuItem
                    label="Edit"
                    onClick={() => this.updateResource(resource)}
                  />
                  <ActionMenuItem
                    label="Delete"
                    onClick={() => this.deleteResource(resource)}
                  />
                </ActionMenu>
              </td>
            ]}>
          </Resource>
        )
      })
    }
    if (resources.length > 0) {
      return (
        <div className="container">
          <table className="cms-table">
            <thead>
              <tr>
                <th>Date generated</th>
                <th>URL</th>
                <th>Password</th>
                <th colSpan="4">Expiry date</th>
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
    const { theme } = this.props
    const pageTitle = `Manage Private ${pluralize(theme.localisation.video.upper)} Access`
    const buttonLink = `/admin/${theme.localisation.video.path}`
    const buttonText = `Back to ${pluralize(theme.localisation.video.upper)}`
    const title = `${theme.localisation.client} :: Private Video Access`
    return (
      <Meta
        title={title}
        meta={{
          description: 'Manage Private Video Access'
        }}>
        <PageLoader { ...this.state }>
          <main>
            <PageHeader title={ pageTitle }>
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