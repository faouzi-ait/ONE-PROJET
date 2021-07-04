import { useEffect } from 'react'
import pluralize from 'pluralize'
import deepEqual from 'deep-equal'

import { findAllByModel, findOneByModel, query } from 'javascript/utils/apiMethods'
import { getVideoProviders } from 'javascript/components/hoc/with-video-providers'
import usePrevious from 'javascript/utils/hooks/use-previous'
import useReduxState, { ReduxStateReturn } from 'javascript/utils/hooks/use-redux-state'
import useTheme from 'javascript/utils/theme/useTheme'

// Types
import {
  SeriesType,
  VideoType,
  LanguageType,
  VideoTypesType,
  VideoSearchResultType,
} from 'javascript/types/ModelTypes'


const getInitialState: () => State = () => ({
  activePosition: 0,
  availableSeries: [],
  availableLanguages: [],
  availableVideoTypes: [],
  allVideosLength: 0,
  currentSortedVideos: [],
  currentVideoHits: [],
  fetchFilters: {},
  fetchOptions: {},
  pageSize: 5,
  selectedSeries: 'all',
  selectedLanguage: 'all',
  selectedVideoType: 'all',
  sortedVideoStatus: 'loading',
})

const useSortVideos: UseSortedVideosType = (controllerConfig) => {

  const updateFetchFilters = (filterName, value, filterState) => {
    const update = {...filterState}
    if (value === 'all') {
      delete update[filterName]
    } else {
      update[filterName] = [ value ]
    }
    return update
  }

  const ensureVideosMatchProgrammeId = (videoArr, fetchOptions) => {
    if (videoArr?.length && Number(videoArr[0]['programme-id']) === Number(fetchOptions.programmeId)) {
      return videoArr
    }
    return []
  }

  const sortedVideosState: any = useReduxState<State, Actions, Selectors>({
    key: 'sortVideos',
    initialState: getInitialState(),
    actions: {
      setActivePosition: (state, activePosition) => ({
        ...state,
        activePosition
      }),
      setAvailableSeries: (state, payload) => ({
        ...state,
        availableSeries: payload.series
      }),
      setAvailableLanguages: (state, payload) => ({
        ...state,
        availableLanguages: payload.languages
      }),
      setAvailableVideoTypes: (state, payload) => ({
        ...state,
        availableVideoTypes: payload.videoTypes
      }),
      setAllSortedVideosLength: (state, length) => ({
        ...state,
        allVideosLength: length,
      }),
      setCurrentSortedVideos: (state, payload) => ({
        ...state,
        currentSortedVideos: payload.videos,
      }),
      setCurrentVideoHits: (state, payload) => ({
        ...state,
        currentVideoHits: payload
      }),
      setPageSize: (state, pageSize) => ({
        ...state,
        pageSize
      }),
      setPreSelections: (state, payload: PreSelectionsType) => ({
        ...state,
        ...payload,
        fetchOptions: {
          ...state.fetchOptions,
          preSelectMetaOnly: false
        }
      }),
      setSelectedSeries: (state, payload) => {
        return {
          ...state,
          selectedSeries: payload,
          fetchFilters: updateFetchFilters('series-ids', payload, state.fetchFilters)
        }
      },
      setSelectedLanguage: (state, payload) => {
        return {
          ...state,
          selectedLanguage: payload,
          fetchFilters: updateFetchFilters('language-ids', payload, state.fetchFilters)
        }
      },
      setSelectedVideoType: (state, payload) => {
        return {
          ...state,
          selectedVideoType: payload,
          fetchFilters: updateFetchFilters('video-type-ids', payload, state.fetchFilters)
        }
      },
      setSortedVideoStatus: (state, sortedVideoStatus) => {
        return {
          ...state,
          sortedVideoStatus
        }
      },
      resetInitialState: (state, payload) => {
        const update = getInitialState()
        if (payload?.programmeId) {
          update.fetchOptions = payload
        }
        return update
      }
    },
    selectors: {
      getAllSortedVideosLength: (state) => state.allVideosLength,
      getAvailableSeries: state => state.availableSeries,
      getAvailableLanguages: (state) => state.availableLanguages,
      getAvailableVideoTypes: (state) => state.availableVideoTypes,
      getCurrentSortedVideos: (state) => ensureVideosMatchProgrammeId(state.currentSortedVideos, state.fetchOptions),
      getCurrentVideoHits: (state) => state.currentVideoHits,
      getFetchFilters: (state) => state.fetchFilters,
      getFetchOptions: (state) => state.fetchOptions,
      getPageSize: (state) => state.pageSize,
      getSelectedSeries: state => state.selectedSeries,
      getSelectedLanguage: state => state.selectedLanguage,
      getSelectedVideoType: state => state.selectedVideoType,
      getActivePosition: (state) => state.activePosition,
      videosAreLoaded: state => state.sortedVideoStatus === 'loaded'
    },
  })

  const fetchOptions = sortedVideosState.getFetchOptions()
  const fetchFilters = sortedVideosState.getFetchFilters()
  const currentVideos = sortedVideosState.getCurrentSortedVideos()
  const activePosition = sortedVideosState.getActivePosition()
  const pageSize = sortedVideosState.getPageSize()

  const prevFetchFilters = usePrevious(fetchFilters)

  const theme = useTheme()
  const { brightcove, wistia, jwplayer } = getVideoProviders(theme)

  useEffect(() => {
    if (controllerConfig) {
      if (controllerConfig.pageSize) {
        sortedVideosState.setPageSize(controllerConfig.pageSize === 'all' ? 12 : controllerConfig.pageSize)
      }
      const fetchMetaResources = (isInitialisation = false) => {
        sortedVideosState.setActivePosition(0)
        fetchMetaResourcesOnly(isInitialisation)
      }
      if (!Object.keys(fetchOptions).length) return /* initial load */
      if (!Object.keys(fetchFilters).length) {
        fetchOptions.preSelectMetaOnly ? fetchPreSelectMetaResources() : fetchMetaResources(true)
      } else if (!deepEqual(fetchFilters, prevFetchFilters)) {
        fetchMetaResources()
      }
    }
  }, [JSON.stringify(fetchOptions), JSON.stringify(fetchFilters)])

  const isVideoFetchingNeeded = (pageNum) => {
    for (let i = (pageNum * pageSize) - pageSize; i < pageNum * pageSize; i += 1) {
      if (currentVideos[i]?.type === 'not_fetched') {
        return true
      }
    }
    return false
  }

  useEffect(() => {
    if (controllerConfig && currentVideos.length) {
      /*
        fetch order: Current page -> Next Page - Previous page (For any given activePosition)
        ensures scroll works without continously showing loaders
      */
      const pageNumber = Math.floor(activePosition / pageSize) + 1
      let pageNeedsFetching = 0
      if (isVideoFetchingNeeded(pageNumber)) { // currentPage
        pageNeedsFetching = pageNumber
      } else if (isVideoFetchingNeeded(pageNumber + 1)) { // nextPage
        pageNeedsFetching = pageNumber + 1
      } else if (pageNumber > 1 && isVideoFetchingNeeded(pageNumber - 1)) { // prevPage
        pageNeedsFetching = pageNumber - 1
      }
      if (pageNeedsFetching) {
        fetchResources(pageNeedsFetching)
      } else {
        if (controllerConfig.pageSize === 'all' && isVideoFetchingNeeded(pageNumber + 2)) {
          sortedVideosState.setActivePosition(activePosition + 1)
        }
      }
    }
  }, [JSON.stringify(currentVideos), activePosition])


  const fetchVideos = (programmeId, pageNumber) => findAllByModel('video-search-result', {
    fields: ['video'],
    include: ['video'],
    includeFields: {
      //@ts-ignore
      'videos': [
        'name', 'poster', 'parent-type', 'parent-id', 'series-name', 'downloadable',
        'series-id', 'position', 'episode-id', 'episode-name', 'restricted', 'upload-status',
        'programme-id',
        wistia && 'wistia-id',
        wistia && 'wistia-thumbnail-url',
        brightcove && 'brightcove-id',
        jwplayer && 'jwplayer-id',
      ].filter(Boolean),
    },
    filter: {
      'programme-ids': [programmeId],
      ...(fetchOptions.isPublic && { 'public-video': true }),
      ...fetchFilters,
    },
    ...(fetchOptions.token && { 'token': fetchOptions.token }),
    sort: theme.features.programmeOverview.seriesReverseOrder ? '-catalogue_position' : 'catalogue_position',
    page: {
      size: sortedVideosState.getPageSize(),
      number: pageNumber
    }
  })

  const fetchSeries = (seriesIds) => findAllByModel('series', {
    fields: ['name', 'position'],
    filter: { id: seriesIds.reverse() },
    ...(fetchOptions.token && { 'token': fetchOptions.token }),
    sort: theme.features.programmeOverview.seriesReverseOrder ? '-position,-name' : 'position,name',
  })

  const fetchLanguages = (languageIds) => {
    if (theme.features.videos.languages) {
      return findAllByModel('languages', {
        fields: ['name'],
        filter: { id: languageIds },
        ...(fetchOptions.token && { 'token': fetchOptions.token }),
      })
    }
    return Promise.resolve([])
  }

  const fetchVideoTypes = (videoTypeIds) => {
    if (theme.features.videos.types) {
      return findAllByModel('video-types', {
        fields: ['name'],
        filter: { id: videoTypeIds },
        ...(fetchOptions.token && { 'token': fetchOptions.token }),
      })
    }
    return Promise.resolve([])
  }

  const fetchMeta = (programmeId, metaFilters) => {
    return findAllByModel('video-search-result', {
      fields: ['name'],
      filter: {
        'programme-ids': [programmeId],
        'with-aggregations': fetchOptions.preSelectMetaOnly ? fetchOptions.preSelectMetaOnly.join(',') : true,
        ...(fetchOptions.isPublic && { 'public-video': true }),
        ...metaFilters,
      },
      ...(fetchOptions.token && { 'token': fetchOptions.token }),
      page: { size: 0 }
    })
  }

  const fetchProgrammeLanguages = (programmeId) => {
    return query(`programmes/${programmeId}/languages`, 'languages', {
      fields: ['name'],
    })
  }

  const selectProgrammeLanguageIfAvailable = (videoLanguages, programmeLanguages) => {
    for (let i = 0; i < programmeLanguages.length; i += 1) {
      const defaultLanguage = videoLanguages.find((vl) => vl.id === programmeLanguages[i].id)
      if (defaultLanguage) return defaultLanguage.id
    }
    return videoLanguages?.[0]?.id
  }

  const fetchPreSelectMetaResources = () => new Promise<void>(async(resolve, reject) => {
    if (!fetchOptions.programmeId) return resolve()
    const stateMappings = {
      'series-id': 'selectedSeries',
      'language-ids': 'selectedLanguage',
      'video-type-id': 'selectedVideoType',
    }
    const fetchMappings = {
      'series-id': fetchSeries,
      'language-ids':  fetchLanguages,
      'video-type-id': fetchVideoTypes,
    }

    try {
      let metaFilters = {...fetchFilters}
      let vsr = await fetchMeta(fetchOptions.programmeId, metaFilters)
      sortedVideosState.setAllSortedVideosLength(vsr.meta['record-count'])
      const programmeLanguages = await fetchProgrammeLanguages(fetchOptions.programmeId)
      const preselects = fetchOptions.preSelectMetaOnly
      const selectedState = {}
      for (let i = 0; i < preselects.length; i += 1) {
        const pst = preselects[i]
        //@ts-ignore
        const resources = await fetchMappings[pst](vsr.meta[pst])
        let selectedId = resources?.[0]?.id
        if (pst === 'language-ids' && programmeLanguages.length) {
          selectedId = selectProgrammeLanguageIfAvailable(resources, programmeLanguages)
        }
        if (selectedId) {
          metaFilters = updateFetchFilters(pluralize(pst), selectedId, metaFilters)
          vsr = await fetchMeta(fetchOptions.programmeId, metaFilters)
          selectedState[stateMappings[pst]] = selectedId
        }
      }
      sortedVideosState.setPreSelections({
        fetchFilters: metaFilters,
        ...selectedState
      })
      return resolve()
    } catch (error) {
      console.error('useSortedVideos -> fetchPreSelectMetaResources', error)
      return reject()
    }
  })

  const fetchMetaResourcesOnly = (isInitialisation = false) => new Promise<void>(async(resolve, reject) => {
    if (!fetchOptions.programmeId) return resolve()
    try {
      const vsr = await fetchMeta(fetchOptions.programmeId, fetchFilters)
      sortedVideosState.setCurrentVideoHits(vsr['meta'].hits)
      const selectedVideoType = sortedVideosState.getSelectedVideoType()
      if (selectedVideoType !== 'all') {
        const selectedSeries = sortedVideosState.getSelectedSeries()
        if (selectedSeries !== 'all' && !vsr.meta['series-id'].includes(selectedSeries)) {
          return sortedVideosState.setSelectedSeries('all')
        }
      }
      const selectedLanguage = sortedVideosState.getSelectedLanguage()
      if (selectedLanguage !== 'all' && !vsr.meta['language-ids'].includes(selectedLanguage)) {
        return sortedVideosState.setSelectedLanguage('all')
      }
      const [series, languages, videoTypes] = await Promise.all([
        fetchSeries(vsr.meta['series-id']),
        fetchLanguages(vsr.meta['language-ids']),
        fetchVideoTypes(vsr.meta['video-type-id'])
      ])
      sortedVideosState.setAvailableSeries({ series })
      sortedVideosState.setAvailableLanguages({ languages })
      sortedVideosState.setAvailableVideoTypes({ videoTypes })

      const blankVideoSlots = new Array(vsr.meta['record-count']).fill({
        id: null,
        'programme-id': fetchOptions.programmeId,
        type: 'not_fetched'
      })
      sortedVideosState.setCurrentSortedVideos({ videos: blankVideoSlots })
      if (isInitialisation) {
        sortedVideosState.setAllSortedVideosLength(vsr.meta['record-count'])
        sortedVideosState.setSortedVideoStatus(vsr.meta['record-count'] ? 'loading' : 'loaded')
      }
      resolve()
    } catch (error) {
      console.error('useSortedVideos -> fetchMetaResourcesOnly', error)
      return reject()
    }
  })

  const fetchResources = async (pageNumber) => {
    if (!fetchOptions.programmeId) return
    const videoSearchResponse = await fetchVideos(fetchOptions.programmeId, pageNumber) as VideoSearchResultType[] & { meta: any }
    const videos = videoSearchResponse.reduce((acc, vsr) => {
      if (vsr.video['upload-status'] === 'pending') return acc
      return [...acc, vsr.video]
    }, [])
    const currentVideos = [...sortedVideosState.getCurrentSortedVideos()]
    const startIndex = (pageNumber * pageSize) - pageSize
    currentVideos.splice(startIndex, videos.length, ...videos)
    sortedVideosState.setCurrentSortedVideos({ videos: currentVideos })
    sortedVideosState.setSortedVideoStatus('loaded')
  }

  sortedVideosState.getPromoVideo = (promoVideoId) => new Promise((resolve, reject) => {
    if (!promoVideoId) return resolve(undefined)
    resolve(findOneByModel('videos', promoVideoId, {
      fields: [ 'name' ]
    }))
  })

  return sortedVideosState
}

