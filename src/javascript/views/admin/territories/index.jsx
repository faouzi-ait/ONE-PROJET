import React from 'react'
import IndexHelper from 'javascript/views/admin/index-helper'
import Store from 'javascript/stores/territory'
import Actions from 'javascript/actions/territory'
import Form from 'javascript/views/admin/territories/form'
import Modal from 'javascript/components/modal'
import DeleteForm from 'javascript/views/admin/territories/delete'

export default class TerritoriesIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.form = (props) => <Form {...props} />
    this.resourceName = "Territory"
    this.meta = {
      title: `${props.theme.localisation.client} :: Territories`,
      meta: {
        description: 'Edit and Create Territories'
      }
    }
    this.query = {
      sort: 'name',
      page: {
        size: 50,
        number: 1
      },
      fields: {
        territories: 'name,users-count'
      }
    }
  }

  deleteResource = (resource) => {
    this.setState({
      modal: () => {
        return (
          <Modal
            ref="modal"
            closeEvent={ this.unsetModal }
            title="Warning"
            modifiers={['warning']}
            titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
            <div className="cms-modal__content">
              <DeleteForm territory={ resource } closeEvent={ this.unsetModal } />
            </div>
          </Modal>
        )
      }
    })
  }
}
