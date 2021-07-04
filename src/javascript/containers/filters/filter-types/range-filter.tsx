import React, { useEffect, useState } from 'react'

import ClientProps from 'javascript/utils/client-switch/components/client-props'
import usePrefix from 'javascript/utils/hooks/use-prefix'

// Components
import RangeSlider from 'javascript/components/range-slider'
import Select from 'javascript/components/select'

interface Props {
  defaultLimits: number[],
  label: string,
  meta: any,
  resourceName: string,
  step?: number,
  sliders: boolean,
  updateQuery: (filter: string, value: string) => void,
  values: string[],
}

const RangeFilters = ({
  defaultLimits,
  label,
  meta,
  resourceName,
  step = 1,
  sliders,
  updateQuery,
  values,
} : Props) => {

  if (meta.min === meta.max) {
    return null
  }

  const [limits, setLimits] = useState([parseInt(meta['min'] || defaultLimits[0]), parseInt(meta['max'] || defaultLimits[1])])
 

  useEffect(() => {
    if (meta && meta.min !== meta.max) {
      setLimits([parseInt(meta['min'] || 0), parseInt(meta['max'] || 0)])
    }
  }, [])

  const { prefix } = usePrefix()

  const updateSelect = (e) => {
    e.resource[e.position] = e.value
    updateQuery(`filter[${resourceName}]`, e.resource.join(','))
  }

  return (
    <ClientProps
      clientProps={{
        hideInput: {
          'default': false,
          'ae': true
        },
      }}
      renderProp={(clientProps) => (
        <div className={`${prefix}programme-filters__column ${prefix}programme-filters__column--${resourceName.replace(/_/g, '-')}`}>
          <label className={`${prefix}programme-filters__label`}>{label}</label>
          {sliders ? (
            <div className="input-range__filters">
              <RangeSlider
                step={step}
                minLimit={limits[0]}
                maxLimit={limits[1]}
                minValue={values[0] ? values[0] : limits[0]}
                maxValue={values[1] ? values[1] : limits[1]}
                onChange={(e) => updateQuery(`filter[${resourceName}]`, `${e.min},${e.max}`)}
                hideInput={clientProps.hideInput}
              />
            </div>
          ) : (
            <div className="grid grid--center" style={{ flexWrap: 'nowrap' }}>
              <div className={`${prefix}programme-filters__split-column`} >
                <Select
                  clearable={false}
                  value={values[0]}
                  onChange={updateSelect}
                  searchable={false}
                  options={
                    [...Array(Math.floor((limits[1] - limits[0]) + 1 / step))].map((s, value) => ({
                      value: ((limits[0] + value) * step).toString(),
                      label: ((limits[0] + value) * step),
                      resourceName,
                      resource: values,
                      position: 0
                    }))
                  }
                />
              </div>
              <span>to</span>
              <div className={`${prefix}programme-filters__split-column`} >
                <Select
                  clearable={false}
                  value={values[1]}
                  onChange={updateSelect}
                  searchable={false}
                  options={
                    [...Array(Math.floor((limits[1] - limits[0]) + 1 / step))].map((s, value) => ({
                      value: ((limits[0] + value) * step).toString(),
                      label: ((limits[0] + value) * step),
                      resourceName,
                      resource: values,
                      position: 1
                    }))
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}
    />
  )
}

export default RangeFilters
