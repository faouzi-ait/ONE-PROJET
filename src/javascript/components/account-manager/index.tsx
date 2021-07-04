import React, { useEffect, useState } from 'react'

import 'stylesheets/core/components/account-manager'

//@ts-ignore
import defaultImage from 'images/temp/blank_person.svg'
import useResource from 'javascript/utils/hooks/use-resource'
import { UserType } from 'javascript/types/ModelTypes'
import withUser from 'javascript/components/hoc/with-user'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import allClientVariables from './variables'

interface Props {
  user: UserType
  adminMode?: boolean
  clientVariables: any
}

const AccountManager: React.FC<Props> = ({ user, adminMode, clientVariables }) => {

  const userResource = useResource('user')
  const [accountManager, setAccountManager] = useState(null)

  useEffect(() => {
    if (!adminMode && user['account-manager']?.id) {
      userResource.findOne(user['account-manager'].id, {
        include: 'territories',
        fields: {
          users: 'first-name,last-name,job-title,telephone-number,email,territories,image',
          territories: 'name'
        },
      })
      .then((response) => {
        setAccountManager(response)
      })

    }
  }, [user])

  if (adminMode && !accountManager) {
    setAccountManager({
      'image': false,
      'first-name': 'Account',
      'last-name': 'Manager',
      'job-title': 'Job Title',
      'telephone-number': 'Telephone',
      'email': 'Email',
      'territories': []
    })
  }

  if (!accountManager) return <div></div>

  let image = defaultImage
  if (accountManager['image'] && accountManager['image'].admin_preview.url) {
    image = accountManager['image'].admin_preview.url.replace('.net/', '.net/320x320/')
  }

  return (
    <>
      <div className="account-manager account-manager__image-section">
      <img className="account-manager__image" src={image} alt="" />
      </div>
      <div className="account-manager account-manager__text-section">
        <h3 className="account-manager__title">{accountManager['first-name']} {accountManager['last-name']} </h3>
        <div className="account-manager__text">
          <p>{accountManager['job-title']}</p>
          <p>{accountManager['telephone-number']}</p>
          <p>{accountManager['email']}</p>
          {clientVariables.showTerritories &&
            <p>{accountManager['territories'].map(territory => territory['name']).join(', ')}</p>
          }
        </div>
      </div>
    </>
  )
}

const enhance = compose(
  withUser,
  withClientVariables('clientVariables', allClientVariables)
)

export default enhance(AccountManager)