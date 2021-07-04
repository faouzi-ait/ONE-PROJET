import React, { useState } from 'react'
import styled from 'styled-components'

import { findAllByModel } from 'javascript/utils/apiMethods'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import compose from 'javascript/utils/compose'
import useApiQueue from 'javascript/utils/hooks/use-api-queue'
import useAutosuggestLogic from 'javascript/utils/hooks/use-autosuggest-logic'
import usePermissionsListLogic from 'javascript/components/permissions/usePermissionsListLogic'
import usePreloadQuery from 'javascript/components/permissions/usePreloadQuery'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'
import withTheme from 'javascript/utils/theme/withTheme'
import withUser from 'javascript/components/hoc/with-user'

// Components
import ActivityIndicator from 'javascript/components/activity-indicator'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import Div from 'javascript/components/div'
import Form from 'javascript/components/form'
import P from 'javascript/components/paragraph'
import PermissionsTab from 'javascript/components/permissions/permissions-tab'
import Tabs from 'javascript/components/tabs'

// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import {
  AssetMaterialType,
  ProgrammeType,
  RestrictedAssetMaterialCompanyType,
  RestrictedAssetMaterialGroupType,
  RestrictedAssetMaterialUserType,
  RestrictedProgrammeCompanyType,
  RestrictedProgrammeGroupType,
  RestrictedProgrammeUserType,
  RestrictedSeriesCompanyType,
  RestrictedSeriesGroupType,
  RestrictedSeriesUserType,
  RestrictedVideoCompanyType,
  RestrictedVideoGroupType,
  RestrictedVideoUserType,
  SeriesType,
  UserType,
  VideoType,
} from 'javascript/types/ModelTypes'

interface DisplayProps {
  typeName: string
  theme: CustomThemeType
  user: UserType
}

const choicesForFiltersMap = {
  programmes: 'programme-restricted-users',
  series: 'series-restricted-users',
  videos: 'video-restricted-users',
}

