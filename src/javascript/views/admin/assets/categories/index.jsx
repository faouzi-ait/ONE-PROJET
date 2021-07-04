import React from 'react'
import pluralize from 'pluralize'

import Actions from 'javascript/actions/asset-categories'
import Store from 'javascript/stores/asset-categories'

import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Form from 'javascript/views/admin/assets/categories/form'
import IndexHelper from 'javascript/views/admin/index-helper'
import Resource from 'javascript/components/admin/resource'

export default class AssetCategoryIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.query = {
      page: {
        size: 50,
        number: 1
      },
      fields: {
        'asset-categories': 'name,blocked,asset-materials-count'
      }
    }
    this.form = (props) => <Form {...props} />
    this.resourceName = `${props.theme.localisation.asset.upper} Category`
    this.meta = {
      title: `${props.theme.localisation.client} :: ${props.theme.localisation.asset.upper} Categories`,
      meta: {
        description: `Manage ${props.theme.localisation.asset.lower} categories`
      }
    }
  }

  renderResources = () => {
    const resources = this.state.resources.map((resource) => {
      return (
        <Resource key={ resource.id } name={ resource.name }>
          { resource['blocked'] ? (<div/>) : (
            <ActionMenu name="Actions">
              <ActionMenuItem label="Edit" onClick={() => { this.updateResource(resource) }} />
              <ActionMenuItem label="Delete" onClick={() => { this.deleteResource(resource) }} />
            </ActionMenu>
          )}
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