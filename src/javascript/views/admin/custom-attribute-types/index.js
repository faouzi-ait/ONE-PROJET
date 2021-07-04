import React from 'react'
import pluralize from 'pluralize'
import IndexHelper from 'javascript/views/admin/index-helper'
import Store from 'javascript/stores/custom-attribute-types'
import Actions from 'javascript/actions/custom-attribute-types'
import Form from 'javascript/views/admin/custom-attribute-types/form'

import Button from 'javascript/components/button'
import PageLoader from 'javascript/components/page-loader'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'
import Resource from 'javascript/components/admin/resource'
import Modal from 'javascript/components/modal'
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Meta from 'react-document-meta'

export default class CustomAttributeTypesIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.form = (props) => <Form {...props} />
    this.resourceName = "Custom Attribute"
    this.query = {
      page: {
        size: 50,
        number: 1
      },
      fields: {
        'custom-attribute-types': 'name,attribute-type,related-type,config,position'
      }
    }
    this.meta = {
      title: `${props.theme.localisation.client} :: Custom Attributes`,
      meta: {
        description: `Manage custom attributes`
      }
    }
    this.state = {
      programmes: [],
      series: [],
      productionCompanies: [],
      modal: () => { }
    }
  }

  componentWillMount() {
    this.store.on('change', this.getResources)
    this.store.on('positionUpdated', this.refreshStore)
  }

  componentWillUnmount() {
    this.store.removeListener('change', this.getResources)
    this.store.removeListener('positionUpdated', this.refreshStore)
  }

  componentDidMount() {
    this.refreshStore()
  }

  refreshStore = () => {
    this.actions.getResources(this.query)
  }

  sort = (a, b) => {
    const pos = a.position - b.position
    return pos !== 0 ? pos : Number(a.id) - Number(b.id)
  }

  getResources = () => {
    this.setState({
      programmes: this.store.getResources().filter(i => i['related-type'] === 'Programme').sort(this.sort),
      series: this.store.getResources().filter(i => i['related-type'] === 'Series').sort(this.sort),
      productionCompanies: this.store.getResources().filter(i => i['related-type'] === 'Production Company').sort(this.sort)
    })
    this.finishedLoading()
    this.unsetModal()
  }

  dragStart = (e, index, type) => {
    this.state[`${type}-dragged`] = index
    e.dataTransfer.setData('text', e.currentTarget.getAttribute('name'))
  }

  dragEnd = (index, type) => {
    let resource = this.state[type][this.state[`${type}-dragged`]]
    this.actions.updatePosition({
      id: resource.id,
      position: resource.position
    })
    this.setState({
      [`${type}-dragged`]: false
    })
  }

  dragOver = (e, index, type) => {
    e.preventDefault()
    let resources = this.state[type]
    resources[this.state[`${type}-dragged`]].position = index + 1
    resources.splice(index, 0, resources.splice(this.state[`${type}-dragged`], 1)[0])
    this.setState({
      [type]: resources,
      [`${type}-dragged`]: index
    })
  }

  drop = (e) => {
    e.preventDefault()
  }

  createResource = () => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={this.unsetModal}
            title={`New ${this.resourceName}`}
            titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
            <div className="cms-modal__content">
              {this.form({
                resource: { config: {}},
                method: 'createResource'
              })}
            </div>
          </Modal>
        )
      }
    })
  }

  renderResources = (type) => {
    let resources
    const { theme } = this.props
    resources = this.state[type].map((resource, index) => {

      return (
        <Resource
          key={resource.id}
          name={resource.name}
          draggable="true"
          classes={['draggable', index === this.state[`${type}-dragged`] && 'hidden']}
          onDragStart={(e) => { this.dragStart(e, index, type) }}
          onDragEnd={() => { this.dragEnd(index, type) }}
          onDragOver={(e) => { this.dragOver(e, index, type) }}
          onDrop={this.drop}>
          <ActionMenu name="Actions">
            <ActionMenuItem label="Edit" onClick={() => { this.updateResource(resource) }} />
            <ActionMenuItem label="Delete" onClick={() => { this.deleteResource(resource) }} />
          </ActionMenu>
        </Resource>
      )
    })
    const title = type === 'programmes' ? `${pluralize(theme.localisation.programme.upper)} Attributes` : (type === 'series' ? `${pluralize(theme.localisation.series.upper)} Attributes` : `${pluralize(theme.localisation.productionCompany.upper)} Attributes`)

    if (resources.length > 0) {
      return (
        <div className="container">
          <h2>{title}</h2>
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
        </div>
      )
    } else {
      return (
        <div className="container">
          <h2>{title}</h2>
          <div className="panel u-align-center">
            <p>There are currently no {pluralize(this.resourceName)}, try creating some!</p>
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <Meta {...this.meta}>
        <PageLoader {...this.state}>
          <main>
            <PageHeader title={`Manage ${pluralize(this.resourceName)}`}>
              <Button className="button" onClick={this.createResource}>
                <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                New {this.resourceName}
              </Button>
            </PageHeader>
            {this.renderResources('programmes')}
            {this.renderResources('series')}
            {this.props.theme.features.customAttributes.models.includes('ProductionCompany') && this.renderResources('productionCompanies') }
            {this.state.modal()}
          </main>
        </PageLoader>
      </Meta>
    )
  }

}