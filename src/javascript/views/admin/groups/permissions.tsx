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
  RestrictedAssetMaterialGroupType,
  RestrictedProgrammeGroupType,
  RestrictedSeriesGroupType,
  RestrictedVideoGroupType,
  GroupType,
} from 'javascript/types/ModelTypes'


interface Props {
  resource: GroupType,
}

const GroupPermissionsForm: React.FC<Props> = ({ resource: group}) => {
  return (
    <PermissionsForm {...useFormLogic({ groupId: group.id })} />
  )
}

const useFormLogic = ({ groupId }) => {
  const [hasErrored, setHasErrored] = useState(false)

  const { addToQueue, status } = useApiQueue({
    onError: () => setHasErrored(true),
  })

  const programmes = usePermissionsListLogic({
    query: () =>
      query<'restricted-programme-groups', RestrictedProgrammeGroupType[]>(
        `groups/${groupId}/restricted-programme-groups`,
        'restricted-programme-groups',
        {
          include: ['restricted-programme'],
          fields: ['restricted-programme', 'expires-after'],
          includeFields: {
            programmes: ['title', 'title-with-genre', 'restricted'],
          },
        },
      ),
    onToggle: (
      item: RestrictedProgrammeGroupType & { checked: boolean },
      changeIdOfItem,
    ) => {
      const shouldCreate = item.checked
      if (shouldCreate) {
        addToQueue(() =>
          createOneByModel('restricted-programme-group', {
            'restricted-group': {
              id: groupId,
            },
            'restricted-programme': {
              id: item['restricted-programme'].id,
            },
          }).then(newItem => {
            changeIdOfItem(item, newItem)
          }),
        )
      } else {
        addToQueue(() => deleteOneByModel('restricted-programme-group', item.id))
      }
    },
  })

  const series = usePermissionsListLogic({
    query: () =>
      query<'restricted-series-groups', RestrictedSeriesGroupType[]>(
        `groups/${groupId}/restricted-series-groups`,
        'restricted-series-groups',
        {
          // @ts-ignore
          include: ['restricted-series', 'restricted-series.programme'],
          fields: ['restricted-series', 'expires-after'],
          includeFields: {
            series: ['name', 'programme', 'programme-title-with-genre', 'restricted'],
            // @ts-ignore
            programmes: ['title'],
          },
        },
      ),
    onToggle: (
      item: RestrictedSeriesGroupType & { checked: boolean },
      changeIdOfItem,
    ) => {
      const shouldCreate = item.checked
      if (shouldCreate) {
        addToQueue(() =>
          createOneByModel('restricted-series-group', {
            'restricted-group': {
              id: groupId,
            },
            'restricted-series': {
              id: item['restricted-series'].id,
            },
          }).then(newItem => {
            changeIdOfItem(item, newItem)
          }),
        )
      } else {
        addToQueue(() => deleteOneByModel('restricted-series-group', item.id))
      }
    },
  })
  const videos = usePermissionsListLogic({
    query: () =>
      query<'restricted-video-groups', RestrictedVideoGroupType[]>(
        `groups/${groupId}/restricted-video-groups`,
        'restricted-video-groups',
        {
          include: ['restricted-video'],
          fields: ['restricted-video', 'expires-after'],
          includeFields: {
            videos: ['name', 'series-name', 'episode-name', 'programme-name', 'programme-title-with-genre', 'restricted'],
          },
        },
      ),
    onToggle: (
      item: RestrictedVideoGroupType & { checked: boolean },
      changeIdOfItem,
    ) => {
      const shouldCreate = item.checked
      if (shouldCreate) {
        addToQueue(() =>
          createOneByModel('restricted-video-group', {
            'restricted-group': {
              id: groupId,
            },
            'restricted-video': {
              id: item['restricted-video'].id,
            },
          }).then(newItem => {
            changeIdOfItem(item, newItem)
          }),
        )
      } else {
        addToQueue(() => deleteOneByModel('restricted-video-group', item.id))
      }
    },
  })
  const assets = usePermissionsListLogic({
    query: () =>
      query<
        'restricted-asset-material-groups',
        RestrictedAssetMaterialGroupType[]
      >(
        `groups/${groupId}/restricted-asset-material-groups`,
        'restricted-asset-material-groups',
        {
          include: ['restricted-asset-material'],
          fields: ['restricted-asset-material', 'expires-after'],
          includeFields: {
            'asset-materials': ['name', 'programme-name', 'series-name'],
          },
        },
      ),
    onToggle: (
      item: RestrictedAssetMaterialGroupType & { checked: boolean },
      changeIdOfItem,
    ) => {
      const shouldCreate = item.checked
      if (shouldCreate) {
        addToQueue(() =>
          createOneByModel('restricted-asset-material-group', {
            'restricted-group': {
              id: groupId,
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
          deleteOneByModel('restricted-asset-material-group', item.id),
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

export default GroupPermissionsForm