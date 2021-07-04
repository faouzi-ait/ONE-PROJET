/*
* @props:
*     onLoadStatusChange: <function>
*         returns: <boolean>, loading of initial production company info (intialState: loading=true, completed: loading=false)
*     onProducerSelected: <function>
*         returns: <object>, selected production company data
*
*/

import React, {useEffect, useState} from 'react'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'

import compose from 'javascript/utils/compose'

// Hooks
import useResource from 'javascript/utils/hooks/use-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'

//Components
import ReportSearch from 'javascript/components/reporting/search'


const ProductionCompaniesSearch = (props) => {

  const {
    producerSearchResults,
    query,
    searchForProducer,
    selectedProducer,
    setQuery,
    updateSelectedProducer,
    theme
  } = props

  return (
    <div style={{ minHeight: selectedProducer ? '0' : '250px' }}>
      <ReportSearch
        modifiers={['reporting']}
        onChange={(e, { newValue }) => {
          if (newValue === '') {
            updateSelectedProducer(null)
          }
          setQuery(newValue)
        }}
        onSearch={searchForProducer}
        onReset={() => setQuery('')}
        onClear={() => updateSelectedProducer(null)}
        suggestions={producerSearchResults}
        onSelect={(item) => updateSelectedProducer(item.suggestion)}
        value={selectedProducer && !query ? selectedProducer.label : query}
        placeholder={`Search for a ${theme.localisation.productionCompany.lower}...`}
      />
    </div>
  )
}

const enhance = compose(
  withTheme,
  withRouter,
  withHooks(props => {
    const [selectedProducer, setSelectedProducer] = useState(null)
    const [params, setParams] = useState(queryString.parse(props.location.search))
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [searchTimer, setSearchTimer] = useState(0)
    const [producerSearchResults, setProducerSearchResults] = useState([])

    const productionCompaniesSearchResource = useResource('production-companies')

    useEffect(() => {
      if (props.onLoadStatusChange) {
        props.onLoadStatusChange(loading)
      }
    }, [loading])

    useEffect(() => {
      if (props.onProducerSelected) {
        props.onProducerSelected(selectedProducer)
      }
    }, [selectedProducer])

    useEffect(() => {
      fetchProductionCompanies()
    }, [])

    const fetchProductionCompanies = () => {
      if (!selectedProducer && params && params.pc) {
        productionCompaniesSearchResource.findOne(params.pc, {
          fields: { 'production-companies': 'name' },
          page: { size: 200}
        })
        .then((productionCompany) => {
          setSelectedProducer({
            ...productionCompany,
            label: productionCompany.name,
            value: productionCompany.id
          })
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    }

    const searchForProducer = (input) => {
      clearTimeout(searchTimer)
      setSearchTimer(setTimeout(() => {
        productionCompaniesSearchResource.findAll({
          fields: { 'production-companies': 'name' },
          page: { size: 200},
          filter: { search: input.value, 'for-producer-hub': true }
        })
        .then((response) => {
          setProducerSearchResults(response.map(productionCompany => ({
            ...productionCompany,
            label: productionCompany.name,
            value: productionCompany.id
          })))
        })
      }, 300))
    }

    const updateSelectedProducer = (value) => {
      setSelectedProducer(value ? value :  null)
      let url = props.location.pathname
      const updateParams = {...params}
      if (value) {
        updateParams.pc = value.id
      } else {
        delete updateParams.pc
        setParams(updateParams)
      }
      url += `?${queryString.stringify(updateParams)}`
      props.history.push(url)
    }

    return {
      ...props,
      producerSearchResults,
      query,
      searchForProducer,
      selectedProducer,
      setQuery,
      updateSelectedProducer,
    }
  })
)

export default enhance(ProductionCompaniesSearch)