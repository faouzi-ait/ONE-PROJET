import React, { useState } from 'react'
import styled from 'styled-components'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

import useResource from 'javascript/utils/hooks/use-resource'

import { applyValidFilters } from 'javascript/containers/filters/filter-tools'

interface Props {
  onCompletion: (err?: any) => void
  selectedUsers: string[]
}

const AddToGroupForm: React.FC<Props> = ({
  onCompletion,
  selectedUsers
}) => {
  const groupsResource = useResource('group')
  const bulkUserGroupsResource = useResource('bulk-user-group')
  const [loading, setLoading] = useState(false)
  const [newGroupView, setNewGroupView] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState([])
  const [searchTimer, setSearchTimer] = useState(null)

  const submitButtonClasses = ['button', 'button--filled', loading && 'button--loading'].filter(Boolean).join(' ')

  const getGroups = (searchQuery = '') => {
    const query = {
      fields: {
        'groups': 'name',
      },
    }
    return groupsResource.findAll(applyValidFilters(query, { 'filter[search]': searchQuery}))
  }

  const createNewGroup = (name) => {
    groupsResource.createResource({
      type: 'group',
      name
    })
    .then((response) => {
      setNewGroupView(false)
    })
  }

  const handleBulkAssignment = () => {
    setLoading(true)
    const bulkResource = {
      users: selectedUsers.map((userId) => ({ id: userId })),
      groups: selectedGroups
    }
    bulkUserGroupsResource.createResource(bulkResource)
    .then(() => onCompletion())
    .catch(onCompletion)
  }

  if (newGroupView) {
    return (
      <AddNewGroupForm createNewGroup={createNewGroup} cancelNewGroup={() => setNewGroupView(false)} />
    )
  }

  return (
    <ModalContent>
      <Select.Async
        value={selectedGroups}
        multi={true}
        onChange={setSelectedGroups}
        loadOptions={(search = '', loadOptions) => {
          clearTimeout(searchTimer)
          if (!search.length) return loadOptions()
          setSearchTimer(setTimeout(() => {
            getGroups(search).then((response) => loadOptions(null, { options: response }))
          }, 300))
        }}
        autoload={false}
        valueKey={'id'}
        labelKey={'name'}
        placeholder="Search Groups..."
      />
      <CenteredContent>
        <div style={{padding: '40px 0px'}}>
          <Button disabled={selectedGroups.length === 0} className={submitButtonClasses} onClick={handleBulkAssignment}>Add Users to Group</Button>
        </div>
        <div>
          <Label>Need a new Group?</Label>
          <Button className="button button--small" onClick={() => setNewGroupView(true)}>Create Group</Button>
        </div>
      </CenteredContent>
    </ModalContent>
  )
}


export default AddToGroupForm

const ModalContent = styled.div`
  min-height: 220px;
`

const CenteredContent = styled.div`
  margin: auto auto;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center
`

const Label = styled.span`
  margin-right: 15px;
`


interface NewGroupProps {
  createNewGroup: (groupName: string) => void
  cancelNewGroup: () => void
}

const AddNewGroupForm: React.FC<NewGroupProps> = ({
  createNewGroup,
  cancelNewGroup
}) => {
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(false)
  const buttonClasses = ['button', 'button--filled', loading && 'button--loading'].filter(Boolean).join(' ')
  return (
    <>
      <h2>New Group</h2>
      <form className="cms-form" onSubmit={(e) => {
        e.preventDefault()
        setLoading(true)
        createNewGroup(groupName)
      }}>
        <FormControl type="text" name="name" label="Name" value={ groupName } required onChange={({target}) => setGroupName(target.value) } />
        <div className="cms-form__control cms-form__control--actions">
          <Button type="button" className="button" onClick={cancelNewGroup}>Cancel</Button>
          <Button type="submit" className={ buttonClasses }>Create Group</Button>
        </div>
      </form>
    </>
  )
}