const ResourcePermissions: React.FC<UseLogicParams & DisplayProps> = ({
  resource,
  createRestrictedCompany,
  createRestrictedGroup,
  createRestrictedUser,
  deleteRestrictedCompany,
  deleteRestrictedGroup,
  deleteRestrictedUser,
  getRestrictedCompanies,
  getRestrictedGroups,
  getRestrictedUsers,
  theme,
  typeName,
  updateRestrictionOnResource,
  user,
}) => {

  const hasGroups = !!(theme.features.groups.enabled && (isAdmin(user) || hasPermission(user, ['manage_groups'])))

  const usersAutosuggestProps = useAutosuggestLogic({
    query: value =>
      findAllByModel('users', {
        filter: {
          search: value,
          ...(choicesForFiltersMap[resource.type] && {
            'choices-for': choicesForFiltersMap[resource.type],
          }),
        },
        page: {
          size: 5,
        },
        fields: ['first-name', 'last-name', 'company-name', 'company'],
        include: ['company'],
        includeFields: {
          companies: ['name'],
        },
      }).then(res => res.map(user => ({ ...user, ['restricted-user']: user }))),
  })

  const companiesAutosuggestProps = useAutosuggestLogic({
    query: value =>
      findAllByModel('companies', {
        filter: {
          search: value,
        },
        page: {
          size: 5,
        },
        fields: ['name'],
      }).then(res =>
        res.map(company => ({ ...company, ['restricted-company']: company })),
      ),
  })

  const groupsAutosuggestProps = !hasGroups ? null : useAutosuggestLogic({
    query: value =>
      findAllByModel('groups', {
        filter: {
          search: value,
        },
        page: {
          size: 5,
        },
        fields: ['name'],
      }).then(res =>
        res.map(group => ({ ...group, ['restricted-group']: group })),
      ),
  })

  const {
    users,
    updateRestriction,
    cachedResource,
    companies,
    groups,
    apiQueueStatus,
  } = useLogic({
    resource,
    createRestrictedCompany,
    createRestrictedGroup,
    createRestrictedUser,
    deleteRestrictedCompany,
    deleteRestrictedGroup,
    deleteRestrictedUser,
    getRestrictedCompanies,
    getRestrictedGroups: hasGroups ? getRestrictedGroups : () => Promise.resolve([]),
    getRestrictedUsers,
    updateRestrictionOnResource,
  })

  return (
    <Form className="form">
      <Div className="form__control" classesToPrefix={['form']}>
        <CustomCheckbox
          label={
            cachedResource.restricted
              ? `Unrestrict ${typeName}`
              : `Restrict ${typeName}`
          }
          id="restriction"
          checked={cachedResource.restricted}
          onChange={updateRestriction}
        />
      </Div>
      <P className="" style={{ fontSize: '14px', opacity: 0.8 }}>
        {`Checking this box will restrict the ${typeName}. If checked, you will have to ensure a user has the correct permission assigned in order to view it`}
      </P>
      { typeName === theme.localisation.video.lower &&
        !cachedResource.restricted &&
        cachedResource['public-video'] && (
        <P className="form__error" style={{ textAlign: 'center' }} classesToPrefix={['form']}>
          {`Warning: making this ${typeName} restricted will make it no longer public.`}
        </P>
      )}
      {cachedResource.restricted && (
        <div className="permissions-list">
          <Tabs>
            <TabWrapper title={'Users'}>
              <PermissionsTab
                addToList={users.addToList}
                fetchSuggestions={usersAutosuggestProps.fetchSuggestions}
                value={users.value}
                suggestions={usersAutosuggestProps.suggestions}
                onClear={usersAutosuggestProps.onClear}
                titleExtractor={(item: RestrictedUserType) =>
                  `${item['restricted-user']['first-name']} ${item[
                    'restricted-user'
                  ]['last-name'] || ''} ${
                    (item['restricted-user'].company || {}).name
                      ? `- ${(item['restricted-user'].company || {}).name}`
                      : ''
                  }`
                }
                keyExtractor={(item: RestrictedUserType) =>
                  item['restricted-user'].id
                }
                toggleItem={users.toggleItem}
                placeholder={'Search for a user'}
              />
            </TabWrapper>
            <TabWrapper title={'Companies'}>
              <PermissionsTab
                addToList={companies.addToList}
                fetchSuggestions={companiesAutosuggestProps.fetchSuggestions}
                value={companies.value}
                suggestions={companiesAutosuggestProps.suggestions}
                onClear={companiesAutosuggestProps.onClear}
                toggleItem={companies.toggleItem}
                placeholder={'Search for a company'}
                titleExtractor={(item: RestrictedCompanyType) =>
                  item['restricted-company'].name
                }
                keyExtractor={(item: RestrictedCompanyType) =>
                  item['restricted-company'].id
                }
              />
            </TabWrapper>
            { hasGroups && (
              <TabWrapper title={'Groups'}>
                <PermissionsTab
                  addToList={groups.addToList}
                  fetchSuggestions={groupsAutosuggestProps.fetchSuggestions}
                  value={groups.value}
                  suggestions={groupsAutosuggestProps.suggestions}
                  onClear={groupsAutosuggestProps.onClear}
                  toggleItem={groups.toggleItem}
                  placeholder={'Search for a group'}
                  titleExtractor={(item: RestrictedGroupType) =>
                    item['restricted-group'].name
                  }
                  keyExtractor={(item: RestrictedGroupType) =>
                    item['restricted-group'].id
                  }
                />
              </TabWrapper>
            )}
          </Tabs>
        </div>
      )}
      <ActivityWrapper>
        <ActivityIndicator
          status={apiQueueStatus}
          successLabel={'Permissions saved'}
        />
      </ActivityWrapper>
    </Form>
  )
}

export const TabWrapper = styled.div`
  padding-bottom: 20px;
  min-height: 200px;
`

export const ActivityWrapper = styled.div`
  justify-content: flex-end;
  margin-top: 5px;
  display: flex;
`

const enhance = compose(
  withTheme,
  withUser
)

export default enhance(ResourcePermissions)

type Resource = ProgrammeType | SeriesType | VideoType | AssetMaterialType

type RestrictedUserType =
  | RestrictedProgrammeUserType
  | RestrictedSeriesUserType
  | RestrictedVideoUserType
  | RestrictedAssetMaterialUserType

type RestrictedCompanyType =
  | RestrictedProgrammeCompanyType
  | RestrictedSeriesCompanyType
  | RestrictedVideoCompanyType
  | RestrictedAssetMaterialCompanyType

type RestrictedGroupType =
  | RestrictedProgrammeGroupType
  | RestrictedSeriesGroupType
  | RestrictedVideoGroupType
  | RestrictedAssetMaterialGroupType

