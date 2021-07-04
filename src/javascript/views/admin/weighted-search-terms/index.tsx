import React, { useEffect, useState } from 'react'

import compose from 'javascript/utils/compose'

// Components
import InputForm from 'javascript/views/admin/weighted-search-terms/form'
import Tooltip from 'javascript/components/tooltip'

// Hooks
import useResource from 'javascript/utils/hooks/use-resource'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import { withRouter } from 'react-router-dom'
import withModalRenderer from 'javascript/components/hoc/with-modal-renderer'
import withIndexHelper from 'javascript/components/hoc/with-index-helper'

const WeightedSearchTermsIndex = (props) => {
  const { theme } = props
  const meta = {
    title: `${theme.localisation.client} :: Weighted Search Terms`,
    meta: {
      description: `Edit and Create Weighted Search Terms`
    }
  }

  const weightedSearchTermsResource = useResource('weighted-word')
  const [pageNumber, setPageNumber] = useState(1)
  const [searchQuery, setSearchQuery] = useState(null)
  const [sort, setSort] = useState(null)
  const [timer, setTimer] = useState(null)

  const getWeightedSearchTerms = () => {
    const request = {
      include: 'programme',
      fields: {
        'weighted-words': 'name,weight,programme',
        'programme': 'title-with-genre'
      },
      'page[number]': pageNumber,
      'page[size]': 20,
    }
    if(searchQuery && searchQuery.length > 0) {
      request['filter[name]'] = searchQuery
    } else {
      delete request['filter[name]']
    }
    if(sort) {
      request['sort'] = sort
    } else {
      delete request['sort']
    }
    clearTimeout(timer)
    setTimer(setTimeout(() => {
      weightedSearchTermsResource.findAll(request)
    }, 500))
  }

  useEffect(() => {
    getWeightedSearchTerms()
  }, [pageNumber])

  useEffect(() => {
    setPageNumber(1)
    getWeightedSearchTerms()
  }, [searchQuery, sort])

  useWatchForTruthy(weightedSearchTermsResource.mutationState.succeeded, () => {
    getWeightedSearchTerms()
    props.modalState.hideModal()
  })

  const resources = weightedSearchTermsResource.getDataAsArray()

  const renderResourceFields = (resource) => (
    <>
      <td>{ resource?.weight }</td>
      <td>{ resource?.programme?.['title-with-genre'] }</td>
    </>
  )

  const renderTableHeadings = () => (
    <>
      <th>
        Weight
        {/*@ts-ignore */}
        <Tooltip
          direction='bottom'
          content={`A positive weight value will increase the likelihood of the ${theme.localisation.programme.lower} appearing for the search term. <br /><br />A negative weight value will decrease the likelihood of the ${theme.localisation.programme.lower} appearing for the search term`}
        >
          <span className="icon-button icon-button--small">?</span>
        </Tooltip>
      </th>
      <th colSpan={2}>Programme</th>
    </>
  )

  const withPaginator = {
    pageNumber,
    totalPages: resources?.meta['page-count'],
    updatePageNumber: setPageNumber
  }

  const updateResource = (resource) => {
    const update = {...resource}
    weightedSearchTermsResource.updateResource(update)
  }

  const withSearch = {
    currentQuery: searchQuery,
    updateSearchQuery: setSearchQuery,
    placeholder: 'Search by term'
  }

  const defaultSort = {
    label: 'Latest created',
    value: '-id'
  }

  const withSort = {
    options: [defaultSort, {
      label: 'Oldest created',
      value: 'id'
    }, {
      label: 'A > Z',
      value: 'name'
    }, {
      label: 'Z > A',
      value: '-name'
    }],
    currentSort: sort || defaultSort,
    updateSort: setSort
  }

  const indexHelperProps = {
    // Overload any IndexHelper functions/forms in this props object
    ...props,
    createResource: weightedSearchTermsResource.createResource,
    deleteResource: weightedSearchTermsResource.deleteResource,
    tableHeadingName: 'Term',
    meta,
    // renderDeleteResource,
    resourceName: 'Weighted Search Term',
    resources,
    InputForm,
    updateResource,
    withPaginator,
    renderResourceFields,
    renderTableHeadings,
    withSearch,
    withSort
  }
  return props.renderPageIndex(indexHelperProps)
}

const enhance = compose(
  withRouter,
  withModalRenderer,
  withIndexHelper,
)

export default enhance(WeightedSearchTermsIndex)
