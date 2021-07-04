import React from 'react'
import IndexHelper from 'javascript/views/admin/index-helper'
import Store from 'javascript/stores/companies'
import Actions from 'javascript/actions/companies'
import Form from 'javascript/views/admin/companies/form'

export default class CompaniesIndex extends IndexHelper {

  constructor(props) {
    super(props)
    this.store = Store
    this.actions = Actions
    this.form = (props) => <Form {...props} />
    this.resourceName = "Company"
    this.query = {
      sort: 'name',
      page: {
        size: 50,
        number: 1
      },
      fields: {
        /* #region  ae | all3 | amc | cineflix | demo | discovery | endeavor | fremantle | drg | itv | keshet | rtv | storylab | wildbrain */
        companies: 'name,users-count',
        /* #endregion */
        /* #region  banijaygroup */
        companies: 'name,users-count,company-type'
        /* #endregion */

      }
    }
    this.meta = {
      title: `${props.theme.localisation.client} :: Companies`,
      meta: {
        description: `Manage companies`
      }
    }
  }

}