import React from 'react'
import pluralize from 'pluralize'
import styled from 'styled-components'

import programmeSearchResultQuery from 'javascript/utils/queries/programme-search-results'
import useAutosuggestLogic from 'javascript/utils/hooks/use-autosuggest-logic'
import withTheme from 'javascript/utils/theme/withTheme'
import { query } from 'javascript/utils/apiMethods'
import compose from 'javascript/utils/compose'

// Components
import ActivityIndicator from 'javascript/components/activity-indicator'
import PermissionsTab from 'javascript/components/permissions/permissions-tab'
import Tabs from 'javascript/components/tabs'
import withUser from 'javascript/components/hoc/with-user'

// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import {
  AssetMaterialSearchResultType,
  ProgrammeSearchResultType,
  ProgrammeType,
  SeriesSearchResultType,
  VideoSearchResultType,
  VideoType,
  RestrictedSeriesUserType,
  RestrictedAssetMaterialUserType,
  UserType
} from 'javascript/types/ModelTypes'
import useEnumApiLogic from 'javascript/utils/hooks/use-enum-api-logic'

import { isAdmin, hasPermission } from 'javascript/services/user-permissions'

interface Props {
  programmes: any
  series: any
  videos: any
  assets: any
  apiQueueStatus: ReturnType<typeof useEnumApiLogic>['state']['status']
  theme: CustomThemeType
  user: UserType
}

const PermissionsForm: React.FC<Props> = ({ theme, programmes, series, videos, assets, apiQueueStatus, user }) => {
  const {
    programmesAutosuggestProps,
    seriesAutosuggestProps,
    videosAutosuggestProps,
    assetsAutosuggestProps,
  } = useFetchLogic()


  return (
    <form>
      <div className="permissions-list">
        <PermissionsWrapper>
          <Tabs>
            {(isAdmin(user) || hasPermission(user, ['manage_programmes'])) &&
              <div title={pluralize(theme.localisation.programme.upper)}>
                <PermissionsTab
                  restrictedExtractor={(item) => item['restricted-programme'].restricted}
                  addToList={programmes.addToList}
                  fetchSuggestions={programmesAutosuggestProps.fetchSuggestions}
                  value={programmes.value}
                  suggestions={programmesAutosuggestProps.suggestions}
                  onClear={programmesAutosuggestProps.onClear}
                  toggleItem={programmes.toggleItem}
                  placeholder={'Search for a ' + theme.localisation.programme.lower}
                  titleExtractor={(item: {
                    'restricted-programme': ProgrammeSearchResultType &
                      ProgrammeType
                  }) =>
                    item['restricted-programme']['title-with-genre'] ||
                    item['restricted-programme'].title
                  }
                  keyExtractor={item => item['restricted-programme'].id}
                />
              </div>
            }
            {(isAdmin(user) || hasPermission(user, ['manage_programmes'])) &&
              <div title={pluralize(theme.localisation.series.upper)}>
                <PermissionsTab
                  restrictedExtractor={(item) => item['restricted-series'].restricted}
                  addToList={series.addToList}
                  fetchSuggestions={seriesAutosuggestProps.fetchSuggestions}
                  value={series.value}
                  suggestions={seriesAutosuggestProps.suggestions}
                  onClear={seriesAutosuggestProps.onClear}
                  toggleItem={series.toggleItem}
                  titleExtractor={(item: RestrictedSeriesUserType) => {
                    return `${item['restricted-series'].name}${
                      (item['restricted-series'] || { programme: undefined }).programme
                        ? ` - ${item['restricted-series']['programme-title-with-genre'] || item['restricted-series'].programme.title}`
                        : ''
                    }`
                  }}
                  keyExtractor={item => item['restricted-series'].id}
                  placeholder={'Search for a ' + theme.localisation.series.lower}
                />
              </div>
            }
            {(isAdmin(user) || hasPermission(user, ['manage_programmes']) || hasPermission(user, ['manage_videos'])) &&
              <div title={'Videos'}>
                <PermissionsTab
                  restrictedExtractor={(item) => item['restricted-video'].restricted}
                  addToList={videos.addToList}
                  fetchSuggestions={videosAutosuggestProps.fetchSuggestions}
                  value={videos.value}
                  suggestions={videosAutosuggestProps.suggestions}
                  onClear={videosAutosuggestProps.onClear}
                  toggleItem={videos.toggleItem}
                  titleExtractor={(item: { 'restricted-video': VideoType }) => {
                    return [
                      item['restricted-video'].name,
                      item['restricted-video']['programme-title-with-genre'] || item['restricted-video']['programme-name'],
                      item['restricted-video']['series-name'],
                      item['restricted-video']['episode-name'],
                    ].filter(Boolean).join(' - ')
                  }}
                  keyExtractor={item => item['restricted-video'].id}
                  placeholder={'Search for a ' + theme.localisation.video.lower}
                />
              </div>
            }
            {(isAdmin(user) || hasPermission(user, ['manage_asset_permissions'])) &&
              <div title="Assets">
                <PermissionsTab
                  restrictedExtractor={(item) => true}
                  addToList={assets.addToList}
                  fetchSuggestions={assetsAutosuggestProps.fetchSuggestions}
                  value={assets.value}
                  suggestions={assetsAutosuggestProps.suggestions}
                  onClear={assetsAutosuggestProps.onClear}
                  toggleItem={assets.toggleItem}
                  titleExtractor={(item: RestrictedAssetMaterialUserType) =>
                    [
                      item['restricted-asset-material'].name,
                      item['restricted-asset-material']['series-name'],
                      item['restricted-asset-material']['programme-name'],
                    ]
                      .filter(Boolean)
                      .join(' - ')
                  }
                  keyExtractor={item => item['restricted-asset-material'].id}
                  placeholder={'Search for an asset'}
                />
              </div>
            }
          </Tabs>
        </PermissionsWrapper>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ActivityIndicator
          status={apiQueueStatus}
          successLabel={'Permissions saved'}
        />
      </div>
    </form>
  )
}

