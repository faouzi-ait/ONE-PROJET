import React, { useEffect, useReducer } from 'react'
import pluralize from 'pluralize'
import Select from 'react-select'
import styled from 'styled-components'
import useSWR from 'swr'

import programmeFilterClientVariables from 'javascript/containers/filters/programme-filter/variables'

import { findAllByModel, findOneByModel } from 'javascript/utils/apiMethods'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import usePrefix from 'javascript/utils/hooks/use-prefix'
import useResource from 'javascript/utils/hooks/use-resource'
import withTheme from 'javascript/utils/theme/withTheme'

// Components
import { applyValidFilters } from 'javascript/containers/filters/filter-tools'
import { ProgrammesAutosuggest } from 'javascript/utils/hooks/use-programmes-autosuggest'
import AsyncSelect from 'javascript/components/async-select'
import Button from 'javascript/components/button'

// Types
import {
  EpisodeType,
  ProgrammeType,
  SeriesType,
  LanguageType,
} from 'javascript/types/ModelTypes'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'


const restrictedFilters = [
  {
    value: '',
    label: 'All',
    input: 'filter[restricted]',
  },
  {
    value: 'true',
    label: 'Restricted',
    input: 'filter[restricted]',
  },
  {
    value: 'false',
    label: 'Not Restricted',
    input: 'filter[restricted]',
  },
]
const publicFilters = [
  {
    value: '',
    label: 'All',
    input: 'filter[public-video]',
  },
  {
    value: 'true',
    label: 'Public',
    input: 'filter[public-video]',
  },
  {
    value: 'false',
    label: 'Not Public',
    input: 'filter[public-video]',
  },
]
interface FilterStateType {
  'filter[public-video]'?: string
  'filter[restricted]'?: string
  'filter[programme-ids]'?: string
  'filter[series-ids]'?: string
  'filter[episode-ids]'?: string
  'filter[language_ids]'?: string
}

interface Props {
  closeEvent: () => void
  filterState: FilterStateType
  onSubmit: (filterState?: any) => void
  programmeTitle?: string
  theme: CustomThemeType
}

type State = (
  | {
      type: 'noProgrammeChosen'
    }
  | {
      type: 'programmeChosen'
      programme: Partial<ProgrammeType>
    }
  | {
      type: 'seriesAndProgrammeChosen'
      programme: Partial<ProgrammeType>
      series: Partial<SeriesType>
    }
  | {
      type: 'seriesProgrammeAndEpisodeChosen'
      programme: Partial<ProgrammeType>
      series: Partial<SeriesType>
      episode: Partial<EpisodeType>
    }
  | {
      type: 'awaitingInitialLoad'
    }
) & {
  publicVideo: string
  restricted: string
  permittedLanguageIds: string[]
  selectedLanguages: LanguageType[]
  permittedProgrammeIds: string[]
  permittedEpisodeIds: string[]
  permittedSeriesIds: string[]
}

type Action =
  | {
      type: 'selectProgramme'
      programme: ProgrammeType
    }
  | {
      type: 'reportInitialLoad'
      state: State
    }
  | {
      type: 'selectSeries'
      series: SeriesType
    }
  | {
      type: 'selectEpisode'
      episode: EpisodeType
    }
  | {
      type: 'clearProgramme'
    }
  | {
      type: 'clearSeries'
    }
  | {
      type: 'clearEpisode'
    }
  | {
      type: 'selectLanguages'
      languages: LanguageType[]
    }
  | {
      type: 'clearEverything'
    }
  | {
      type: 'selectPublicVideo'
      value: string
    }
  | {
      type: 'selectRestrictedVideo'
      value: string
    }
  | {
      type: 'setMeta'
      meta: Meta
    }

interface Meta {
  hits: number[]
  'episode-id': string[]
  'language-ids': string[]
  'programme-id': string[]
  'series-id': string[]
}

const clearProgramme = (state) => {
  return {
    ...state,
    type: 'noProgrammeChosen',
  } as const
}

const clearEpisode = (state) => {
  return {
    ...state,
    type: 'seriesAndProgrammeChosen',
    permittedEpisodeIds: [] as string[],
  } as const
}

const clearSeries = (state) => {
  return {
    ...state,
    type: 'programmeChosen',
    permittedSeriesIds: [] as string[],
  } as const
}

