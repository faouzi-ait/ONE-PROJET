import React, { useEffect, useState } from 'react'

import AsyncSearchProgrammes from 'javascript/components/async-search-programmes'
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'

interface Props {
  currentValue: string,
  clearable?: boolean,
  meta: string[],
  filter: string,
  label?: string,
  updateQuery: (filter: string, value: string) => void,
}

const ProgrammeFilter = ({
  currentValue,
  filter,
  label,
  meta,
  updateQuery,
}: Props) => {

  const { prefix } = usePrefix()
  const theme = useTheme()

  const [selectedProgramme, setSelectedProgramme] = useState(null)
  const programmeResource = useResource('programme')

  useEffect(() => {
    if (selectedProgramme?.id !== currentValue) {
      programmeResource.findOne(currentValue, {
        fields: {
          programmes: 'title-with-genre'
        }
      }).then(setSelectedProgramme)
    }
  }, [currentValue])


  const renderSelect = () => {
    return (
      <AsyncSearchProgrammes
        filter={{
          ...(meta && {'ids': meta.join(',')})
        }}
        value={selectedProgramme}
        onChange={(value) => {
          setSelectedProgramme(value)
          updateQuery(filter, value?.id)
        }}
      />
    )
  }

  return (
    <div className={`${prefix}programme-filters__column ${prefix}programme-filters__column--programme`}>
      <label className={`${prefix}programme-filters__label`}>{label || theme.localisation.programme.upper}</label>
      {renderSelect()}
    </div>
  )
}


export default ProgrammeFilter
