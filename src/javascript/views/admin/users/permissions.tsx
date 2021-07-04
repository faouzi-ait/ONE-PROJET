/** http://0.0.0.0:8080/admin/users - Actions - Permissions */
import React, { useState } from 'react'

import {
  createOneByModel,
  deleteOneByModel,
  query,
} from 'javascript/utils/apiMethods'
import useApiQueue from 'javascript/utils/hooks/use-api-queue'
import usePermissionsListLogic from 'javascript/components/permissions/usePermissionsListLogic'

// Components
import PermissionsForm from 'javascript/components/permissions/permissions-form'

// Types
import {
  RestrictedAssetMaterialUserType,
  RestrictedProgrammeUserType,
  RestrictedSeriesUserType,
  RestrictedVideoUserType,
  UserType,
} from 'javascript/types/ModelTypes'

interface Props {
  resource: UserType,
}

const UserPermissionsForm: React.FC<Props> = ({ resource: user }) => {
  return (
    <PermissionsForm {...useFormLogic({ userId: user.id })} />
  )
}

const useFormLogic = ({ userId }) => {
  const [hasErrored, setHasErrored] = useState(false)

  const { addToQueue, status } = useApiQueue({
    onError: () => setHasErrored(true),
  })

  const programmes = usePermissionsListLogic({
    query: () =>
      query<'restricted-programme-users', RestrictedProgrammeUserType[]>(
        `users/${userId}/restricted-programme-users`,
        'restricted-programme-users',
        {
          include: ['restricted-programme'],
          fields: ['restricted-programme', 'expires-after'],
          includeFields: {
            programmes: ['title', 'title-with-genre', 'restricted'],
          },
          page: {
            size: 100
          },
        },
      ),
    onToggle: (
      item: RestrictedProgrammeUserType & { checked: boolean },
      changeIdOfItem,
    ) => {
      const shouldCreate = item.checked
      if (shouldCreate) {
        addToQueue(() =>
          createOneByModel('restricted-programme-user', {
            'restricted-user': {
              id: userId,
            },
            'restricted-programme': {
              id: item['restricted-programme'].id,
            },
          }).then(newItem => {
            changeIdOfItem(item, newItem)
          }),
        )
      } else {
        addToQueue(() => deleteOneByModel('restricted-programme-user', item.id))
      }
    },
  })

  const series = usePermissionsListLogic({
    query: () =>
      query<'restricted-series-users', RestrictedSeriesUserType[]>(
        `users/${userId}/restricted-series-users`,
        'restricted-series-users',
        {
          // @ts-ignore
          include: ['restricted-series', 'restricted-series.programme'],
          fields: ['restricted-series', 'expires-after'],
          includeFields: {
            series: ['name', 'programme', 'programme-title-with-genre', 'restricted'],
            // @ts-ignore
            programmes: ['title'],
          },
          page: {
            size: 100
          },
        },
      ),
    onToggle: (
      item: RestrictedSeriesUserType & { checked: boolean },
      changeIdOfItem,
    ) => {
      const shouldCreate = item.checked
      if (shouldCreate) {
        addToQueue(() =>
          createOneByModel('restricted-series-user', {
            'restricted-user': {
              id: userId,
            },
            'restricted-series': {
              id: item['restricted-series'].id,
            },
          }).then(newItem => {
            changeIdOfItem(item, newItem)
          }),
        )
      } else {
        addToQueue(() => deleteOneByModel('restricted-series-user', item.id))
      }
    },
  })
  const videos = usePermissionsListLogic({
    query: () =>
      query<'restricted-video-users', RestrictedVideoUserType[]>(
        `users/${userId}/restricted-video-users`,
        'restricted-video-users',
        {
          include: ['restricted-video'],
          fields: ['restricted-video', 'expires-after'],
          includeFields: {
            videos: ['name', 'series-name', 'episode-name', 'programme-name', 'programme-title-with-genre', 'restricted'],
          },
          page: {
            size: 100
          },
        },
      ),
    onToggle: (
      item: RestrictedVideoUserType & { checked: boolean },
      changeIdOfItem,
    ) => {
      const shouldCreate = item.checked
      if (shouldCreate) {
        addToQueue(() =>
          createOneByModel('restricted-video-user', {
            'restricted-user': {
              id: userId,
            },
            'restricted-video': {
              id: item['restricted-video'].id,
            },
          }).then(newItem => {
            changeIdOfItem(item, newItem)
          }),
        )
      } else {
        addToQueue(() => deleteOneByModel('restricted-video-user', item.id))
      }
    },
  })
  const assets = usePermissionsListLogic({
    query: () =>
      query<'restricted-asset-material-users', RestrictedAssetMaterialUserType[]>(
        `users/${userId}/restricted-asset-material-users`,
        'restricted-asset-material-users',
        {
          include: ['restricted-asset-material'],
          fields: ['restricted-asset-material', 'expires-after'],
          includeFields: {
            'asset-materials': ['name', 'programme-name', 'series-name'],
          },
          page: {
            size: 100
          },
        },
      ),
    onToggle: (
      item: RestrictedAssetMaterialUserType & { checked: boolean },
      changeIdOfItem,
    ) => {
      const shouldCreate = item.checked
      if (shouldCreate) {
        addToQueue(() =>
          createOneByModel('restricted-asset-material-user', {
            'restricted-user': {
              id: userId,
            },
            'restricted-asset-material': {
              id: item['restricted-asset-material'].id,
            },
          }).then(newItem => {
            changeIdOfItem(item, newItem)
          }),
        )
      } else {
        addToQueue(() =>
          deleteOneByModel('restricted-asset-material-user', item.id),
        )
      }
    },
  })
  return {
    programmes,
    series,
    videos,
    assets,
    hasErrored,
    apiQueueStatus: status,
  }
}

export default UserPermissionsForm