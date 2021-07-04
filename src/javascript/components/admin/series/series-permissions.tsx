import React from 'react'
//Types
import {
  RestrictedSeriesCompanyType,
  RestrictedSeriesGroupType,
  RestrictedSeriesUserType,
  SeriesType,
} from 'javascript/types/ModelTypes'
//State
import {
  createOneByModel,
  deleteOneByModel,
  query,
  updateOneByModel,
} from 'javascript/utils/apiMethods'
//Components
import ResourcePermissions from 'javascript/components/permissions/resource-permissions'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import withTheme from 'javascript/utils/theme/withTheme'

interface Props {
  resource: SeriesType
  theme: CustomThemeType
}

const SeriesPermissions: React.FC<Props> = ({
  resource: series,
  theme
}) => {
  return (
    <ResourcePermissions
      resource={series}
      updateRestrictionOnResource={newSeries =>
        updateOneByModel('series', newSeries)
      }
      typeName={theme.localisation.series.lower}
      getRestrictedCompanies={() =>
        query<'restricted-series-companies', RestrictedSeriesCompanyType[]>(
          `series/${series.id}/restricted-series-companies`,
          'restricted-series-companies',
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
        query<'restricted-series-groups', RestrictedSeriesGroupType[]>(
          `series/${series.id}/restricted-series-groups`,
          'restricted-series-groups',
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
        query<'restricted-series-users', RestrictedSeriesUserType[]>(
          `series/${series.id}/restricted-series-users`,
          'restricted-series-users',
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
        createOneByModel('restricted-series-company', {
          'restricted-series': {
            id: series.id,
          },
          'restricted-company': {
            id: companyId,
          },
        })
      }
      createRestrictedGroup={groupId =>
        createOneByModel('restricted-series-group', {
          'restricted-series': {
            id: series.id,
          },
          'restricted-group': {
            id: groupId,
          },
        })
      }
      createRestrictedUser={userId =>
        createOneByModel('restricted-series-user', {
          'restricted-series': {
            id: series.id,
          },
          'restricted-user': {
            id: userId,
          },
        })
      }
      deleteRestrictedCompany={company =>
        deleteOneByModel('restricted-series-company', company.id)
      }
      deleteRestrictedGroup={group =>
        deleteOneByModel('restricted-series-group', group.id)
      }
      deleteRestrictedUser={user =>
        deleteOneByModel('restricted-series-user', user.id)
      }
    ></ResourcePermissions>
  )
}

export default withTheme(SeriesPermissions)
