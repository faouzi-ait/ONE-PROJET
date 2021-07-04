import React, {useState, useEffect} from 'react'
import Select from 'react-select'

import { getApi } from 'javascript/utils/api'
import withWaitForLoadingDiv, { WithWaitForLoadingDivType } from 'javascript/components/hoc/with-wait-for-loading-div'


const api = getApi()

interface Props extends WithWaitForLoadingDivType{
  name: string
  onChange: (e: any) => void
  priorityCountryCodes: string
  value: string
}

const CountrySelect: React.FC<Props> = ({
  name,
  onChange,
  priorityCountryCodes,
  value,
  waitForLoading,
}) => {

  const [options, setOptions] = useState([])

  const getCountryNames = (codes) => {
    waitForLoading.waitFor('fetchingCountryNames')
    api.axios(`${api.apiUrl}/countries${codes ? `?priority=${codes}` : ''}`, {
      method: 'GET',
      headers: {
        ...api.headers,
        'Accept': 'application/json',
      }
    }).then(({ data }) => {
      const countryNames = (data['priority_countries'] || []).concat(data['countries_with_codes'] || [])
      setOptions((countryNames).map((country) => ({
        value: country[1],
        label: country[0]
      })))
      waitForLoading.finished('fetchingCountryNames')
    })
  }

  useEffect(() => {
    getCountryNames(priorityCountryCodes)
  }, [])

  return (
    <Select
      options={options}
      value={value}
      onChange={(value) => {
        onChange({
          target: {
            value,
            name
          }
        })
      }}
      aria-label={'country-code'}
      simpleValue={true}
      clearable={true}
      searchable={true}
    />
  )
}

export default withWaitForLoadingDiv(CountrySelect)