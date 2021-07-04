import React from 'react'
import IndexHelper from 'javascript/views/admin/index-helper'
import Store from 'javascript/stores/qualities'
import Actions from 'javascript/actions/qualities'
import Form from 'javascript/views/admin/qualities/form'

export default class QualitiesIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.form = (props) => <Form {...props} />
    this.resourceName = "Quality"
    this.meta = {
      title: `${this.props.theme.localisation.client} :: Qualities`,
      meta: {
        description: 'Edit and Create Qualities'
      }
    }
    this.query = {
      sort: 'name',
      page: {
        size: 50,
        number: 1
      },
      fields: {
        qualities: 'name'
      }
    }
  }

}