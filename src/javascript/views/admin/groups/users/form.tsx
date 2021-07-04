import React, { useState, useEffect } from 'react'

import useResource from 'javascript/utils/hooks/use-resource'

// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

// Types
import { UserType } from 'javascript/types/ModelTypes'

interface Props {
  groupId: string | number
  onClose: () => any
  onSave: (user: UserType) => any
}

const GroupUserForm = ({
  groupId,
  onClose,
  onSave,
} : Props) => {

  const [userIdsInGroup, setUserIdsInGroup] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTimer, setSearchTimer] = useState(null)
  const userResource = useResource('user')
  const buttonClasses = ['button', 'filled', isLoading && 'loading'].join(' button--')

  if (!groupId) return null

  useEffect(() => {
    userResource.findAll({
      fields: {
        'users': 'id',
      },
      'filter[groups]': groupId,
      'filter[choices-for]': 'group-users'
    })
    .then((response) => {
      setUserIdsInGroup(response.reduce((idCache, user) => {
        idCache[user.id] = user.id
        return idCache
      }, {}))
    })
  }, [])

  const searchUsers = (searchValue, loadOptions) => {
    clearTimeout(searchTimer)
    if (!searchValue.length) return loadOptions()
    const createUserOptions = (response = []) => {
      const options = response
        .filter(user => !userIdsInGroup[user.id])
        .map(user => {
          const companySuffix = user?.company ? ` - ${user?.company?.name}` : ''
          return ({
            ...user,
            label: `${user['first-name']} ${user['last-name']}${companySuffix}`,
            value: user.id
          })
        })
      loadOptions(null, { options })
    }
    setSearchTimer(setTimeout(() => {
      userResource.findAll({
        include: 'groups,company',
        fields: {
          'users': 'first-name,last-name,groups,company',
        },
        'filter[search-all]': searchValue,
      })
      .then(createUserOptions)
    }, 300))
  }

  const handleSubmit = () => {
    setIsLoading(true)
    const groups = selectedUser.groups
    groups.push({id: groupId})
    userResource.updateResource({
      ...selectedUser,
      groups
    })
    .then((response) => {
      onSave(response)
      onClose()
    })
  }

  return (
    <form className="cms-form" style={{minHeight: '250px'}}>
      <div style={{padding: '20px 0px 20px 0px'}}>
        <FormControl label="User" required>
          <Select.Async
            onChange={setSelectedUser}
            clearable={true}
            autoload={false}
            backspaceRemoves={true}
            loadOptions={searchUsers}
            value={selectedUser}
            placeholder={`Search for user`}
          />
        </FormControl>
      </div>
      <div className="cms-form__control cms-form__control--actions">
        <Button type="button" onClick={onClose} className="button">Cancel</Button>
        {selectedUser && (
          <Button type="button" onClick={handleSubmit} className={buttonClasses}>Add</Button>
        )}
      </div>
    </form>
  )
}

export default GroupUserForm

