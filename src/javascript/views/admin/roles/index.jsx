import React from 'react'
import IndexHelper from '../index-helper'
import Store from '../../../stores/roles'
import Actions from '../../../actions/roles'
import Form from './form'
import Resource from '../../../components/admin/resource'
import { ActionMenu, ActionMenuItem } from '../../../components/admin/action-menu'
import Modal from '../../../components/modal'
import pluralize from 'pluralize'

export default class RolesIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.form = (props) => <Form {...props} />
    this.resourceName = "Role"
    this.query = {
      page: {
        size: 50,
        number: 1
      },
      fields: {
        role: 'name,permissions'
      }
    }
  }

  componentWillMount() {
    this.store.on('change', this.getResources)
    this.store.on('save', this.refreshResources)
  }

  componentWillUnmount() {
    this.store.removeListener('change', this.getResources)
    this.store.removeListener('save', this.refreshResources)
  }

  refreshResources = () => {
    this.actions.getResources(this.query)
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
                  'permissions': {}
                },
                method: 'createResource'
              })}
            </div>
          </Modal>
        )
      }
    })
  }

  renderResources = () => {
    const resources = this.state.resources.map((resource) => {
      return (
        <Resource key={ resource.id } name={ resource.name }>
          {resource.name !== 'admin' &&
            <ActionMenu name="Actions">
              <ActionMenuItem label="Edit" onClick={() => { this.updateResource(resource) }} />
              {resource.name !== 'account_manager' &&
                <ActionMenuItem label="Delete" onClick={() => { this.deleteResource(resource) }} />
              }
            </ActionMenu>
          }
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