interface UseLogicParams {
  resource: Resource
  createRestrictedCompany: (companyId: number) => Promise<RestrictedCompanyType>
  createRestrictedGroup: (groupId: number) => Promise<RestrictedGroupType>
  createRestrictedUser: (userId: number) => Promise<RestrictedUserType>
  deleteRestrictedCompany: (restrictedCompany: RestrictedCompanyType,) => Promise<any>
  deleteRestrictedGroup: (restrictedGroup: RestrictedGroupType,) => Promise<any>
  deleteRestrictedUser: (restrictedUser: RestrictedUserType) => Promise<any>
  getRestrictedCompanies: () => Promise<RestrictedCompanyType[]>
  getRestrictedGroups: () => Promise<RestrictedGroupType[]>
  getRestrictedUsers: () => Promise<RestrictedUserType[]>
  updateRestrictionOnResource: (
    newResourceAttributes: Pick<
      Resource,
      'id' | 'restricted-companies' | 'restricted-users' | 'restricted-groups' | 'restricted'
    >,
  ) => Promise<any>
}

const useLogic = ({
  resource: initialResource,
  createRestrictedCompany,
  createRestrictedGroup,
  createRestrictedUser,
  deleteRestrictedCompany,
  deleteRestrictedGroup,
  deleteRestrictedUser,
  getRestrictedCompanies,
  getRestrictedGroups,
  getRestrictedUsers,
  updateRestrictionOnResource,
}: UseLogicParams) => {
  const [cachedResource, setCachedResource] = useState(initialResource)

  const { addToQueue, status: apiQueueStatus } = useApiQueue()

  const [data, initialQueryStatus] = usePreloadQuery<{
    'restricted-users': RestrictedUserType[]
    'restricted-companies': RestrictedCompanyType[]
    'restricted-groups': RestrictedGroupType[]
  }>({
    query: async () => {
      const [restrictedUsers, restrictedCompanies, restrictedGroups] = await Promise.all([
        getRestrictedUsers(),
        getRestrictedCompanies(),
        getRestrictedGroups(),
      ])
      return {
        'restricted-users': restrictedUsers,
        'restricted-companies': restrictedCompanies,
        'restricted-groups': restrictedGroups,
      }
    },
  })

  const users = usePermissionsListLogic({
    onToggle: (
      itemToChange: RestrictedUserType & { checked: boolean },
      changeIdOfItem,
    ) =>
      addToQueue(() => {
        if (itemToChange.checked) {
          return createRestrictedUser(
            itemToChange['restricted-user'].id,
          ).then(newItem => {
            changeIdOfItem(itemToChange, newItem)
          })
        }
        return deleteRestrictedUser(itemToChange)
      }),
  })
  const companies = usePermissionsListLogic({
    onToggle: (
      itemToChange: RestrictedCompanyType & { checked: boolean },
      changeIdOfItem,
    ) =>
      addToQueue(() => {
        if (itemToChange.checked) {
          return createRestrictedCompany(
            itemToChange['restricted-company'].id,
          ).then(newItem => changeIdOfItem(itemToChange, newItem))
        }
        return deleteRestrictedCompany(itemToChange)
      }),
  })
  const groups = usePermissionsListLogic({
    onToggle: (
      itemToChange: RestrictedGroupType & { checked: boolean },
      changeIdOfItem,
    ) =>
      addToQueue(() => {
        if (itemToChange.checked) {
          return createRestrictedGroup(
            itemToChange['restricted-group'].id,
          ).then(newItem => changeIdOfItem(itemToChange, newItem))
        }
        return deleteRestrictedGroup(itemToChange)
      }),
  })

  useWatchForTruthy(initialQueryStatus === 'fulfilled', () => {
    users.onChange(
      (data['restricted-users'] || []).map(user => ({
        ...user,
        checked: true,
      })),
    )
    companies.onChange(
      (data['restricted-companies'] || []).map(company => ({
        ...company,
        checked: true,
      })),
    )
    groups.onChange(
      (data['restricted-groups'] || []).map(group => ({
        ...group,
        checked: true,
      })),
    )
  })

  return {
    users,
    companies,
    groups,
    initialQueryStatus,
    apiQueueStatus,
    updateRestriction: () => {
      const noLongerRestricted = !cachedResource.restricted
      setCachedResource({
        ...cachedResource,
        restricted: noLongerRestricted,
      })
      addToQueue(() =>
        updateRestrictionOnResource({
          id: cachedResource.id,
          restricted: noLongerRestricted,
        } as any)
      )
    },
    cachedResource,
  }
}
