import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import { ActionMenu, ActionMenuItem } from 'javascript/components/admin/action-menu'
import Modal from 'javascript/components/modal'
import PassportLocationsIndex from 'javascript/views/admin/passport/locations/index'
import Resource from 'javascript/components/admin/resource'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPageHelper from 'javascript/components/hoc/with-page-helper'
import withIndexHelper from 'javascript/components/hoc/with-index-helper'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportMarketsIndex = (props) => {
  const { localisation: Localisation } = useTheme()
  const meta = {
    title: `${Localisation.client} :: ${Localisation.passport.market.upper}`,
    meta: {
      description: `Edit and Create ${Localisation.passport.market.upper}`
    }
  }

  useEffect(() => {
    if (props.deleteError) {
      props.modalState.hideModal()
      setTimeout(() => {
        props.modalState.showModal(({ hideModal }) => {
          return (
            <Modal
              closeEvent={ hideModal }
              title="Warning" modifiers={['']}
              titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }}>
              <div className="cms-modal__content">
                <div>
                  <p>Market was <strong>NOT</strong> deleted</p>
                  <p>This market has associated hotel-reservations</p>
                </div>
              </div>
            </Modal>
          )
        })
      }, 600)
    }
  }, [props.deleteError])

  const renderResourceFields = (market) => {
    const formatDate = (date) => {
      return moment(date).format('DD/MM/YY')
    }
    return (
      <>
        <td>
          { formatDate(market['start-date']) }
        </td>
        <td>
          { formatDate(market['end-date']) }
        </td>
      </>
    )
  }

  const masterSpreadsheet = (market) => {
    props.history.push(`/admin/${Localisation.passport.market.path}/${market.id}/spreadsheet`)
  }

  const renderResources = (props) => {
    const marketItems = (props.markets || []).map((market) => {
      return (
        <Resource key={ market.id } name={ market.name } fields={() => renderResourceFields(market)} >
          <ActionMenu name="Actions">
            <ActionMenuItem label="View" link={ `/admin/${Localisation.passport.market.path}/${market.id}`} />
            <ActionMenuItem label="Edit" link={ `/admin/${Localisation.passport.market.path}/${market.id}/edit` } />
            <ActionMenuItem label="Delete" onClick={() => { props.renderDeleteResource(market, props) }} />
            <ActionMenuItem label={Localisation.passport.spreadsheet} divide onClick={() => masterSpreadsheet(market) } />
            <ActionMenuItem label={`Duplicate ${Localisation.passport.market.upper}`} divide onClick={() => props.duplicateMarket(market) } />
          </ActionMenu>
        </Resource>
      )
    })
    if(marketItems.length > 0) {
      return (
        <div className="container">
          <table className="cms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Start</th>
                <th colSpan="3">End</th>
              </tr>
            </thead>
            <tbody>
              { marketItems }
            </tbody>
          </table>
        </div>
      )
    } else {
      const marketsText = `${Localisation.passport.upper} ${pluralize(Localisation.passport.market.upper)}`
      return (
        <div className="container">
          <div className="panel u-align-center">
            <p>There are currently no {marketsText}, try creating some!</p>
          </div>
        </div>
      )
    }
  }

  const renderPageChildren = () => {
    return (
      <PassportLocationsIndex editOnly={true} showAll={true} />
    )
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    meta,
    resourceName: 'Market',
    renderResources,
    renderCreateResource: () => props.history.push(`/admin/${Localisation.passport.market.path}/new`),
    deleteWarningMsg: `All Locations/Events/Content associated to the ${Localisation.passport.market.path} will be lost`,
    children: renderPageChildren()
  }
  return props.renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withPageHelper,
  withIndexHelper,
  withHooks(props => {
    const marketsReduxResource = nameSpaced('passport', useReduxResource('passport-market', 'passport/markets'))
    const isMarketsLoading = marketsReduxResource.queryState.isLoading
    const [deleteError, setDeleteError] = useState(null)

    const getMarkets = () => {
      marketsReduxResource.findAll({
        fields: {
          'passport-markets': 'name,start-date,end-date,travel-end-date,active',
        }
      })
    }
    useEffect(getMarkets, [])

    useEffect(() => {
      props.pageIsLoading([isMarketsLoading])
    }, [isMarketsLoading])

    useWatchForTruthy(marketsReduxResource.mutationState.succeeded, () => {
      props.modalState.hideModal()
    })

    useWatchForTruthy(marketsReduxResource.mutationState.errored, () => {
      setDeleteError(marketsReduxResource.mutationState.errors)
    })

    const marketDuplicateResource = nameSpaced('passport', useResource('passport-market-duplicate'))
    const duplicateMarket = (market) => {
      marketDuplicateResource.createResource({
        market: {
          'id': market.id
        }
      })
    }

    useWatchForTruthy(marketDuplicateResource.mutationState.succeeded, () => {
      getMarkets()
    })

    return {
      ...props,
      duplicateMarket,
      deleteError,
      deleteResource: marketsReduxResource.deleteResource,
      markets: marketsReduxResource.getReduxResources()
    }
  })
)

export default enhance(PassportMarketsIndex)