const clearEverything = (): State => {
  return {
    type: 'noProgrammeChosen',
    publicVideo: '',
    restricted: '',
    permittedProgrammeIds: [],
    permittedLanguageIds: [],
    selectedLanguages: [],
    permittedEpisodeIds: [],
    permittedSeriesIds: [],
  }
}

const purgeDisallowedLanguagesWithMeta = ({
  languages,
  meta,
}: {
  languages: LanguageType[]
  meta: Meta
}) => {
  return languages.filter((l) => meta['language-ids'].includes(l.id))
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'clearEpisode':
      return clearEpisode(state)
    case 'clearEverything':
      return clearEverything()
    case 'clearProgramme':
      return clearProgramme(state)
    case 'clearSeries':
      return clearSeries(state)
    case 'reportInitialLoad':
      return action.state
    case 'selectLanguages':
      return {
        ...state,
        selectedLanguages: action.languages || [],
      }
    case 'selectPublicVideo':
      return {
        ...state,
        publicVideo: action.value,
      }
    case 'selectRestrictedVideo':
      return {
        ...state,
        restricted: action.value,
      }
    case 'selectProgramme':
      return {
        ...state,
        type: 'programmeChosen',
        permittedSeriesIds: [],
        programme: action.programme,
      }
    case 'selectSeries':
      if (
        state.type === 'programmeChosen' ||
        state.type === 'seriesAndProgrammeChosen' ||
        state.type === 'seriesProgrammeAndEpisodeChosen'
      ) {
        return {
          ...state,
          type: 'seriesAndProgrammeChosen',
          permittedEpisodeIds: [],
          programme: state.programme,
          series: action.series,
        }
      }
      break
    case 'selectEpisode':
      if (
        state.type === 'seriesAndProgrammeChosen' ||
        state.type === 'seriesProgrammeAndEpisodeChosen'
      ) {
        return {
          ...state,
          type: 'seriesProgrammeAndEpisodeChosen',
          episode: action.episode,
        }
      }
      break
    case 'setMeta':
      switch (state.type) {
        case 'noProgrammeChosen':
          return {
            ...state,
            type: 'noProgrammeChosen',
            permittedEpisodeIds: action.meta['episode-id'],
            permittedSeriesIds: action.meta['series-id'],
            permittedProgrammeIds: action.meta['programme-id'],
            permittedLanguageIds: action.meta['language-ids'],
            selectedLanguages: purgeDisallowedLanguagesWithMeta({
              languages: state.selectedLanguages,
              meta: action.meta,
            }),
          }
        case 'programmeChosen':
          if (!action.meta['programme-id'].includes(state.programme.id)) {
            return {
              ...state,
              type: 'noProgrammeChosen',
              permittedEpisodeIds: action.meta['episode-id'],
              permittedSeriesIds: action.meta['series-id'],
              permittedProgrammeIds: action.meta['programme-id'],
              permittedLanguageIds: action.meta['language-ids'],
              selectedLanguages: purgeDisallowedLanguagesWithMeta({
                languages: state.selectedLanguages,
                meta: action.meta,
              }),
            }
          } else {
            return {
              ...state,
              type: 'programmeChosen',
              permittedEpisodeIds: action.meta['episode-id'],
              permittedSeriesIds: action.meta['series-id'],
              permittedProgrammeIds: action.meta['programme-id'],
              permittedLanguageIds: action.meta['language-ids'],
              selectedLanguages: purgeDisallowedLanguagesWithMeta({
                languages: state.selectedLanguages,
                meta: action.meta,
              }),
            }
          }
        case 'seriesAndProgrammeChosen':
          if (!action.meta['programme-id'].includes(state.programme.id)) {
            return {
              ...state,
              type: 'noProgrammeChosen',
              permittedEpisodeIds: action.meta['episode-id'],
              permittedSeriesIds: action.meta['series-id'],
              permittedProgrammeIds: action.meta['programme-id'],
              permittedLanguageIds: action.meta['language-ids'],
              selectedLanguages: purgeDisallowedLanguagesWithMeta({
                languages: state.selectedLanguages,
                meta: action.meta,
              }),
            }
          } else if (!action.meta['series-id'].includes(state.series.id)) {
            return {
              ...state,
              type: 'programmeChosen',
              permittedEpisodeIds: action.meta['episode-id'],
              permittedSeriesIds: action.meta['series-id'],
              permittedProgrammeIds: action.meta['programme-id'],
              permittedLanguageIds: action.meta['language-ids'],
              selectedLanguages: purgeDisallowedLanguagesWithMeta({
                languages: state.selectedLanguages,
                meta: action.meta,
              }),
            }
          } else {
            return {
              ...state,
              type: 'seriesAndProgrammeChosen',
              permittedEpisodeIds: action.meta['episode-id'],
              permittedSeriesIds: action.meta['series-id'],
              permittedProgrammeIds: action.meta['programme-id'],
              permittedLanguageIds: action.meta['language-ids'],
              selectedLanguages: purgeDisallowedLanguagesWithMeta({
                languages: state.selectedLanguages,
                meta: action.meta,
              }),
            }
          }
        case 'seriesProgrammeAndEpisodeChosen':
          if (!action.meta['programme-id'].includes(state.programme.id)) {
            return {
              ...state,
              type: 'noProgrammeChosen',
              permittedEpisodeIds: action.meta['episode-id'],
              permittedSeriesIds: action.meta['series-id'],
              permittedProgrammeIds: action.meta['programme-id'],
              permittedLanguageIds: action.meta['language-ids'],
              selectedLanguages: purgeDisallowedLanguagesWithMeta({
                languages: state.selectedLanguages,
                meta: action.meta,
              }),
            }
          } else if (!action.meta['series-id'].includes(state.series.id)) {
            return {
              ...state,
              type: 'programmeChosen',
              permittedEpisodeIds: action.meta['episode-id'],
              permittedSeriesIds: action.meta['series-id'],
              permittedProgrammeIds: action.meta['programme-id'],
              permittedLanguageIds: action.meta['language-ids'],
              selectedLanguages: purgeDisallowedLanguagesWithMeta({
                languages: state.selectedLanguages,
                meta: action.meta,
              }),
            }
          } else if (!action.meta['episode-id'].includes(state.episode.id)) {
            return {
              ...state,
              type: 'seriesAndProgrammeChosen',
              permittedEpisodeIds: action.meta['episode-id'],
              permittedSeriesIds: action.meta['series-id'],
              permittedProgrammeIds: action.meta['programme-id'],
              permittedLanguageIds: action.meta['language-ids'],
              selectedLanguages: purgeDisallowedLanguagesWithMeta({
                languages: state.selectedLanguages,
                meta: action.meta,
              }),
            }
          }
      }
  }
  return state
}

