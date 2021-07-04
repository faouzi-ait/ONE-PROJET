import React from 'react'
import IndexHelper from 'javascript/views/admin/index-helper'
import Store from 'javascript/stores/marketing-categories'
import Actions from 'javascript/actions/marketing-categories'
import Form from 'javascript/views/admin/marketing/categories/form'
import withTheme from 'javascript/utils/theme/withTheme'
class MarketingCategoriesIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.form = (props) => <Form {...props} />
    this.resourceName = "Marketing Category"
    this.query = {
      page: {
        size: 50,
        number: 1
      },
      sort: 'name',
      fields: {
        'marketing-categories': 'name,marketing-activities-count'
      }
    }
    this.meta = {
      title: `${this.props.theme.localisation.client} :: Marketing Categories`,
      meta: {
        description: `Manage marketing categories`
      }
    }
  }

}

export default withTheme(MarketingCategoriesIndex)