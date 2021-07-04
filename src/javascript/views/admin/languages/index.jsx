import React from 'react'
import IndexHelper from 'javascript/views/admin/index-helper'
import Store from 'javascript/stores/languages'
import Actions from 'javascript/actions/languages'
import Form from 'javascript/views/admin/languages/form'

export default class LanguagesIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.form = (props) => <Form {...props} />
    this.resourceName = "Language"
    this.query = {
      sort: 'name',
      page: {
        size: 50,
        number: 1
      },
      fields: {
        languages: 'name,programmes-count,videos-count'
      }
    }
    this.meta = {
      title: `${props.theme.localisation.client} :: Languages`,
      meta: {
        description: 'Manage languages'
      }
    }
  }

}