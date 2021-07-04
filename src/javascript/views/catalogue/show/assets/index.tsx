// React
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import jsFileDownload from 'js-file-download'
import moment from 'moment'
import pluralize from 'pluralize'

import allClientVariables from './variables'

import api from 'javascript/utils/api'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useLoadInWave from 'javascript/utils/hooks/use-load-in-wave'
import useLocalState from 'javascript/utils/hooks/use-local-state'
import { findAllByModel } from 'javascript/utils/apiMethods'
import { fileSizeString } from 'javascript/utils/generic-tools'

// Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import {
  AssetMaterialType,
  ProgrammeType,
  UserType,
  AssetCategoryType,
  SeriesType,
  LanguageType,
} from 'javascript/types/ModelTypes'
// Components
import Asset from 'javascript/components/asset'
import Carousel from 'javascript/components/carousel'
import {
  ListNavigator,
  ListNavigatorColumn,
} from 'javascript/components/list-navigator'
import Modal from 'javascript/components/modal'
import Tabs from 'javascript/components/tabs'
import { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'

interface InProps extends WithPageHelperType  {
  resource: ProgrammeType
  user: UserType
  pageState?: { isLoading: boolean }
  programmeDetails: unknown
  theme: CustomThemeType
}

const CatalogueShowAssets: React.FC<InProps> = inProps => {
  const props = useLogic(inProps)

  return props.showAssets && props.resource['has-assets'] ? (
    <Tabs containerClasses={"programme-tabs"}>
      {props.programmeDetails}
      <div title={pluralize(props.theme.localisation.asset.upper)} className="container">
        <AssetBrowser {...props} />
      </div>
    </Tabs>
  ) : (
    <>{props.programmeDetails}</>
  )
}

interface SelectionType {
  series: SeriesType
  assetCategory: AssetCategoryType
  language: LanguageType
  assets: AssetMaterialType[]
}

const useLogic = (props: InProps) => {
  const { resource: programme, theme } = props
  const [downloadProgress, setDownloadProgress] = useState<number>(null)
  const [isDownloading, setDownloading] = useState<boolean>(false)

  /** Responsiveness */
  const media = window.matchMedia('(min-width: 1024px)')
  const [showAssets, setShowAssets] = useState(media.matches)
  const resize = ({ matches }) => {
    setShowAssets(matches)
  }
  useEffect(() => {
    media.addListener(resize)
    return () => media.removeListener(resize)
  }, [])
  const seriesWithAssets = [
    ...(programme['has-assets']
      ? [
          {
            id: null,
            name: `${theme.localisation.programme.upper} Level`,
          },
        ]
      : []),
    ...programme['active-series']?.filter(series => series['has-assets'])
    .sort((a, b) => theme.features.programmeOverview.seriesReverseOrder ? (b.position - a.position || b?.name?.localeCompare(a?.name)) : (a.position - b.position || a?.name?.localeCompare(b?.name))),
  ]

  const {
    selectSeries,
    selectAssetCategory,
    selectAllAssets,
    state: assetSelectionState,
    toggleAssetSelection,
    unselectAllAssets,
    updateLanguage,
    assets,
    isLoadingAssets,
  } = useSelectionState({ programme })

  const languages = useGetLanguages({
    assetCategory: assetSelectionState.assetCategory,
    series: assetSelectionState.series,
  })

  const { assetCategories, assetCategoriesAreLoading } = useGetAssetCategories({
    programme,
    series: assetSelectionState.series,
  })

  const downloadAssets = () => {
    const fileName = `${programme.title}-assets-${moment().format(
      'DD-MM-YYYY-HH-MM-SS',
    )}`
      .toLowerCase()
      .replace(/ /g, '-')
    const assets = assetSelectionState.assets.map(a => a.id)
    setDownloading(true)
    axios({
      url: `${api.apiUrl}/asset-materials-zip`,
      method: 'POST',
      headers: api.headers,
      responseType: 'blob',
      data: { asset_material_ids: assets },
      onDownloadProgress: progressEvent => {
        setDownloadProgress(progressEvent.loaded)
      },
    }).then(({ data }) => {
      jsFileDownload(data, `${fileName}.zip`)
      setDownloadProgress(null)
      setDownloading(false)
    })
  }

  return {
    ...props,
    downloadAssets,
    selectSeries,
    selectAssetCategory,
    updateLanguage,
    unSelectAll: unselectAllAssets,
    selectAll: selectAllAssets,
    toggleAsset: toggleAssetSelection,
    languages,
    seriesWithAssets,
    assetCategories,
    assets,
    loadingAssets: isLoadingAssets,
    downloading: isDownloading,
    downloadProgress,
    selection: assetSelectionState,
    showAssets,
    assetCategoriesAreLoading,
  }
}

export default CatalogueShowAssets

const useSelectionState = ({ programme }: { programme: ProgrammeType }) => {
  const actionsAndState = useLocalState<SelectionType, SelectionActions, {}>({
    initialState: {
      assetCategory: null,
      series: null,
      assets: [],
      language: null,
    },
    actions: {
      selectSeries: (state, series: SeriesType) => ({
        ...state,
        series,
        assets: [],
        assetCategory: null,
      }),
      selectAssetCategory: (state, assetCategory: AssetCategoryType) => ({
        ...state,
        assetCategory,
        assets: [],
      }),
      reset: () => ({
        assetCategory: null,
        assets: [],
        language: null,
        series: null,
      }),
      selectAllAssets: (state, assets) => ({ ...state, assets }),
      unselectAllAssets: state => ({ ...state, assets: [] }),
      toggleAssetSelection: (state, assetToToggle: AssetMaterialType) => {
        const assetsWithout = state.assets.filter(
          asset => asset.id !== assetToToggle.id,
        )
        if (assetsWithout?.length !== state.assets?.length) {
          return {
            ...state,
            assets: assetsWithout,
          }
        }
        return { ...state, assets: [...state.assets, assetToToggle] }
      },

      updateLanguage: (state, language: LanguageType) => ({
        ...state,
        language,
      }),
    },
  })

  const selection = actionsAndState.state

  const { assets, isLoading } = useGetAssets({
    assetCategory: selection.assetCategory,
    language: selection.language,
    series: selection.series,
    programme,
  })

  useEffect(() => {
    actionsAndState.reset()
  }, [programme.id])

  return { ...actionsAndState, assets, isLoadingAssets: isLoading }
}

interface SelectionActions {
  selectSeries: (series: SeriesType) => void
  selectAssetCategory: (assetCategory: AssetCategoryType) => void
  reset: () => void
  selectAllAssets: (assets: AssetMaterialType[]) => void
  unselectAllAssets: () => void
  toggleAssetSelection: (asset: AssetMaterialType) => void
  updateLanguage: (language: LanguageType) => void
}

const useGetLanguages = ({
  assetCategory,
  series,
}: {
  series: Partial<SeriesType>
  assetCategory: Partial<AssetCategoryType>
}) => {
  const languageString = `true,Series,${(series || {}).id ? series.id : ''},${
    (assetCategory || {}).id ? assetCategory.id : ''
  }`
  const [data, setData] = useState<LanguageType[]>([])
  useEffect(() => {
    if (series && assetCategory) {
      findAllByModel('languages', {
        fields: ['name'],
        filter: {
          has_asset_materials: languageString,
        },
      })
        .then(setData)
        .catch(e => {
          console.warn(e)
          setData([])
        })
    } else {
      setData([])
    }
  }, [(series || {}).id, (assetCategory || {}).id])
  return data
}

const useGetAssetCategories = ({
  series,
  programme,
}: {
  series: Partial<SeriesType>
  programme: Partial<ProgrammeType>
}) => {
  const { fetchQuery, updateCache, status, data } = useLoadInWave({
    query: ({ page, pageSize }, series, programme) =>
      findAllByModel('asset-categories', {
        fields: ['name', 'asset-materials-count'],
        filter: {
          parent_id: (series || {}).id ? series.id : programme.id,
          parent_type: (series || {}).id ? 'series' : 'programme',
        },
        page: {
          number: page,
          size: pageSize,
        },
      }),
    pageSize: 7,
  })

  useEffect(() => {
    if (series) {
      fetchQuery(series, programme)
    } else {
      updateCache([])
    }
  }, [(series || {}).id, (programme || {}).id])
  return {
    assetCategories: data || [],
    assetCategoriesAreLoading: status === 'loading',
  }
}

interface UseGetAssetsParams {
  series?: Partial<SeriesType>
  assetCategory?: Partial<AssetCategoryType>
  language?: Partial<LanguageType>
  programme: Partial<ProgrammeType>
}

const useGetAssets = ({
  series,
  assetCategory,
  language,
  programme,
}: UseGetAssetsParams) => {
  const { status, data, updateCache, fetchQuery } = useLoadInWave<
    (
      assetCategory: Partial<AssetCategoryType>,
      series: Partial<SeriesType>,
    ) => Promise<AssetMaterialType[]>
  >({
    pageSize: 7,
    query: ({ page, pageSize }, assetCategory, series) => {
      const filter = {
        ...(series.id
          ? {
              parent_type: 'Series',
              parent_id: series.id,
            }
          : {
              parent_type: 'Programme',
              parent_id: programme.id,
            }),
        language: (language || {}).id,
      }
      if(assetCategory.id){
        filter['asset_category_id'] = (assetCategory || {}).id
      }
      return findAllByModel('asset-materials', {
        fields: ['name', 'asset-category', 'asset-items', 'gallery'],
        include: ['asset-items', 'asset-category'],
        includeFields: {
          'asset-categories': ['name'],
          'asset-items': ['file-type', 'file-size', 'file', 'file-identifier'],
        },
        filter,
        page: {
          size: pageSize,
          number: page,
        },
      })
    },
  })

  useEffect(() => {
    if (assetCategory && series) {
      fetchQuery(assetCategory, series)
    } else {
      updateCache([])
    }
  }, [(series || {}).id, (assetCategory || {}).id, (language || {}).id,])
  return {
    assets: data,
    isLoading: status === 'loading',
  }
}

const AssetBrowser: React.FC<ReturnType<typeof useLogic>> = ({
  assets,
  selection,
  modalState,
  downloadProgress,
  downloading,
  downloadAssets,
  selectAll,
  unSelectAll,
  pageState,
  seriesWithAssets,
  selectSeries,
  assetCategoriesAreLoading,
  assetCategories,
  selectAssetCategory,
  loadingAssets,
  updateLanguage,
  languages,
  toggleAsset,
  theme,
}) => {
  const assetsRendered = assets && assets?.length
  if (assetCategories && assetCategories?.length > 0 && assetCategories[0].id) {
    assetCategories.unshift({
      id: null,
      name: 'All categories'
    })
  }

  const {
    selectAllButtonClasses,
    downloadButtonClasses
  } = useClientVariables(allClientVariables)

  const renderSelectionText = () => {
    const assetStr = theme.localisation.asset.upper
    if (selection.assetCategory) {
      if (selection.assets?.length) {
        return (
          <span>
            {selection.assets?.length}{' '}
            {selection.assets?.length === 1 ? assetStr : pluralize(assetStr)}{' '}
            selected
          </span>
        )
      } else {
        return <span className="list-controls__count">Select {pluralize(assetStr)}</span>
      }
    } else if (selection.series) {
      return <span className="list-controls__count">Select an {assetStr} Type</span>
    } else {
      return <span className="list-controls__count">Select a {theme.localisation.series.upper}</span>
    }
  }

  const viewGallery = () => {
    const acceptedFileTypes = theme.features.acceptedFileTypes.gallery
      .replace(/\./g, '')
      .split(', ')
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={selection.assets[0].name}
          closeEvent={hideModal}
          modifiers={['carousel']}
        >
          <div className="modal__content">
            <Carousel
              options={{
                arrows: true,
                thumbnails: true,
                fullWidth: true,
                autoHeight: true,
              }}
            >
              {selection.assets[0]['asset-items']
                .filter(resource =>
                  acceptedFileTypes.includes(
                    resource['file-type'].toLowerCase(),
                  ),
                )
                .map((resource, index) => (
                  <img src={resource.file.url} key={index} />
                ))}
            </Carousel>
          </div>
        </Modal>
      )
    })
  }

  let downloadedString = null
  if (downloadProgress) {
    if (downloadProgress < 1000) {
      downloadedString = 'Less than 1Kb'
    } else if (downloadProgress > 1000 * 1000) {
      downloadedString = `${(downloadProgress / (1024 * 1024)).toFixed(2)}Mb`
    } else {
      downloadedString = `${(downloadProgress / 1024).toFixed(2)}Kb`
    }
  }

  return (
    <div className="programme-assets">
      <h2 className="heading--two">{pluralize(theme.localisation.asset.upper)}</h2>
      <div className="list-controls list-controls--plain">
        <div>
          <div className="list-controls__list">
            {renderSelectionText()}
            {selection.assetCategory && assets && assets?.length ? (
              <span className="list-controls__divider">|</span>
            ) : null}
            {selection.assetCategory && assets && assets?.length > 0 ? (
              <button className={selectAllButtonClasses}
                onClick={() => {
                  selection.assets?.length >= assets?.length
                    ? unSelectAll()
                    : selectAll(assets)
                }}
              >
                {selection.assets?.length >= assets?.length && 'Un-'}Select All
              </button>
            ) : null}
          </div>
        </div>
        <div>
          <div className="list-controls__list">
            {selection.assets?.length && !downloading ? (
              <button
                className={downloadButtonClasses}
                onClick={downloadAssets}
              >
                Download Selected{' '}
                {selection.assets?.length === 1
                  ? theme.localisation.asset.upper
                  : pluralize(theme.localisation.asset.upper)}
              </button>
            ) : null}
            {downloading && (
              <span style={{margin: '0 12px 3px 0'}}>
                {downloadedString}{' '}
                {downloadedString ? (
                  <span>Downloaded</span>
                ) : (
                  <span>Initializing Download</span>
                )}
              </span>
            )}
            {selection.assets?.length === 1 && selection.assets[0].gallery && (
              <button
                className="button button--small button--filled"
                onClick={viewGallery}
              >
                View gallery
              </button>
            )}
            {!selection.assets?.length ? null : (
              <button
                className="button button--small button--null"
                onClick={unSelectAll}
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </div>
      {!pageState.isLoading && (
        <ListNavigator>
          <ListNavigatorColumn
            modifiers={['equal']}
            selected={selection.series}
            title={theme.localisation.series.upper}
            items={seriesWithAssets}
            onClick={selectSeries}
            nameIdentifier="name"
            display={true}
          />
          <ListNavigatorColumn
            loading={assetCategoriesAreLoading}
            modifiers={['equal']}
            selected={selection.assetCategory}
            title={`${theme.localisation.asset.upper} Type`}
            items={assetCategories}
            onClick={selectAssetCategory}
            nameIdentifier="name"
            display={true}
          >
            {selection.series && !assetCategories?.length && (
              <p className="list-navigator__no-results">
                No {pluralize(theme.localisation.asset.lower)} found
              </p>
            )}
          </ListNavigatorColumn>
          <ListNavigatorColumn
            loading={loadingAssets}
            modifiers={['large']}
            title="Files"
            onFilter={theme.features.assetLanguages && updateLanguage}
            filterLabel="Filter by language"
            filterOptions={languages}
            selectedFilter={selection.language}
            items={assetsRendered}
            display={true}
            hideSearch={!selection.assetCategory}
          >
            {assets &&
              assets.map((asset, i) => {
                const isSelected =
                  selection.assets?.filter(a => a.id === asset.id)?.length > 0
                let fileSize = 0
                asset['asset-items'].map(file => {
                  fileSize += file['file-size']
                })
                return (
                  <Asset
                    key={i}
                    readOnly={true}
                    asset={asset}
                    size={fileSizeString(fileSize)}
                    classes={isSelected && ['is-active']}
                    selected={isSelected}
                    onClick={() => {
                      toggleAsset(asset)
                    }}
                  />
                )
              })}
            {selection.assetCategory && assets && !assets.length && (
              <p className="list-navigator__no-results">
                No {pluralize(theme.localisation.asset.lower)} found
              </p>
            )}
          </ListNavigatorColumn>
        </ListNavigator>
      )}
    </div>
  )
}
