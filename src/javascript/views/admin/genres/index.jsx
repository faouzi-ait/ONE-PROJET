import React from 'react'
import deepmerge from 'deepmerge-concat'
import pluralize from 'pluralize'

import Actions from 'javascript/actions/genres'
import Store from 'javascript/stores/genres'

import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Form from 'javascript/views/admin/genres/form'
import Genre from 'javascript/components/admin/genres/genre'
import IndexHelper from 'javascript/views/admin/index-helper'
import Modal from 'javascript/components/modal'
import Resource from 'javascript/components/admin/resource'
import { ReorderableList } from 'javascript/components/reorderable-list'
import SlideToggle from 'javascript/components/slide-toggle'

export default class GenresIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.form = (props) => <Form {...props} />
    this.resourceName = props.theme.localisation.genre.upper
    this.meta = {
      title: `${props.theme.localisation.client} :: ${pluralize(props.theme.localisation.genre.upper)}`,
      meta: {
        description: `Manage ${pluralize(props.theme.localisation.genre.lower)}`
      }
    }
    this.state = {
      resources: [],
      modal: () => {},
      collapsed: false
    }
  }

  componentWillMount() {
    this.store.on('change', this.getResources)
    this.store.on('save', this.refreshResources)
    this.store.on('delete', this.refreshResources)
  }

  componentWillUnmount() {
    this.store.removeListener('change', this.getResources)
    this.store.removeListener('save', this.refreshResources)
    this.store.removeListener('delete', this.refreshResources)
  }

  componentDidMount() {
    this.refreshResources()
  }

  refreshResources = () => {
    let query = {
      include: 'sub-genres',
      filter: {
        scope: 'top_level'
      },
      fields: {
        genres: 'name,sub-genres,parent-id,active-programmes-count,image,show-in-registration,position'
      }
    }
    if (this.props.theme.features.dashboard.admin) {
      query = deepmerge.concat(query, {
        include: 'featured-programme',
        fields: {
          genres: 'featured-programme'
        }
      })
    }
    this.actions.getResources(query)
  }

  createResource = (resource) => {
    const parent = resource.id || false
    const formResource = parent ? { 'parent-id': parent } : {}
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={ this.unsetModal }
            title={`New ${this.resourceName}`}
            titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
            <div className="cms-modal__content">
              { this.form({
                resource: formResource,
                method: 'createResource',
                genres: this.state.resources
              })}
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
            title={`Edit ${this.resourceName}`}>
            <div className="cms-modal__content">
              {this.form({
                resource,
                method: 'updateResource',
                genres: this.state.resources
              })}
            </div>
          </Modal>
        )
      }
    })
  }

  renderResourceChildren = (resource) => {
    if (!resource) {
      return null
    }
    return (
      <ReorderableList
        items={(resource['sub-genres'] || []).sort((a, b) => a.position - b.position)}
        onChange={({ item, newPosition }) => {
          Actions.updateResource({
            id: item.id,
            position: newPosition,
          })
        }}
        droppableTag="tbody"
        draggableTag="tr"
        renderItem={({ item: child  }) => {
          return (
            <>
              <td>{ child.name }</td>
              <td className="cms-table__actions">
              <ActionMenu name="Actions">
                <ActionMenuItem label="Edit" onClick={() => { this.updateResource(child) } }/>
                <ActionMenuItem label="Delete" onClick={() => { this.deleteResource(child) } } />
              </ActionMenu>
              </td>
            </>
          )
        }}
      />
    )
  }

  renderResources = () => {
    if (this.state.resources?.length > 0) {
      return (
        <>
          <div className="container">
            <SlideToggle identifier={'collapse'} off="Collapse" onChange={e => {
              this.setState({
                collapsed: e.target.checked
              })
            }} checked={this.state.collapsed} />
          </div>
          <div className="container">
            <ReorderableList
              items={(this.state.resources || []).sort((a, b) => a.position - b.position)}
              onChange={({ item, newPosition }) => {
                Actions.updateResource({
                  id: item.id,
                  position: newPosition,
                })
              }}
              disabled={!this.state.collapsed}
              droppableTag="div"
              draggableTag="div"
              draggableStyle={{marginBottom: '20px'}}
              renderItem={({ item: child  }) => {
                return (
                  <Genre
                    resource={ child }
                    newEvent={ this.createResource }
                    editEvent={ this.updateResource }
                    deleteEvent={ this.deleteResource }
                    open={!this.state.collapsed}>
                    { this.renderResourceChildren(child) }
                  </Genre>
                )
              }}
            />
          </div>
        </>
      )
    } else {
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>There are currently no genres, try creating some!</p>
          </div>
        </div>
      )
    }
  }
}
