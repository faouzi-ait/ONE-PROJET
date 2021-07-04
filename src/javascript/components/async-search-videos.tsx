import React from 'react'
import Select from 'react-select'
// hoc
import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
// hooks
import { query } from 'javascript/utils/apiMethods'
import useAutosuggestLogic from 'javascript/utils/hooks/use-autosuggest-logic'
// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import VideoProvidersType from 'javascript/types/VideoProviders'
import {
  VideoSearchResultType,
  VideoType,
} from 'javascript/types/ModelTypes'

export const makeVideoName = (video: VideoType) =>
  `${video.name}${
    video['programme-name'] ? ` - ${video['programme-name']}` : ''
  }${video['series-name'] ? ` - ${video['series-name']}` : ''}${
    video['episode-name'] ? ` - ${video['episode-name']}` : ''
  }`

const mapVideoName = (searchResult: VideoSearchResultType) => ({
  ...searchResult,
  name: makeVideoName(searchResult.video),
  video: {
    ...searchResult.video,
    name: makeVideoName(searchResult.video),
  },
})

export interface VideoFilterType {
  filter: {
    [key: string]: string | boolean | number | string[]
  }
}

export const AsyncSearchVideo: React.FC<{
  value: any
  onChange: (value: any) => void
  videoFilters?: VideoFilterType,
  theme: CustomThemeType
}> = ({
  value,
  onChange,
  videoFilters = {
    filter: {
      restricted: false
    }
  },
  theme
}) => {
  return (
    <VideoSearchProvider videoFilters={videoFilters}>
      {({ suggestions, fetchSuggestions }) => {
        const resolvedSuggestions = (suggestions as VideoSearchResultType[]).map(
          mapVideoName,
        )
        return (
          <Select.Async
            value={value}
            onChange={onChange}
            options={resolvedSuggestions}
            loadOptions={fetchSuggestions}
            labelKey="name"
            filterOption={() => true}
            valueKey="id"
            autoload={false}
            placeholder={theme && `Search Title or ${theme.localisation.video.upper} Provider ID...`}
            cache={false}
          />
        )
      }}
    </VideoSearchProvider>
  )
}

const VideoSearchProviderComponent: React.FC<{
  children: (params: {
    fetchSuggestions: () => void
    onClear: () => void
    suggestions: any[]
  }) => any
  videoFilters: VideoFilterType
  theme?: CustomThemeType | null
  videoProviders: VideoProvidersType
}> = ({
  children,
  videoFilters,
  theme,
  videoProviders
}) => {
  const { fetchSuggestions, onClear, suggestions } = useAutosuggestLogic({
    query: async (input, callback) => {
      if (!input) {
        callback({ options: [] })
        return Promise.resolve([])
      }
      const filter = {
        keywords: encodeURIComponent(input),
        ...videoFilters.filter
      }

      return query('videos/search', 'video-search-result', {
        fields: ['name', 'video'],
        include: ['video'],
        includeFields: {
          videos: [
            'name',
            'brightcove-id',
            'knox-uuid',
            'programme-name',
            'series-name',
            'episode-name',
            'mp4-url',
            ...(videoProviders.wistia
              ? ['wistia-id' as 'wistia-id']
              : []),
          ],
        },
        page: {
          size: 100
        },
        filter,
      }).then(videos => {
        callback({
          options: videos.map(mapVideoName),
        })
        return videos
      })
    },
  })

  return children({
    suggestions: suggestions,
    onClear,
    fetchSuggestions,
  })
}


const enhance = compose(
  withTheme,
  withVideoProviders
)
const VideoSearchProvider = enhance(VideoSearchProviderComponent)


export default withTheme(AsyncSearchVideo)