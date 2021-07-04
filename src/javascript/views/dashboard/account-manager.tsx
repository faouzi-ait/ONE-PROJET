import React, { useEffect, useState } from 'react'

import 'stylesheets/core/components/dashboard/account-manager'

//@ts-ignore
import defaultImage from 'images/temp/blank_person.svg'
import useResource from 'javascript/utils/hooks/use-resource'
import { UserType } from 'javascript/types/ModelTypes'
import withUser from 'javascript/components/hoc/with-user'
import compose from 'javascript/utils/compose'

interface Props {
  user: UserType
}

const AccountManager: React.FC<Props> = ({ user }) => {

  const userResource = useResource('user')
  const [accountManager, setAccountManager] = useState(null)

  useEffect(() => {
    if (user['account-manager']?.id) {
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
  if (!accountManager) return <div></div>
  let image = defaultImage
  if (accountManager['image'] && accountManager['image'].admin_preview.url) {
    image = accountManager['image'].admin_preview.url.replace('.net/', '.net/320x320/')
  }
  return (
    <section className="section section--shade">
      <div className="container">
        <div className="account-manager account-manager__image-section">
        <img className="account-manager__image" src={image} alt="" />
        </div>
        <div className="account-manager account-manager__text-section">
          <h3 className="account-manager__title">{accountManager['first-name']} {accountManager['last-name']} </h3>
          <div className="account-manager__text">
            <p>{accountManager['job-title']}</p>
            <p>{accountManager['telephone-number']}</p>
            <p>{accountManager['email']}</p>
            <p>{accountManager['territories'].map(territory => territory['name']).join(', ')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

const enhance = compose(
  withUser
)

export default enhance(AccountManager)