const PermissionsWrapper = styled.div`
  min-width: 600px;
  padding-bottom: 60px;
  min-height: 260px;
`

const useFetchLogic = () => {
  const programmesAutosuggestProps = useAutosuggestLogic({
    query: (
      keywords,
    ): Promise<{ 'restricted-programme': { id: string } }[]> => {
      if (keywords) {
        return query<'programme-search-results', ProgrammeSearchResultType[]>(
          `programmes/search`,
          'programme-search-results',
          {
            ...programmeSearchResultQuery,
            page: {
              size: 10,
            },
            filter: {
              keywords,
              restricted: true,
            },
          },
        ).then(array =>
          array.map(programmeSearchResult => ({
            ...programmeSearchResult,
            'restricted-programme': {
              ...programmeSearchResult.programme,
              ...programmeSearchResult,
            },
          })),
        )
      }
      return Promise.resolve([])
    },
  })
  const seriesAutosuggestProps = useAutosuggestLogic({
    query: (keywords): Promise<{ 'restricted-series': { id: string } }[]> => {
      if (keywords) {
        return query<'series-search-results', SeriesSearchResultType[]>(
          `series/search`,
          'series-search-results',
          {
            fields: ['name', 'series'],
            page: {
              size: 10,
            },
            // @ts-ignore
            include: ['series', 'series.programme'],
            includeFields: {
              series: ['programme', 'name', 'programme-title-with-genre'],
              programmes: ['title'],
            },
            sort: 'name',
            filter: {
              keywords,
              restricted: true,
            },
          },
        ).then(array => {
          return array.map(searchResult => {
            return {
              ...searchResult,
              'restricted-series': searchResult.series,
            }
          })
        })
      }
      return Promise.resolve([])
    },
  })
  const videosAutosuggestProps = useAutosuggestLogic({
    query: (keywords): Promise<{ 'restricted-video': { id: string } }[]> => {
      if (keywords) {
        return query<'video-search-result', VideoSearchResultType[]>(
          `videos/search`,
          'video-search-result',
          {
            fields: ['name', 'video'],
            include: ['video'],
            includeFields: {
              videos: ['programme-name', 'series-name', 'episode-name', 'programme-title-with-genre'],
            },
            page: {
              size: 10,
            },
            filter: {
              keywords,
              restricted: true,
            },
          },
        ).then(array => {
          return array.map(result => ({
            ...result,
            'restricted-video': {
              ...result.video,
              ...result,
            },
          }))
        })
      }
      return Promise.resolve([])
    },
  })
  const assetsAutosuggestProps = useAutosuggestLogic({
    query: (
      keywords,
    ): Promise<{ 'restricted-asset-material': { id: string } }[]> => {
      if (keywords) {
        return query<
          'asset-material-search-results',
          AssetMaterialSearchResultType[]
        >('asset-materials/search', 'asset-material-search-results', {
          fields: ['name', 'asset-material'],
          include: ['asset-material'],
          includeFields: {
            'asset-materials': ['name', 'programme-name', 'series-name'],
          },
          page: {
            size: 10,
          },
          sort: 'name',
          filter: {
            keywords,
            restricted: true,
          },
        }).then(array =>
          array.map(assetMaterial => ({
            ...assetMaterial,
            'restricted-asset-material': assetMaterial['asset-material'],
          })),
        )
      }
      return Promise.resolve([])
    },
  })

  return {
    programmesAutosuggestProps,
    seriesAutosuggestProps,
    videosAutosuggestProps,
    assetsAutosuggestProps,
  }
}

const enhance = compose(
  withUser,
  withTheme
)

export default enhance(PermissionsForm)