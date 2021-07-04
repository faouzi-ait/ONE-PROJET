import API from 'javascript/services/series-talents'
import { ViewHelperActions, ApiHelperActions } from 'javascript/actions/helper'

class SeriesTalentsApiActions extends ApiHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'SERIES_TALENT'
  }
}

API.actions = new SeriesTalentsApiActions

class SeriesTalentsViewActions extends ViewHelperActions {
  constructor(props) {
    super(props)
    this.resourceName = 'SERIES_TALENT'
    this.API = API
  }

  createAndAssociate(response, talents, callback) {
    const total = talents.length
    let count = 0
    if (total < 1) {
      callback()
    }
    talents.forEach((a,i) => {
      if (!a['talent-type'].id) {
        return false
      }
      a.series.id = response.id
      this.API.createResource({...a, position: i+1}, () => {
        count++
        if (count === total) {
          callback()
        }
      })
    })
  }

  createOrUpdate(talents = [], callback) {
    const total = talents.length
    let count = 0
    if (total < 1) {
      callback()
    }
    talents.forEach((a,i) => {
      if (!a['talent-type'].id) {
        count ++
        if (count === total) {
          callback()
        }
        return false
      }
      if (a.id) {
        this.API.updateResource(a, () => {
          count++
          if (count === total) {
            callback()
          }
        })
      } else {
        this.API.createResource({...a, position: i+1}, () => {
          count++
          if (count === total) {
            callback()
          }
        })
      }
    })
  }

}

const actions = new SeriesTalentsViewActions
export default actions
