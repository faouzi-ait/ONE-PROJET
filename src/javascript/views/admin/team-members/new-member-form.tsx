import React, { useState } from 'react'

import Select from 'react-select'
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import useResource from 'javascript/utils/hooks/use-resource'

import { TeamDepartmentType, TeamMemberType, TeamRegionType } from 'javascript/types/ModelTypes'

interface Props {
  onSubmitted?: () => void
  resource?: TeamMemberType | null,
  departments: TeamDepartmentType[],
  regions: TeamRegionType[]
}

const IndexHelperInputForm: React.FC<Props> = ({
  onSubmitted = () => {},
  resource,
  departments,
  regions
}) => {
  const formAction = resource ? 'updateResource' : 'createResource'
  const teamMembersResource = useResource('team-member')
  
  const [isLoading, setIsLoading] = useState(false)
  const [apiErrors, setApiErrors] = useState(null)
  const [member, setMember] = useState(resource ? {...resource} : {})
  const [selectedDepartment, setSelectedDepartment] = useState(resource?.['team-department'] ? { label: resource['team-department'].name, value: resource['team-department'].id} : {})
  const [selectedRegion, setSelectedRegion] = useState(resource?.['team-region'] ? { label: resource['team-region'].name, value: resource['team-region'].id} : {})
  
  const buttonClasses = ['button', 'filled', isLoading && 'loading'].join(' button--')
  
  const saveMember = (e) => {
    e.preventDefault()
    setIsLoading(true)
    const update = {...member}
    update['team-department'] = selectedDepartment ? departments.filter(r => r.id === selectedDepartment.value)[0] : null
    update['team-region'] = selectedRegion ? regions.filter(r => r.id === selectedRegion.value)[0] : null
    teamMembersResource[formAction](update)
    .then((response) => {
      onSubmitted()
    })
    .catch((errors) => {
      setApiErrors(errors)
      setIsLoading(false)
    })
  }

  const handleInputChange = (e) => {
    const update = Object.assign({}, member)
    update[e.target.name] = e.target.value
    setMember(update)
  }

  const mapResourceToSelect = (resources) => {
    return resources.map(resource => ({
      label: resource.name,
      value: resource.id
    }))
  }

  const renderFormErrors = () => {
    if (apiErrors) {
      return (
        <ul className="cms-form__errors">
          { Object.keys(apiErrors).map((key, i) => {
            const error = apiErrors[key]
            return (
              <li key={ i }>{ key.charAt(0).toUpperCase() + key.slice(1) } { error }</li>
            )
          }) }
        </ul>
      )
    }
  }

  return (
    <form className="cms-form" onSubmit={saveMember} >
      <FormControl type="text" label="First Name" name="first-name" value={member['first-name']} onChange={handleInputChange} />
      <FormControl type="text" label="Last Name" name="last-name" value={member['last-name']} onChange={handleInputChange} />
      <FormControl type="text" label="Email Address" name="email" value={member['email']} onChange={handleInputChange} />
      <FormControl type="text" label="Job Title" name="job-title" value={member['job-title']} onChange={handleInputChange} />
      <FormControl type="text" label="Telephone Number" name="phone" value={member['phone']} onChange={handleInputChange} />
      <FormControl type="textarea" label="Bio" name="bio" value={member['bio']} onChange={handleInputChange} />
      <div className="cms-form__control">
        <label className="cms-form__label">Department</label>
        <Select 
          options={mapResourceToSelect(departments)}
          clearable={ false }
          required={ true }
          value={selectedDepartment} onChange={setSelectedDepartment} />
      </div>
      <div className="cms-form__control">
        <label className="cms-form__label">Region</label>
        <Select 
          options={mapResourceToSelect(regions)} 
          clearable={ false } 
          value={selectedRegion} 
          onChange={setSelectedRegion} />
      </div>

      {renderFormErrors()}
      <div className="cms-form__control cms-form__control--actions">
        <Button type="submit" className={ buttonClasses }>Save Team Member</Button>
      </div>
    </form>
  )
}

export default IndexHelperInputForm