type SortedVideoStatusType = 'loading' | 'loaded'

type UseSortedVideosType = (controllerConfig?: { pageSize?: number | 'all' }) => ReduxStateReturn<State> & Actions & Selectors & SortedVideoFuncs

type SortedVideoFuncs = {
  getPromoVideo: (promoVideoId: number) => Promise<VideoType | undefined>
}

interface State {
  activePosition: number
  availableSeries: any[]
  availableLanguages: any[]
  availableVideoTypes: any[]
  allVideosLength: number
  currentSortedVideos: any[]
  currentVideoHits: string[]
  fetchFilters: any
  fetchOptions: FetchOptionsType
  pageSize: number
  selectedSeries: string
  selectedLanguage: string
  selectedVideoType: string
  sortedVideoStatus: SortedVideoStatusType
}

interface Actions {
  setAvailableSeries: (payload: {
    series: SeriesType[]
  }) => void
  setAvailableLanguages: (payload: {
    languages: LanguageType[]
  }) => void
  setAvailableVideoTypes: (payload: {
    videoTypes: VideoTypesType[]
  }) => void
  setAllSortedVideosLength: (length: number) => void
  setCurrentSortedVideos: (payload: { videos: VideoType[] }) => void
  setCurrentVideoHits: (payload: string[]) => void
  setPageSize: (pageSize: number) => void
  setPreSelections: (payload: PreSelectionsType) => void
  setSelectedSeries: (payload: string) => void
  setSelectedLanguage: (payload: string) => void
  setSelectedVideoType: (payload: string) => void
  setSortedVideoStatus: (payload: SortedVideoStatusType) => void
  setActivePosition: (payload: number) => void
  resetInitialState: (payload?: FetchOptionsType) => void
}

type PreSelectionsType = {
  fetchFilters?: any
  selectedSeries?: string
  selectedLanguage?: string
  selectedVideoType?: string
}

type PreSelectFiltersType = 'series-id' | 'language-ids' | 'video-type-id'

type FetchOptionsType = {
  programmeId?: string,
  token?: string,
  isPublic?: boolean
  preSelectMetaOnly?: boolean | PreSelectFiltersType[]
}

type Selectors = {
  getAllSortedVideosLength: () => number
  getAvailableSeries: () => SeriesType[]
  getAvailableLanguages: () => LanguageType[]
  getAvailableVideoTypes: () => VideoTypesType[]
  getCurrentSortedVideos: () => VideoType[]
  getCurrentVideoHits: () => string[]
  getFetchOptions: () => any
  getFetchFilters: () => any
  getPageSize: () => number
  getSelectedSeries: () => string
  getSelectedLanguage: () => string
  getSelectedVideoType: () => string
  getActivePosition: () => number
  videosAreLoaded: () => boolean
}

export default useSortVideos
