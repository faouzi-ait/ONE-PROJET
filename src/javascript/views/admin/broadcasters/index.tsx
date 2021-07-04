
import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'

import { RouteComponentProps, withRouter } from 'react-router-dom'
import { WithThemeType } from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import withIndexHelper, { WithIndexHelperType } from 'javascript/components/hoc/with-index-helper'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

interface Props extends RouteComponentProps, WithPageHelperType, WithThemeType, WithIndexHelperType {}

const BroadcastersIndex: React.FC<Props> = (props) => {
  const {
    modalState,
    pageIsLoading,
    renderPageIndex,
    theme: { localisation },
  } = props

  const meta = {
    title: `${localisation.client} :: ${localisation.broadcaster.upper}`,
    meta: {
      description: `Edit and create ${pluralize(localisation.broadcaster.lower)}`
    }
  }
  const broadcasterResource = useResource('broadcaster')
  const [pageNumber, setPageNumber] = useState(1)

  const getBroadcasters = () => {
    broadcasterResource.findAll({
      fields: {
        'broadcasters': 'name'
      },
      'page[number]': pageNumber,
      'page[size]': 50,
      sort: 'name'
    }).then(() => {
      pageIsLoading(false)
    })
  }

  useEffect(() => {
    getBroadcasters()
  }, [pageNumber])

  useWatchForTruthy(broadcasterResource.mutationState.succeeded, () => {
    getBroadcasters()
    modalState.hideModal()
  })

  const resources = broadcasterResource.getDataAsArray()

  const withPaginator = {
    pageNumber,
    totalPages: resources?.meta['page-count'],
    updatePageNumber: setPageNumber
  }


  const indexHelperProps = {
    ...props,
    createResource: broadcasterResource.createResource,
    meta,
    resourceName: localisation.broadcaster.upper,
    resources,
    updateResource: broadcasterResource.updateResource,
    deleteResource: broadcasterResource.deleteResource,
    withPaginator,
  }
  return renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withRouter,
  withPageHelper,
  withIndexHelper,
)

export default enhance(BroadcastersIndex)
