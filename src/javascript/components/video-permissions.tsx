import React from 'react'
import ResourcePermissions from 'javascript/components/permissions/resource-permissions'
import withTheme from 'javascript/utils/theme/withTheme'

import {
  createOneByModel,
  deleteOneByModel,
  query,
  updateOneByModel,
} from 'javascript/utils/apiMethods'
// Types
import {
  RestrictedVideoCompanyType,
  RestrictedVideoGroupType,
  RestrictedVideoUserType,
  VideoType,
} from 'javascript/types/ModelTypes'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  resource: VideoType
  theme: CustomThemeType
}

const VideoPermissions: React.FC<Props> = ({
  resource: video,
  theme,
}) => {
  return (
    <ResourcePermissions
      resource={video}
      updateRestrictionOnResource={newVideo => {
        const videoUpdate = {
          ...newVideo,
        }
        if (newVideo.restricted && video['public-video']) {
          videoUpdate['public-video'] = false
        }
        return updateOneByModel('video', videoUpdate)
      }}
      typeName={theme.localisation.video.lower}
      getRestrictedCompanies={() =>
        query<'restricted-video-companies', RestrictedVideoCompanyType[]>(
          `videos/${video.id}/restricted-video-companies`,
          'restricted-video-companies',
          {
            fields: ['restricted-company', 'expires-after'],
            include: ['restricted-company'],
            includeFields: {
              companies: ['name'],
            },
          },
        )
      }
      getRestrictedGroups={() =>
        query<'restricted-video-groups', RestrictedVideoGroupType[]>(
          `videos/${video.id}/restricted-video-groups`,
          'restricted-video-groups',
          {
            fields: ['restricted-group', 'expires-after'],
            include: ['restricted-group'],
            includeFields: {
              groups: ['name'],
            },
          },
        )
      }
      getRestrictedUsers={() =>
        query<'restricted-video-users', RestrictedVideoUserType[]>(
          `videos/${video.id}/restricted-video-users`,
          'restricted-video-users',
          {
            fields: ['restricted-user', 'expires-after'],
            include: ['restricted-user', 'restricted-user.company'],
            includeFields: {
              users: ['first-name', 'last-name', 'company-name', 'company'],
              companies: ['name'],
            },
          },
        )
      }
      createRestrictedCompany={companyId =>
        createOneByModel('restricted-video-company', {
          'restricted-video': {
            id: video.id,
          },
          'restricted-company': {
            id: companyId,
          },
        })
      }
      createRestrictedGroup={groupId =>
        createOneByModel('restricted-video-group', {
          'restricted-video': {
            id: video.id,
          },
          'restricted-group': {
            id: groupId,
          },
        })
      }
      createRestrictedUser={userId =>
        createOneByModel('restricted-video-user', {
          'restricted-video': {
            id: video.id,
          },
          'restricted-user': {
            id: userId,
          },
        })
      }
      deleteRestrictedCompany={company =>
        deleteOneByModel('restricted-video-company', company.id)
      }
      deleteRestrictedGroup={group =>
        deleteOneByModel('restricted-video-group', group.id)
      }
      deleteRestrictedUser={user =>
        deleteOneByModel('restricted-video-user', user.id)
      }
    ></ResourcePermissions>
  )
}

export default withTheme(VideoPermissions)
