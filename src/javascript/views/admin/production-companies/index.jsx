import React from 'react'
import pluralize from 'pluralize'

// Actions
import CustomAttributeTypeActions from 'javascript/actions/custom-attribute-types'
import ProductionCompanyActions from 'javascript/actions/production-companies'
// Stores
import CustomAttributeTypeStore from 'javascript/stores/custom-attribute-types'
import ProductionCompanyStore from 'javascript/stores/production-companies'
import VideoStore from 'javascript/stores/videos'

import { isAdmin, hasPermission } from 'javascript/services/user-permissions'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import DeleteForm from 'javascript/components/admin/delete-video'
import Form from 'javascript/views/admin/production-companies/form'
import IndexHelper from 'javascript/views/admin/index-helper'
import Modal from 'javascript/components/modal'
import Resource from 'javascript/components/admin/resource'
import VideoForm from 'javascript/components/admin/video-form'
import Paginator from 'javascript/components/paginator'
// Hoc
import withVideoProviders from 'javascript/components/hoc/with-video-providers'

class ProductionCompaniesIndex extends IndexHelper {
  constructor(props) {
    super(props)
    const { theme } = props
    this.store = ProductionCompanyStore
    this.actions = ProductionCompanyActions
    this.form = (props) => <Form {...props} />
    this.resourceName = theme.localisation.productionCompany.upper
    this.meta = {
      title: `${theme.localisation.client} :: ${this.resourceName}`,
      meta: {
        description: `Edit and Create ${pluralize(theme.localisation.productionCompany.upper)}`
      }
    }
    const include = ['video', theme.features.customAttributes.models.includes('ProductionCompany') && 'custom-attributes,custom-attributes.custom-attribute-type'].filter(Boolean).join(',')
    let fields = {
      'production-companies': ['name,background-image,country,external-url,intro,logo,programmes-count,video,external-id',
      theme.features.customAttributes.models.includes('ProductionCompany') && 'custom-attributes'].filter(Boolean).join(',')
    }
    if(theme.features.customAttributes.models.includes('ProductionCompany')) {
      fields['custom-attributes'] = 'value,custom-attribute-type'
      fields['custom-attribute-types'] = 'name'
    }
    const { wistia, brightcove } = props.videoProviders
    this.query = {
      sort: 'name',
      'page[number]': 1,
      'page[size]': 50,
      include,
      fields: {
        ...fields,
        'video': ['name', 'mp4-url', wistia && 'wistia-id', brightcove && 'brightcove-id'].filter(v => v).join(',')
      }
    }
    this.state = {
      resources: [],
      types: [],
      modal: () => { }
    }
  }

  componentWillMount() {
    this.store.on('change', this.getResources)
    this.store.on('save', this.fetchResources)
    VideoStore.on('change', this.onSave)

    if (this.props.theme.features.customAttributes.models.includes('ProductionCompany')) {
      CustomAttributeTypeStore.on('change', this.getResources)
    }
  }

  componentWillUnmount() {
    this.store.removeListener('change', this.getResources)
    this.store.removeListener('save', this.fetchResources)
    VideoStore.removeListener('change', this.onSave)
    if (this.props.theme.features.customAttributes.models.includes('ProductionCompany')) {
      CustomAttributeTypeStore.removeListener('change', this.getResources)
    }
  }

  componentDidMount() {
    this.fetchResources()
  }

  fetchResources = () => {
    this.actions.getResources(this.query)
    CustomAttributeTypeActions.getResources({
      filter: {
        related_type: 'Production Company'
      }
    })
  }

  updatePage = (page, size = false) => {
    const update = this.query
    if(size) {
      update['page[size]'] = parseInt(page)
      update['page[number]'] = 1
    } else {
      update['page[number]'] = parseInt(page)
    }
    this.query = update
    this.actions.getResources(this.query)
  }

  getResources = () => {
    const resources = this.store.getResources()
    this.setState({
      resources,
      types: CustomAttributeTypeStore.getResources(),
      totalPages: resources.meta['page-count'],
      recordCount: resources.meta['record-count']
    })
    this.finishedLoading()
    this.unsetModal()
  }

  createResource = () => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={this.unsetModal}
            title={`New ${this.resourceName}`}
            titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}
          >
            <div className="cms-modal__content">
              {this.form({
                resource: {},
                method: "createResource",
                types: this.state.types
              })}
            </div>
          </Modal>
        )
      }
    })
  }

  updateResource = (resource) => {
    const resourceClone = Object.assign({}, resource)
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={this.unsetModal}
            title={`Edit ${this.resourceName}`}>
            <div className="cms-modal__content">
              {this.form({
                resource: resourceClone,
                method: "updateResource",
                types: this.state.types
              })}
            </div>
          </Modal>
        )
      }
    })
  }


  onSave = () => {
    this.actions.getResources(this.query)
    this.unsetModal()
  }

  updateResourceVideo = (resource) => {
    const resourceClone = Object.assign({}, resource)
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={this.unsetModal}
            title={`Edit Video`}>
            <div className="cms-modal__content">
              <VideoForm parent={resource} resource={resourceClone.video} onSave={this.onSave} />
            </div>
          </Modal>
        )
      }
    })
  }

  deleteResourceVideo = (resource) => {
    this.setState({
      modal: () => {
        return (
          <Modal closeEvent={this.unsetModal} title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} ref="modal">
            <div className="cms-modal__content">
              <DeleteForm resource={resource.video} closeEvent={this.unsetModal} />
            </div>
          </Modal>
        )
      }
    })
  }

  renderResources = () => {
    if (!this.state.resources) return null
    const { user, theme } = this.props
    const { features } = theme
    const hasVideosPermission = isAdmin(user) || hasPermission(user, ['manage_videos'] || hasPermission(user, ['manage_programmes']))
    const resources = this.state.resources.map((resource) => {
      return (
        <Resource key={resource.id} name={resource.name}>
          <ActionMenu name="Actions">
            <ActionMenuItem label="Edit" onClick={() => { this.updateResource(resource) }} />
            <ActionMenuItem label="Delete" onClick={() => { this.deleteResource(resource) }} />
            {
              hasVideosPermission && features.customAttributes.models.includes('ProductionCompany') &&
              <ActionMenuItem label="Edit video" onClick={() => { this.updateResourceVideo(resource) }} />
            }
            {
              hasVideosPermission && features.customAttributes.models.includes('ProductionCompany') &&
              resource.video &&
              <ActionMenuItem label="Delete video" onClick={() => { this.deleteResourceVideo(resource) }} />
            }
          </ActionMenu>
        </Resource>
      )
    })
    if (resources.length > 0) {
      return (
        <div className="container">
          <table className="cms-table">
            <thead>
              <tr>
                <th colSpan="2">Name</th>
              </tr>
            </thead>
            <tbody>
              {resources}
            </tbody>
          </table>
          <Paginator currentPage={parseInt(this.query['page[number]'])} totalPages={this.state.totalPages} onChange={this.updatePage} onPageSizeChange={(page) => this.updatePage(page, true)} currentPageSize={parseInt(this.query['page[size]'])} />
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
}

export default withVideoProviders(ProductionCompaniesIndex)
