import React, { useEffect } from 'react'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPageHelper from 'javascript/components/hoc/with-page-helper'
import withIndexHelper from 'javascript/components/hoc/with-index-helper'
import useTheme from 'javascript/utils/theme/useTheme'

const PassportTripInvoiceTypeIndex = (props) => {
  const { localisation: Localisation } = useTheme()
  const meta = {
    title: `${Localisation.client} :: ${Localisation.passport.tripInvoiceType.upper}`,
    meta: {
      description: `Edit and Create ${Localisation.passport.tripInvoiceType.upper}`
    }
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    meta,
    resourceName: Localisation.passport.tripInvoiceType.upper,
  }
  return props.renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withPageHelper,
  withIndexHelper,
  withHooks(props => {
    const tripInvoiceTypesReduxResource = nameSpaced('passport', useReduxResource('passport-trip-invoice-type', 'passport/tripInvoiceTypes'))
    const isTripInvoicesLoading = tripInvoiceTypesReduxResource.queryState.isLoading

    useEffect(() => {
      tripInvoiceTypesReduxResource.findAll({
        fields: {
          'trip-invoice-types': 'name',
        }
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([isTripInvoicesLoading])
    }, [isTripInvoicesLoading])

    useWatchForTruthy(tripInvoiceTypesReduxResource.mutationState.succeeded, () => {
      props.modalState.hideModal()
    })

    return {
      ...props,
      deleteResource: tripInvoiceTypesReduxResource.deleteResource,
      createResource: tripInvoiceTypesReduxResource.createResource,
      updateResource: tripInvoiceTypesReduxResource.updateResource,
      resources: tripInvoiceTypesReduxResource.getReduxResources()
    }
  })
)

export default enhance(PassportTripInvoiceTypeIndex)