const metaQuery = {
  fields: {
    'video-search-result': 'id,name',
  },
  'page[size]': 1,
  'page[number]': 1,
  'filter[with-aggregations]': true,
}

const makeFiltersFromVariables = ({
  episodeId,
  languageIds,
  programmeId,
  publicVideo,
  restricted,
  seriesId,
}: {
  episodeId?: string
  languageIds?: string
  programmeId?: string
  publicVideo?: string
  restricted?: string
  seriesId?: string
}): FilterStateType => {
  return {
    ...(episodeId && { 'filter[episode-ids]': episodeId }),
    ...(languageIds && { 'filter[language_ids]': languageIds }),
    ...(programmeId && { 'filter[programme-ids]': programmeId }),
    ...(publicVideo && { 'filter[public-video]': publicVideo }),
    ...(restricted && { 'filter[restricted]': restricted }),
    ...(seriesId && { 'filter[series-ids]': seriesId }),
  }
}

const VideoFilter = ({
  closeEvent,
  filterState,
  programmeTitle = '',
  onSubmit,
  theme,
}: Props) => {
  const episodeResource = useResource('episode')
  const seriesSearchResource = useResource('series-search-result')

  const programmeFilterCV = useClientVariables(programmeFilterClientVariables)
  const { prefix } = usePrefix()

  const [state, dispatch] = useReducer(reducer, {
    type: 'awaitingInitialLoad',
    publicVideo: '',
    restricted: '',
    permittedLanguageIds: [],
    selectedLanguages: [],
    permittedEpisodeIds: [],
    permittedProgrammeIds: [],
    permittedSeriesIds: [],
  })

  useHandleInitialLoad({
    dispatch,
    programmeTitle,
    episodeId: filterState['filter[episode-ids]'],
    programmeId: filterState['filter[programme-ids]'],
    seriesId: filterState['filter[series-ids]'],
    publicVideo: filterState['filter[public-video]'],
    restricted: filterState['filter[restricted]'],
    languageIds: filterState['filter[language_ids]'] || '',
  })
  useKeepMetaUpToDate(state, dispatch)

  const series = useSWR<SeriesType[]>(
    () =>
      [
        `series`,
        state.type === 'programmeChosen' && `programme=${state.programme.id}`,
        state.type === 'programmeChosen' &&
          `permittedIds=${state.permittedSeriesIds.join()}`,
      ].join(''),
    () => {
      if (state.type !== 'programmeChosen') {
        return []
      }
      if (state.permittedSeriesIds.length === 0) {
        return []
      }
      const query = {
        include: 'series',
        fields: {
          'series-search-results': 'series',
          series: 'name',
        },
        'filter[ids]': state.permittedSeriesIds.join(','),
      }
      return seriesSearchResource.findAll(query).then((response) => {
        const options = response.map(
          (seriesSearchResult) => seriesSearchResult.series,
        )
        return options
      })
    },
  )

  const episodes = useSWR<EpisodeType[]>(
    () =>
      [
        `episodes`,
        state.type === 'seriesAndProgrammeChosen' &&
          `programme=${state.programme.id}`,
        state.type === 'seriesAndProgrammeChosen' &&
          `series=${state.series.id}`,
        state.type === 'seriesAndProgrammeChosen' &&
          `permittedEpisodeIds=${state.permittedEpisodeIds.join()}`,
      ].join(''),
    () => {
      if (state.type !== 'seriesAndProgrammeChosen') {
        return []
      }
      if (state.permittedEpisodeIds.length === 0) {
        return []
      }
      return episodeResource.findAll({
        fields: {
          episodes: 'name',
        },
        'filter[ids]': state.permittedEpisodeIds.join(','),
      })
    },
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      filterState: makeFiltersFromVariables({
        languageIds: state.selectedLanguages.map((l) => l.id).join(','),
        restricted: state.restricted,
        publicVideo: state.publicVideo,
        ...(state.type === 'programmeChosen' && {
          programmeId: state.programme.id,
        }),
        ...(state.type === 'seriesAndProgrammeChosen' && {
          programmeId: state.programme.id,
          seriesId: state.series.id,
        }),
        ...(state.type === 'seriesProgrammeAndEpisodeChosen' && {
          programmeId: state.programme.id,
          episodeId: state.episode.id,
          seriesId: state.series.id,
        }),
      }),
      ...(state.type !== 'noProgrammeChosen' &&
        state.type !== 'awaitingInitialLoad' && {
          programmeTitle:
            (state.programme && state.programme['title-with-genre']) || null,
        }),
    })
    closeEvent()
  }

  const { data: languages } = useSWR(
    () => ['languages', `ids=${state.permittedLanguageIds.join()}`].join(),
    () => {
      return findAllByModel('languages', {
        fields: ['name', 'id'],
        filter: {
          id: state.permittedLanguageIds.join(','),
        },
      })
    },
  )

  return (
    <VideoFilterForm>
      <form className={`${prefix}form`} onSubmit={handleSubmit}>
        <VideoFilterRow>
          <VideoFilterLabel>
            {pluralize(theme.localisation.programme.upper)}
          </VideoFilterLabel>
          <ProgrammesAutosuggest
            buildParams={(keywords) => {
              const params = {
                filter: {
                  keywords: encodeURIComponent(keywords),
                },
              }
              if (state.permittedProgrammeIds.length) {
                params.filter['ids'] = state.permittedProgrammeIds.join(',')
              }
              return params
            }}
            onLoad={(options, callback) => callback({ options })}
          >
            {({ programmeSuggestions, searchProgrammes, value, setValue }) => {
              return (
                <AsyncSelect
                  placeholder=""
                  options={programmeSuggestions}
                  loadOptions={searchProgrammes}
                  value={
                    state.type !== 'noProgrammeChosen' &&
                    state.type !== 'awaitingInitialLoad' &&
                    state.programme
                  }
                  onChange={(programme: ProgrammeType) => {
                    setValue(programme)
                    if (programme) {
                      dispatch({
                        type: 'selectProgramme',
                        programme,
                      })
                    } else {
                      dispatch({
                        type: 'clearProgramme',
                      })
                    }
                  }}
                  labelKey="title-with-genre"
                />
              )
            }}
          </ProgrammesAutosuggest>
        </VideoFilterRow>

        <VideoFilterRow>
          <VideoFilterLabel>
            {pluralize(theme.localisation.series.upper)}
          </VideoFilterLabel>
          <Select
            onChange={(series: SeriesType) => {
              if (series) {
                dispatch({
                  type: 'selectSeries',
                  series,
                })
              } else {
                dispatch({
                  type: 'clearSeries',
                })
              }
            }}
            clearable={true}
            backspaceRemoves={true}
            options={series.data || []}
            labelKey="name"
            value={
              (state.type === 'seriesAndProgrammeChosen' ||
                state.type === 'seriesProgrammeAndEpisodeChosen') &&
              state.series
            }
            placeholder={
              state.type === 'programmeChosen'
                ? `Select ${theme.localisation.series.upper}...`
                : ''
            }
          />
        </VideoFilterRow>

        <VideoFilterRow>
          <VideoFilterLabel>
            {pluralize(theme.localisation.episodes.upper)}
          </VideoFilterLabel>
          <Select
            onChange={(episode: EpisodeType) => {
              if (episode) {
                dispatch({ episode, type: 'selectEpisode' })
              } else {
                dispatch({
                  type: 'clearEpisode',
                })
              }
            }}
            clearable={true}
            backspaceRemoves={true}
            options={episodes.data || []}
            value={
              state.type === 'seriesProgrammeAndEpisodeChosen' && state.episode
            }
            labelKey="name"
            placeholder={
              state.type === 'seriesAndProgrammeChosen'
                ? `Select ${theme.localisation.episodes.upper}...`
                : ''
            }
          />
        </VideoFilterRow>
        {theme.features?.videos?.languages && (
          <VideoFilterRow>
            <VideoFilterLabel>Languages</VideoFilterLabel>
            <Select
              label="Languages"
              onChange={(languages: LanguageType[]) =>
                dispatch({
                  type: 'selectLanguages',
                  languages,
                })
              }
              clearable={false}
              options={languages || []}
              multi
              labelKey="name"
              valueKey="id"
              value={state.selectedLanguages}
            />
          </VideoFilterRow>
        )}
        <VideoFilterGrid>
          <VideoFilterColumn>
            <VideoFilterLabel>Restricted</VideoFilterLabel>
            <Select
              label="Restricted"
              onChange={({ value }) =>
                dispatch({ type: 'selectRestrictedVideo', value })
              }
              options={restrictedFilters}
              value={state.restricted}
            />
          </VideoFilterColumn>
          <VideoFilterColumn>
            <VideoFilterLabel>Public</VideoFilterLabel>
            <Select
              onChange={({ value }) =>
                dispatch({ type: 'selectPublicVideo', value })
              }
              clearable={false}
              options={publicFilters}
              value={state.publicVideo}
            />
          </VideoFilterColumn>
        </VideoFilterGrid>

        <div className={`${prefix}programme-filters__actions`}>
          <Button className={programmeFilterCV.applyButtonClasses}>Apply Filters</Button>
          <Button
            className={programmeFilterCV.clearFiltersButtonClasses}
            type="button"
            onClick={() => {
              onSubmit()
              dispatch({ type: 'clearEverything' })
            }}
          >
            Clear filters
          </Button>
        </div>
      </form>
    </VideoFilterForm>
  )
}

