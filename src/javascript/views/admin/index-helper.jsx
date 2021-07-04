import React from 'react'
import pluralize from 'pluralize'
import PageHelper from 'javascript/views/page-helper'

import Button from 'javascript/components/button'
import PageLoader from 'javascript/components/page-loader'
import PageHeader from 'javascript/components/admin/layout/page-header'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import Resource from 'javascript/components/admin/resource'
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Paginator from 'javascript/components/paginator'
import Meta from 'react-document-meta'

export default class IndexHelper extends PageHelper {

  constructor(props) {
    super(props)
    this.state = {
      resources: [],
      modal: () => {}
    }
    this.query = {}
  }

  componentWillMount() {
    this.store.on('change', this.getResources)
  }

  componentWillUnmount() {
    this.store.removeListener('change', this.getResources)
  }

  componentDidMount() {
    this.actions.getResources(this.query)
  }

  getResources = () => {
    const resources = this.store.getResources()
    this.setState({
      resources
    }, ()=> {
      if (resources.meta) {
        this.setState({
          totalPages: resources.meta['page-count'],
          recordCount: resources.meta['record-count']
        })
      }
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
            closeEvent={ this.unsetModal }
            title={`New ${this.resourceName}`}
            titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
            <div className="cms-modal__content">
              {this.form({
                resource: {},
                method: "createResource"
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
            closeEvent={ this.unsetModal }
            title={`Edit ${this.resourceName}`}>
            <div className="cms-modal__content">
              {this.form({
                resource: resourceClone,
                method: "updateResource"
              })}
            </div>
          </Modal>
        )
      }
    })
  }

  deleteResource = (resource) => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={ this.unsetModal }
            title="Warning" modifiers={['warning']}
            titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
            <div className="cms-modal__content">
              {this.form({
                resource,
                method: "deleteResource",
                closeEvent: this.unsetModal,
                params: this.props.match.params,
              })}
            </div>
          </Modal>
        )
      }
    })
  }

  updatePage = (page, size = false) => {
    const update = this.query
    if(size) {
      update.page.size = parseInt(page)
      update.page.number = 1
    } else {
      update.page.number = parseInt(page)
    }
    this.query = update
    this.actions.getResources(this.query)
  }

  renderResources = () => {
    const resources = this.state.resources.map((resource) => {
      return (
        <Resource key={ resource.id } name={ resource.name }>
          <ActionMenu name="Actions">
            <ActionMenuItem label="Edit" onClick={() => { this.updateResource(resource) }} />
            <ActionMenuItem label="Delete" onClick={() => { this.deleteResource(resource) }} />
          </ActionMenu>
        </Resource>
      )
    })
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
          <Paginator
            currentPage={parseInt(this.query.page.number)}
            totalPages={this.state.totalPages}
            onChange={this.updatePage}
            onPageSizeChange={(page) => this.updatePage(page, true)}
            currentPageSize={parseInt(this.query.page.size)}
          />
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
    return (
      <Meta {...this.meta}>
        <PageLoader { ...this.state }>
          <main>
            <PageHeader
              title={`Manage ${pluralize(this.resourceName)}`}
              subtitle={`${this.state.resources && this.state.recordCount} ${
                this.state.resources && this.state.recordCount === 1
                  ? this.resourceName
                  : pluralize(this.resourceName)
              }`}>
              <Button className="button" onClick={ this.createResource }>
                <Icon width="14" height="14" id="i-admin-add" classes="button__icon" />
                New {this.resourceName}
              </Button>
            </PageHeader>
            { this.renderResources() }
            { this.state.modal() }
          </main>
        </PageLoader>
      </Meta>
    )
  }

}