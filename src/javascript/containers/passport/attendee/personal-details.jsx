import React, { useState, useEffect } from 'react'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import FileUploader from 'javascript/components/file-uploader'
import FormControl from 'javascript/components/form-control'
import Select from 'react-select'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import { withRouter } from 'react-router-dom'


const PassportPersonalDetailsForm = (props) => {

  const { updateTrip, personalDetails } = props
  const [searchTimer, setSearchTimer] = useState(null)
  const [selectedUser, setSelectedUser] = useState('')
  const [avatarImage, setAvatarImage] = useState({
    preview: '',
    file: '',
    path: ''
  })

  useEffect(() => {
    if (personalDetails.avatar && typeof personalDetails.avatar === 'object') {
      setAvatarImage({
        ...avatarImage,
        preview: personalDetails.avatar.admin_preview.url,
      })
    }
  }, [personalDetails])

  const handleInputChange = ({ target }) => {
    const update = Object.assign({}, personalDetails)
    update[target.name] = target.value
    updateTrip(update)
  }

  const handleSelectChange = (type, selection) => {
    const update = Object.assign({}, personalDetails)
    if (type === 'title') {
      update[type] = selection.value
    } else {
      update[type].id = selection.value
    }
    updateTrip(update)
  }

  const handleUserSelected = (user) => {
    setSelectedUser(user || '')
    const update = {}
    Object.keys(personalDetails).forEach((key) => {
      if (user) {
        if (user[key]) {
          update[key] = user[key]
        }
      } else {
        update[key] = ''
      }
    })
    update['user'] = {
      'id': user.id
    }
    updateTrip(update)
  }

  const createSelectOptions = (arrayName) => {
    return (props[arrayName] || []).map((item) => ({
      value: item.id,
      label: item.name
    }))
  }

  const createSupportUserOptions = () => {
    return (props.supportUsers || []).map((user) => {
      const option = {
        'value': user.id,
        'label': `${user['title']} ${user['first-name']} ${user['last-name']}`,
      }
      Object.keys(personalDetails['support-user']).forEach((key) => {
        option[key] = user[key]
      })
      return option
    })
  }

  const removeAvatar = () => {
    const update = Object.assign({}, personalDetails)
    update['avatar'] = null
    update['remove-avatar'] = true
    updateTrip(update)
    setAvatarImage({})
  }

  const addAvatar = (targetName, baseStr, file) => {
    const update = Object.assign({}, personalDetails)
    update['avatar'] = baseStr
    update['remove-avatar'] = ''
    updateTrip(update)
    setAvatarImage({
      preview: baseStr,
      file: file,
      path: file.name
    })
  }

  const searchForUser = (search = '', loadOptions) => {
    clearTimeout(searchTimer)
    if (!search.length) return loadOptions()
    const createUserOptions = (response = []) => {
      const options = response.map(person => Object.assign({}, person, {
        label: `${person['first-name']} ${person['last-name']}`,
        value: person.id
      }))
      loadOptions(null, { options })
    }
    setSearchTimer(setTimeout(() => {
      props.searchUserApi(search, createUserOptions)
    }, 300))
  }

  const renderPersonalDetails = () => {

    if (!props.cms && props.afterClosingDate) {
      return (
        <div>
          <table className="itinerary__table">
            <tbody>
              <tr className="itinerary__row">
                <td><strong>First Name</strong></td>
                <td>{personalDetails['first-name']}</td>
              </tr>
              <tr className="itinerary__row">
                <td><strong>Last Name</strong></td>
                <td>{personalDetails['last-name']}</td>
              </tr>
              <tr className="itinerary__row">
                <td><strong>Job Title</strong></td>
                <td>{personalDetails['job-title']}</td>
              </tr>
              <tr className="itinerary__row">
                <td><strong>Telephone</strong></td>
                <td>{personalDetails['telephone-number']}</td>
              </tr>
              <tr className="itinerary__row">
                <td><strong>Email</strong></td>
                <td>{personalDetails['email']}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div>
        <FormControl type='title' label="Title"
          value={personalDetails['title'] || ''}
          onChange={(e) => handleSelectChange('title', e)}
          required={true}
          clearable={true}
        />
        <FormControl type="text" label="First Name" name="first-name" value={personalDetails['first-name']} required onChange={handleInputChange} />
        <FormControl type="text" label="Last Name" name="last-name" value={personalDetails['last-name']} required onChange={handleInputChange} />
        <FormControl type="text" label="Job Title" name="job-title" value={personalDetails['job-title']} onChange={handleInputChange} />
        <FormControl type="tel" label="Telephone" name="telephone-number" value={personalDetails['telephone-number']} required onChange={handleInputChange} />
        <FormControl type="email" label="Email" name="email" value={personalDetails['email']} required onChange={handleInputChange} />
        { !props.cms ? null : (
            <>
              <FormControl label="Support Person" >
                <Select
                  value={personalDetails['support-user'].id}
                  onChange={(value) => handleSelectChange('support-user', value)}
                  clearable={false}
                  options={createSupportUserOptions()}
                />
              </FormControl>
              <FormControl label="User Type" >
                <Select
                  value={personalDetails['trip-type'].id}
                  onChange={(value) => handleSelectChange('trip-type', value)}
                  clearable={false}
                  options={createSelectOptions('tripTypes')}
                />
              </FormControl>
              <FormControl label="Invoice Type" >
                <Select
                  value={personalDetails['trip-invoice-type'].id}
                  onChange={(value) => handleSelectChange('trip-invoice-type', value)}
                  clearable={false}
                  options={createSelectOptions('tripInvoiceTypes')} />
              </FormControl>
            </>
          )
        }
      </div>
    )
  }

  const renderAvatarUpload = () => {
    return (
      <div>
        <FileUploader title={'Avatar'}
          name="avatar"
          fileType={'Image'}
          fileSrc={avatarImage.preview}
          filePath={avatarImage.path}
          onRemoveFile={removeAvatar}
          onChange={addAvatar}
          viewOnly={!props.cms && props.afterClosingDate}
        />
        { props.cms ? null : (
          <p>
            It is compulsory to upload a full colour headshot, JPG or PNG only
            (this is required for security purposes and will not feature on your event pass)
          </p>
        )}
      </div>
    )
  }

  const renderContent = () => {
    const gridClasses = props.cms ? '' : 'grid grid--two'
    return (
      <div className={gridClasses}>
        { renderPersonalDetails() }
        { renderAvatarUpload() }
      </div>
    )
  }

  return (
    <div className="container">
      { props.cms ? (
          <div className="panel">
            <FormControl label="Search Users">
              <Select.Async
                onChange={handleUserSelected}
                clearable={true}
                autoload={false}
                backspaceRemoves={true}
                loadOptions={searchForUser}
                value={selectedUser}
                placeholder={`Search for user`}
              />
            </FormControl>
          </div>
        ) : null
      }
      <h3 style={{ marginTop: '25px'}}>Personal Details</h3>
      <hr style={{ marginBottom: '25px'}} />
      { renderContent() }
    </div>
  )
}

const enhance = compose(
  withRouter,
  withHooks(props => {
    const { marketId } = props.match.params
    const usersReduxResource = useReduxResource('users', 'passport/attendee-users')

    const searchUserApi = (searchQuery = '', callback) => {
      if (searchQuery.length) {
        usersReduxResource.findAll({
          fields: {
            'users': 'title,first-name,last-name,job-title,image,telephone-number,email'
          },
          'sort': 'first-name',
          'filter[search_all]': searchQuery
        })
        .then(callback)
      }
    }
    useEffect(searchUserApi, [])

    const supportUsersReduxResource = useReduxResource('users', 'passport/attendee-supportUsers')
    useEffect(() => {
      supportUsersReduxResource.findAll({
        fields: {
          'users': 'title,first-name,last-name'
        },
        'sort': 'first-name',
        'filter[choices-for]': 'passport-trip-support-user' //manage_passport_trip permission in roles
      })
    }, [])

    const tripInvoiceTypesReduxResource = nameSpaced('passport', useReduxResource('passport-trip-invoice-type', 'passport/attendee-tripInvoiceTypes'))
    useEffect(() => {
      tripInvoiceTypesReduxResource.findAll({
        fields: {
          'trip-invoice-types': 'name',
        }
      })
    }, [])

    const tripTypesReduxResource = nameSpaced('passport', useReduxResource('passport-trip-type', 'passport/attendee-tripTypes'))
    useEffect(() => {
      tripTypesReduxResource.findAll({
        fields: {
          'trip-types': 'name',
        }
      })
    }, [])

    return {
      ...props,
      marketId,
      searchUserApi,
      supportUsers: supportUsersReduxResource.getReduxResources(),
      tripInvoiceTypes: tripInvoiceTypesReduxResource.getReduxResources(),
      tripTypes: tripTypesReduxResource.getReduxResources(),
    }
  })
)

export default enhance(PassportPersonalDetailsForm)