export default withTheme(VideoFilter)

const useKeepMetaUpToDate = (
  state: State,
  dispatch: (action: Action) => void,
) => {
  const videoSearchResource = useResource('video-search-result')
  useEffect(() => {
    const unsavedFilterState = makeFiltersFromVariables({
      episodeId:
        state.type === 'seriesProgrammeAndEpisodeChosen' && state.episode.id,
      publicVideo: state.publicVideo,
      restricted: state.restricted,
      programmeId:
        state.type !== 'noProgrammeChosen' &&
        state.type !== 'awaitingInitialLoad' &&
        state.programme.id,
      seriesId:
        (state.type == 'seriesAndProgrammeChosen' ||
          state.type === 'seriesProgrammeAndEpisodeChosen') &&
        state.series.id,
    })
    const query = applyValidFilters(metaQuery, unsavedFilterState)
    videoSearchResource.findAll(query).then((response: { meta: Meta }) => {
      dispatch({ type: 'setMeta', meta: response.meta })
    })
  }, [JSON.stringify(state)])
}

const useHandleInitialLoad = ({
  dispatch,
  episodeId,
  programmeId,
  languageIds,
  programmeTitle,
  seriesId,
  publicVideo,
  restricted,
}: {
  dispatch: (action: Action) => void
  programmeTitle: string
  seriesId: string
  episodeId: string
  languageIds: string
  programmeId: string
  publicVideo: string
  restricted: string
}) => {
  const getLanguages = () =>
    findAllByModel('languages', {
      fields: ['name'],
    })
  const getEpisode = () =>
    findOneByModel('episodes', Number(episodeId), {
      fields: ['name'],
    })
  const getSeries = () =>
    findOneByModel('series', Number(seriesId), {
      fields: ['name'],
    })

  const handleSeries = async () => {
    const series = await getSeries()
    const languages = await getLanguages()
    dispatch({
      type: 'reportInitialLoad',
      state: {
        type: 'seriesAndProgrammeChosen',
        programme: {
          'title-with-genre': programmeTitle,
          id: programmeId,
        },
        series,
        permittedProgrammeIds: [],
        permittedSeriesIds: [],
        permittedEpisodeIds: [],
        permittedLanguageIds: [],
        publicVideo,
        restricted,
        selectedLanguages: languageIds
          .split(',')
          .filter(Boolean)
          .map((id) => languages.find((l) => l.id === id)),
      },
    })
  }
  const handleProgrammeAndSeriesAndEpisode = async () => {
    const episode = await getEpisode()
    const series = await getSeries()
    const languages = await getLanguages()
    dispatch({
      type: 'reportInitialLoad',
      state: {
        type: 'seriesProgrammeAndEpisodeChosen',
        programme: {
          'title-with-genre': programmeTitle,
          id: programmeId,
        },
        permittedEpisodeIds: [],
        permittedProgrammeIds: [],
        permittedSeriesIds: [],
        series,
        episode,
        permittedLanguageIds: [],
        publicVideo,
        restricted,
        selectedLanguages: languageIds
          .split(',')
          .filter(Boolean)
          .map((id) => languages.find((l) => l.id === id)),
      },
    })
  }

  const handleInitialLoad = async () => {
    if (programmeId && seriesId && episodeId) {
      handleProgrammeAndSeriesAndEpisode()
    } else if (programmeId && seriesId) {
      handleSeries()
    } else if (programmeId) {
      const languages = await getLanguages()
      dispatch({
        type: 'reportInitialLoad',
        state: {
          type: 'programmeChosen',
          programme: {
            id: programmeId,
            'title-with-genre': programmeTitle,
          },
          selectedLanguages: languageIds
            .split(',')
            .filter(Boolean)
            .map((id) => languages.find((l) => l.id === id)),
          permittedLanguageIds: [],
          permittedEpisodeIds: [],
          permittedProgrammeIds: [],
          permittedSeriesIds: [],
          publicVideo,
          restricted,
        },
      })
    } else {
      const languages = await getLanguages()
      dispatch({
        type: 'reportInitialLoad',
        state: {
          type: 'noProgrammeChosen',
          permittedProgrammeIds: [],
          permittedEpisodeIds: [],
          permittedSeriesIds: [],
          selectedLanguages: languageIds
            .split(',')
            .filter(Boolean)
            .map((id) => languages.find((l) => l.id === id)),
          permittedLanguageIds: [],
          publicVideo,
          restricted,
        },
      })
    }
  }
  useEffect(() => {
    handleInitialLoad()
  }, [])
}

const VideoFilterForm = styled.div`
  min-height: 300px;
  min-width: 460px;
`

const VideoFilterRow = styled.div`
  margin: 20px 40px;
`

const VideoFilterGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 40px;
`

const VideoFilterColumn = styled.div`
  margin-right: 40px;
  width: calc(50% - 20px);
  &:nth-child(2) {
    margin-right: 0;
  }
`

const VideoFilterLabel = styled.label`
  display: block;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`
