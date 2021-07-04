import React, { useState, useEffect } from 'react'

import compose from 'javascript/utils/compose'
import allClientVariables from './variables'
// Components
import Select from 'javascript/components/select'
// Hooks
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useResource from 'javascript/utils/hooks/use-resource'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withTheme from 'javascript/utils/theme/withTheme'
// Types
import { CustomAttributeTypeType } from 'javascript/types/ModelTypes'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

import DateRangeFilters from 'javascript/containers/filters/filter-types/date-range-filter'

interface CustomFilters {
  [key: string]: string[]
}

interface Props {
  allLoaded?: boolean
  customAttributeCV: any
  customFilters: CustomFilters,
  handleCustomAttributes: (type: any, value: any) => void,
  setSelectIsOpen: (state: boolean) => void,
  types: CustomAttributeTypeType[],
  theme: CustomThemeType
}

const CustomAttributeFilters = ({
  allLoaded = true,
  customAttributeCV,
  customFilters,
  handleCustomAttributes,
  setSelectIsOpen,
  types,
  theme,
} : Props) => {

  if (!types.length) return null

  const { prefix } = usePrefix()

  if (allLoaded) {
    return types.map((t, i) => {
      if (t['attribute-type'] === 'Date') {
        return (
          <DateRangeFilters
            key={t.id}
            label={t.name}
            filterName={`filter[${t.name}]`}
            updateQuery={(filter, value) => handleCustomAttributes(t, [ {value} ])}
            currentValue={customFilters?.[t.id]?.[0]}
            dateFormat={'YYYY-MM-DD'}
          />
        )
      }
      let sortedOptions = t['possible-values']
      sortedOptions = t['attribute-type'] === 'Integer' ? t['possible-values'].sort((a, b) => { return a - b }) : t['possible-values'].sort((a, b) => { return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }) })
      let options = sortedOptions.map(v => ({ value: encodeURIComponent(v), label: v }))
      if (t['attribute-type'] === 'Boolean') {
        options = [{
          value: 'true',
          label: customAttributeCV.booleanLabelTrue(theme, t)
        }, {
          value: 'false',
          label: customAttributeCV.booleanLabelFalse(theme, t)
        }]
      }
      return (
        <div className={`${prefix}programme-filters__column`} key={t.id}>
          <label className={`${prefix}programme-filters__label`}>{t.name}</label>
          <Select onOpen={() => setSelectIsOpen(true)}
            onClose={() => setSelectIsOpen(false)}
            value={customFilters[t.id]}
            options={options}
            onChange={(v) => handleCustomAttributes(t, v)}
            multi={true}
            clearable={false} />
        </div>
      )
    })
  }
  return null
}

const populateCustomAttributeTypeValues = (types, meta) => {
  const updateTypes = types
    .filter(t => t.config.filterable)
    .map((type) => {
      const updateType = {...type}
      updateType['possible-values'] = meta.types.find(t => (t['id'] == type.id))['values']
      return updateType
    })
    .sort((a,b) => a.position - b.position)
  return updateTypes
}

const enhance = compose(
  withTheme,
  withHooks(props => {

    const [types, setTypes] = useState([])
    const [customFilters, setCustomFilters] = useState({})

    const customAttributeCV = useClientVariables(allClientVariables)

    const customAttributeResource = useResource('custom-attribute-type')

    useEffect(() => {
      customAttributeResource.findAll({
        filter: {
          related_type: 'Programme',
          id: props.meta['custom-attributes']['types'].map((t) => {
            return t['id']
          }).join(',')
        },
        fields: {
          'custom-attribute-types': 'name,config,custom-attributes,attribute-type,position'
        },
        page: {
          size: 'all'
        }
      })
      .then((responseTypes) => {
        setTypes(populateCustomAttributeTypeValues(responseTypes, props.meta['custom-attributes']))
        props.onFinishedLoading()
      })
    }, [])

    useEffect(() => {
      if (types.length && props.customFilters) {
        const values = props.customFilters.split('|>')
        const customAttributeFilters = values.reduce((acc, item) => {
          const parts = customAttributeCV.filterSeparator(item)
          const key = parts[0]
          const value = parts[1]
          if (!acc[key]) acc[key] = []
          acc[key].push(value)
          return acc
        }, {})

        let customFilters = types.reduce((acc, c) => {
          acc[c.id] = []
          return acc
        }, {})

        setCustomFilters({...customFilters, ...customAttributeFilters})
      }

    }, [props.customFilters, types])

    useEffect(() => {
      const values = Object.keys(customFilters).map(k => {
        return customFilters[k].map(a => `${k}:${a}`)
      })
      const formatted = [].concat.apply([], values).join('|>')
      props.updateQuery('filter[custom_attribute_id_and_value]', formatted)
    }, [customFilters])


    const handleCustomAttributes = (type, value) => {
      setCustomFilters((prevCustomFilters) => ({
        ...prevCustomFilters,
        [type.id]: value.length > 0 ? value.map(v => v.value) : []
      }))
    }

    return {
      ...props,
      customAttributeCV,
      customFilters,
      handleCustomAttributes,
      types,
    }
  })
)

export default enhance(CustomAttributeFilters)
