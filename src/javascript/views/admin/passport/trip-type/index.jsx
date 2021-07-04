import { useEffect } from 'react'

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

const PassportTripTypesIndex = (props) => {
  const { localisation: Localisation } = useTheme()
  const meta = {
    title: `${Localisation.client} :: ${Localisation.passport.tripType.upper}`,
    meta: {
      description: `Edit and Create ${Localisation.passport.tripType.upper}`
    }
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    meta,
    resourceName: Localisation.passport.tripType.upper,
  }
  return props.renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withPageHelper,
  withIndexHelper,
  withHooks(props => {
    const tripTypesReduxResource = nameSpaced('passport', useReduxResource('passport-trip-type', 'passport/tripTypes'))
    const isTripTypesLoading = tripTypesReduxResource.queryState.isLoading

    useEffect(() => {
      tripTypesReduxResource.findAll({
        fields: {
          'trip-types': 'name',
        }
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([isTripTypesLoading])
    }, [isTripTypesLoading])

    useWatchForTruthy(tripTypesReduxResource.mutationState.succeeded, () => {
      props.modalState.hideModal()
    })

    return {
      ...props,
      deleteResource: tripTypesReduxResource.deleteResource,
      createResource: tripTypesReduxResource.createResource,
      updateResource: tripTypesReduxResource.updateResource,
      resources: tripTypesReduxResource.getReduxResources()
    }
  })
)

export default enhance(PassportTripTypesIndex)
