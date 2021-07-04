import APIHelper from 'javascript/services/helper'
import modelData from 'javascript/models'

class CustomersService extends APIHelper {
  constructor(props) {
    super(props)
    this.resourceName = 'customer'
    this.jsonApi.define('customer', modelData.customers)
  }
}

const service = new CustomersService
export default service
