/** http://0.0.0.0:8080/admin/users - Actions - Permissions */
import React, { useState } from 'react'

// Components
import LimitedAccessForm from 'javascript/views/admin/users/limited-access/form'

import {
  createOneByModel,
  deleteOneByModel,
  query,
} from 'javascript/utils/apiMethods'
import useApiQueue from 'javascript/utils/hooks/use-api-queue'
import usePermissionsListLogic from 'javascript/components/permissions/usePermissionsListLogic'

// Types
import {
  LimitedAccessProgrammeUserType,
  UserType,
} from 'javascript/types/ModelTypes'

interface Props {
  resource: UserType,
}

const UsersLimitedAccess: React.FC<Props> = ({ resource: user }) => {
  return (
    <LimitedAccessForm {...useFormLogic({ userId: user.id })} />
  )
}

const useFormLogic = ({ userId }) => {
  const [hasErrored, setHasErrored] = useState(false)

  const { addToQueue, status } = useApiQueue({
    onError: () => setHasErrored(true),
  })

  const programmes = usePermissionsListLogic({
    query: () =>
      query<'limited-access-programme-users', LimitedAccessProgrammeUserType[]>(
        `users/${userId}/limited-access-programme-users`,
        'limited-access-programme-users',
        {
          include: ['limited-access-programme'],
          fields: ['limited-access-programme'],
          includeFields: {
            programmes: ['title', 'title-with-genre', 'restricted'],
          },
        },
      ),
    onToggle: (
      item: LimitedAccessProgrammeUserType & { checked: boolean },
      changeIdOfItem,
    ) => {
      const shouldCreate = item.checked
      if (shouldCreate) {
        addToQueue(() =>
          createOneByModel('limited-access-programme-user', {
            'limited-access-user': {
              id: userId,
            },
            'limited-access-programme': {
              id: item['limited-access-programme'].id,
            },
          }).then(newItem => {
            changeIdOfItem(item, newItem)
          }),
        )
      } else {
        addToQueue(() => deleteOneByModel('limited-access-programme-user', item.id))
      }
    },
  })

  return {
    programmes,
    hasErrored,
    apiQueueStatus: status,
  }
}

export default UsersLimitedAccess