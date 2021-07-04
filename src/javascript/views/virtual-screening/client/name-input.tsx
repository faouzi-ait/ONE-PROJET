import React, { useEffect, useState } from 'react'

import { UserAliasType } from 'javascript/views/virtual-screening/use-sockets'
import CreatableSelect from 'react-select-v3/creatable'
import FormControl from 'javascript/components/form-control'

interface Props {
  onSubmit: (userAlias: UserAliasType) => void
  labels: string[]
}

const NameInputForm: React.FC<Props> = ({
  labels,
  onSubmit,
}) => {

  const [availableCompanies, setAvailableCompanies] = useState([])
  useEffect(() => {
    const companies = labels.filter((company) => company !== 'Guests')
    setAvailableCompanies(companies.map((company) => ({
      label: company,
      value: company
    })))
  }, [])

  const [name, setName] = useState('')
  const [company, setCompany] = useState(null)
  const [companyRequiredMsg, setCompanyRequiredMsg] = useState<string>('')
  const buttonClasses = ['button', 'filled'].join(' button--')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (company) {
      onSubmit({
        name,
        label: company.label
      })
    } else {
      setCompanyRequiredMsg('Please select a company')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="virtual__name-input" >
      <FormControl type="text" label="Name" name="name" value={ name } required onChange={({target}) => setName(target.value) } />
      <FormControl label="Company" error={companyRequiredMsg} required >
        <div className="form__inner">
          <CreatableSelect
            required
            className="SelectV3"
            classNamePrefix="Select"
            isClearable
            isMulti={false}
            value={company}
            placeholder={availableCompanies.length ? 'Select or create...' : ''}
            noOptionsMessage={() => 'Type to create'}
            onChange={(value) => {
              setCompany(value)
              if (value) {
                setCompanyRequiredMsg('')
                if(!availableCompanies.find((c) => c.label === value.label)) {
                  setAvailableCompanies([
                    ...availableCompanies,
                    value
                  ])
                }
              }
            }}
            options={availableCompanies}
          />
        </div>
      </FormControl>
      <div className="form__control form__control--actions">
        <button type="submit" className={ buttonClasses }>Save</button>
      </div>
    </form>
  )
}

export default NameInputForm
