import { LanguageType } from 'javascript/types/ModelTypes'
import { findAllByModel } from 'javascript/utils/apiMethods'
import React from 'react'
import useSWR from 'swr'
import Select from '../select'

export const LanguageMultiSelect: React.FC<{
  value: LanguageType[]
  onChange: (languages: LanguageType[]) => void
}> = ({ value, onChange }) => {
  const { data = [] } = useSWR('languages', () =>
    findAllByModel('languages', {
      fields: ['id', 'name'],
    }),
  )

  return (
    <Select
      options={data}
      value={value.map(({ id }) => id)}
      multi
      onChange={onChange}
      placeholder="Languages"
      labelKey="name"
      valueKey="id"
    ></Select>
  )
}
