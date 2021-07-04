import React from 'react'
import ResourcePermissions from 'javascript/components/permissions/resource-permissions'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import {
  ProgrammeType,
  RestrictedProgrammeCompanyType,
  RestrictedProgrammeGroupType,
  RestrictedProgrammeUserType,
} from 'javascript/types/ModelTypes'
import {
  createOneByModel,
  deleteOneByModel,
  query,
  updateOneByModel,
} from 'javascript/utils/apiMethods'
import withTheme from 'javascript/utils/theme/withTheme'

const ProgrammePermissions: React.FC<{ resource: ProgrammeType, theme: CustomThemeType }> = ({
  resource: programme,
  theme
}) => {
  return (
    <ResourcePermissions
      resource={programme}
      updateRestrictionOnResource={ (newProgramme) =>
        updateOneByModel('programme', newProgramme)
      }
      typeName={theme.localisation.programme.lower}
      getRestrictedCompanies={() =>
        query<
          'restricted-programme-companies',
          RestrictedProgrammeCompanyType[]
        >(
          `programmes/${programme.id}/restricted-programme-companies`,
          'restricted-programme-companies',
          {
            fields: ['restricted-company', 'expires-after'],
            include: ['restricted-company'],
            includeFields: {
              companies: ['name'],
            },
            page: {
              size: 100
            },
          },
        )
      }
      getRestrictedGroups={() =>
        query<
          'restricted-programme-groups',
          RestrictedProgrammeGroupType[]
        >(
          `programmes/${programme.id}/restricted-programme-groups`,
          'restricted-programme-groups',
          {
            fields: ['restricted-group', 'expires-after'],
            include: ['restricted-group'],
            includeFields: {
              groups: ['name'],
            },
            page: {
              size: 100
            },
          },
        )
      }
      getRestrictedUsers={() =>
        query<'restricted-programme-users', RestrictedProgrammeUserType[]>(
          `programmes/${programme.id}/restricted-programme-users`,
          'restricted-programme-users',
          {
            fields: ['restricted-user', 'expires-after'],
            include: ['restricted-user', 'restricted-user.company'],
            includeFields: {
              users: ['first-name', 'last-name', 'company-name', 'company'],
              companies: ['name'],
            },
            page: {
              size: 100
            },
          },
        )
      }
      createRestrictedCompany={companyId =>
        createOneByModel('restricted-programme-company', {
          'restricted-programme': {
            id: programme.id,
          },
          'restricted-company': {
            id: companyId,
          },
        })
      }
      createRestrictedGroup={groupId =>
        createOneByModel('restricted-programme-group', {
          'restricted-programme': {
            id: programme.id,
          },
          'restricted-group': {
            id: groupId,
          },
        })
      }
      createRestrictedUser={userId =>
        createOneByModel('restricted-programme-user', {
          'restricted-programme': {
            id: programme.id,
          },
          'restricted-user': {
            id: userId,
          },
        })
      }

      deleteRestrictedCompany={company =>
        deleteOneByModel('restricted-programme-company', company.id)
      }
      deleteRestrictedGroup={group =>
        deleteOneByModel('restricted-programme-group', group.id)
      }
      deleteRestrictedUser={user =>
        deleteOneByModel('restricted-programme-user', user.id)
      }
    ></ResourcePermissions>
  )
}

export default withTheme(ProgrammePermissions)
