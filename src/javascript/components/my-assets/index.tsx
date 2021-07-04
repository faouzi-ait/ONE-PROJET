import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import jsFileDownload from 'js-file-download'
import moment from 'moment'

import { applyValidFilters } from 'javascript/containers/filters/filter-tools'
import { fileSizeString } from 'javascript/utils/generic-tools'
import api from 'javascript/utils/api'
import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'
import withTheme, { WithThemeType } from 'javascript/utils/theme/withTheme'
import withUser, { WithUserType } from 'javascript/components/hoc/with-user'

// Components
import AssetMaterialList from 'javascript/components/my-assets/asset-list'
import Button from 'javascript/components/button'
import Checkbox from 'javascript/components/custom-checkbox'
import Filters from 'javascript/components/my-assets/filters'
import Icon from 'javascript/components/icon'
import Paginator from 'javascript/components/paginator'
import Modal from 'javascript/components/modal'
import SearchInput from 'javascript/components/search-input'
import Carousel from 'javascript/components/carousel'

// Types
import { ProgrammeType } from 'javascript/types/ModelTypes'

import 'stylesheets/core/components/my-assets'


const ID_SELECTED_FOR_DOWNLOAD = true
const MAX_DOWNLOAD_SIZE = 500 // no more than 500 assets can be downloaded at once
const INITIALIZING_DOWNLOAD = 'Initializing Download'
const DOWNLOAD_IN_PROGRESS = 'Download in Progress'
const DOWNLOAD_COMPLETE = 'Download Complete'

interface Props extends WithModalType, WithThemeType, WithUserType {
  myAssetsOnlyDisabled?: boolean
  programme?: ProgrammeType
}

const MyAssets: React.FC<Props> = ({
  myAssetsOnlyDisabled = false,
  programme = null,
  modalState,
  theme,
  user,
}) => {

  const [keywords, setKeywords] = useState(null)
  const [myAssetsOnly, setMyAssetsOnly] = useState(myAssetsOnlyDisabled)
  const [filterState, setFilterState] = useState({})

  const assetListRef = useRef(null)

  const [selectAllIsChecked, setSelectAllIsChecked] = useState(false)
  const [selectedProgramme, setSelectedProgramme] = useState(null)
  const [selectedForDownload, setSelectedForDownload] = useState({})
  const [debounceTimer, setDebounceTimer] = useState(null)
  const [assets, setAssets] = useState(null)
  const [meta, setMeta] = useState({})

  const [downloadInProgress, setDownloadInProgress] = useState(false)
  const [downloadText, setDownloadText] = useState(INITIALIZING_DOWNLOAD)
  const [amountDownloaded, setAmountDownloaded] = useState(null)

  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10

  const scrollTopOfList = () => {
    assetListRef.current.scrollIntoView()
    window.scrollBy(0, -150)
  }

  const setSelectedStateOnAssets = (assetMaterial) => ({
    ...assetMaterial,
    selected: !!selectedForDownload[assetMaterial.id]
  })

  const assetMaterialSearchResource = useResource('asset-material-search-result')
  const getAssetMaterials = () => {
    const query = {
      include: 'asset-material,asset-material.asset-items,asset-material.asset-category',
      fields: {
        'asset-material-search-results': 'name,asset-material',
        'asset-materials': [
          'name,programme-name,asset-items,gallery,asset-category',
          theme.features.programmeSlugs.enabled ? 'programme-slug': 'programme-id'
        ].join(','),
        'asset-items': 'file,file-type,file-size',
        'asset-categories': 'name'
      },
      'page[size]': pageSize,
      'page[number]': pageNumber
    }
    const filters = {
      'filter[keywords]': keywords,
      'filter[with-aggregations]': true,
      ...filterState
    }
    if (myAssetsOnly) {
      filters['filter[restricted]'] = true
    }
    assetMaterialSearchResource.findAll(
      applyValidFilters(query, filters)
    )
    .then((response) => {
      setAssets(response
        .map((searchResult) => searchResult['asset-material'])
        .map(setSelectedStateOnAssets)
      )
      setTotalPages(response.meta['page-count'])
      setMeta(response.meta)
    })
  }

  useEffect(() => {
    if (programme) {
      if (!programme.id) return // need to wait for programme fetch to complete..
      if (programme.id !== filterState['filter[programme]']) return // need to ensure filterState contains programmeId
    }
    getAssetMaterials()
  }, [pageNumber, filterState, myAssetsOnly])


  useEffect(() => {
    if (keywords === null) return
    clearTimeout(debounceTimer)
    setDebounceTimer(
      setTimeout(() => {
        getAssetMaterials()
      }, 500)
    )
  }, [keywords])

  useEffect(() => {
    if (assets) {
      setAssets((currAssets) => currAssets.map(setSelectedStateOnAssets))
    }
  }, [selectedForDownload])

  useEffect(() => {
    if (programme?.id) {
      setKeywords(null)
      resetFilters()
    }
  }, [programme?.id])

  const markAssetForDownload = (resourceId, checked) => {
    const update = {...selectedForDownload}
    if (checked) {
      update[resourceId] = ID_SELECTED_FOR_DOWNLOAD
    } else {
      delete update[resourceId]
    }
    setSelectedForDownload(update)
  }

  const renderDownloadControls = () => {
    const numberOfSelectedAssets = Object.keys(selectedForDownload).length
    const assetStr = numberOfSelectedAssets === 1 ? 'asset' :'assets'
    const downloadButtonClasses = numberOfSelectedAssets ? 'text-button text-button--error' : 'text-button text-button--disabled'
    const selectedAssets = assets?.filter(a => a.selected)
    return (
      <div className="my-assets__list-controls">
        <div className="my-assets__selected-items">
          {numberOfSelectedAssets > 0 && (
            <>
              <span className="my-assets__count">{`${numberOfSelectedAssets} ${assetStr} selected`}</span>
              <Button type="button"
                className="button button--filled"
                onClick={() => {
                  setSelectAllIsChecked(false)
                  setSelectedForDownload({})
                }}
              >
                Clear
              </Button>
            </>
          )}
          {numberOfSelectedAssets === 1 && selectedAssets?.[0]?.gallery && (
            <Button
              className="button"
              onClick={() => viewGallery(selectedAssets?.[0])}
            >
              View gallery
            </Button>
          )}
        </div>
        <div className="my-assets__download">
          <Checkbox
            label={selectAllIsChecked ? 'Unselect All' : 'Select All'}
            id={'select-all'}
            checked={selectAllIsChecked}
            onChange={({target}) => {
              const checked = target.checked
              setSelectAllIsChecked(checked)
              const updateAllSelectedForDownload = meta['hits'].slice(0, MAX_DOWNLOAD_SIZE).reduce((acc, curr) => {
                if (checked) {
                  acc[curr] = ID_SELECTED_FOR_DOWNLOAD
                } else {
                  delete acc[curr]
                }
                return acc
              }, {...selectedForDownload})
              setSelectedForDownload(updateAllSelectedForDownload)

            }}
          />
          <Button className={downloadButtonClasses} type="button" onClick={downloadSelectedAssets}>
            <Icon width="21" height="20" id="i-download" classes="button__icon" />
            Download Selected
          </Button>
        </div>
      </div>
    )
  }

  const viewGallery = (selection) => {
    const acceptedFileTypes = theme.features.acceptedFileTypes.gallery
      .replace(/\./g, '')
      .split(', ')
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          title={selection.name}
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
              {selection['asset-items']
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

  const downloadSelectedAssets = () => {
    const fileName = `my-assets-${moment().format(
      'DD-MM-YYYY-HH-MM-SS',
    )}`
      .toLowerCase()
      .replace(/ /g, '-')
    const assetIds = Object.keys(selectedForDownload)
    setDownloadInProgress(true)
    setDownloadText(INITIALIZING_DOWNLOAD)
    axios({
      url: `${api.apiUrl}/asset-materials-zip`,
      method: 'POST',
      headers: api.headers,
      responseType: 'blob',
      data: { asset_material_ids: assetIds },
      onDownloadProgress: progressEvent => {
        if (downloadText !== DOWNLOAD_IN_PROGRESS) {
          setDownloadText(DOWNLOAD_IN_PROGRESS)
        }
        setAmountDownloaded(progressEvent.loaded)
      },
    }).then(({ data }) => {
      jsFileDownload(data, `${fileName}.zip`)
      setDownloadText(DOWNLOAD_COMPLETE)
      setAmountDownloaded(null)
      resetFilters()
      setSelectedForDownload({})
      setTimeout(() => {
        setSelectedForDownload({})
        setDownloadInProgress(false)
      }, 1500)
    })
  }

  const resetFilters = () => {
    setSelectedProgramme(null)
    const programmeId = programme?.id || ''
    updateFilterState({
      'filter[programme]': programmeId,
      'filter[series]': '',
      'filter[asset-category]': '',
      'filter[file-type]': '',
      'filter[language]': '',
      'filter[gallery]': '',
    })
  }

  const updateFilterState = (newFilter) => {
    setPageNumber(1)
    setSelectAllIsChecked(false)
    setFilterState((currState) => ({
      ...currState,
      ...newFilter
    }))
  }

  const downloadProgressRef = useRef()
  useEffect(() => {
    if (downloadProgressRef?.current) {
      let downloadMessage = downloadText
      if (downloadText === DOWNLOAD_IN_PROGRESS) {
        downloadMessage += `<div> ${fileSizeString(amountDownloaded)} </div>`
      }
      //@ts-ignore
      downloadProgressRef.current.innerHTML = downloadMessage
    }
  }, [downloadText, amountDownloaded])

  useEffect(() => {
    if (downloadInProgress) {
      modalState.showModal(() => {
        return (
          <Modal customContent={true} >
            <div className="my-assets__downloading-wrapper">
              <Icon width="21" height="20" id="i-download" classes="button__icon" />
              <div className="my-assets__downloading-progress" ref={downloadProgressRef} >
                {downloadText}
              </div>
            </div>
          </Modal>
        )
      })
    } else {
      modalState.hideModal()
    }
  }, [downloadInProgress])

  return (
    <div className="my-assets">
      <div className="container">
        <div className="my-assets__contents">
          <div className="my-assets__controls">
            <div className="my-assets__search-input">
              <SearchInput
                value={keywords || ''}
                searchIconProps={{
                  width: 30,
                  height: 30
                }}
                onChange={(value) => {
                  if (pageNumber > 1) {
                    setPageNumber(1)
                  }
                  setKeywords(value)
                }}
              />
            </div>
            {user && !myAssetsOnlyDisabled &&
              <div className="my-assets__search-checkbox">
                <Checkbox
                  label={`Search My Restricted Assets Only`}
                  id={'my-assets-only'}
                  onChange={({target}) => setMyAssetsOnly(target.checked)}
                  checked={myAssetsOnly}
                />
              </div>
            }
          </div>
          <div className="my-assets__filters">
            <Filters
              programme={programme}
              meta={meta}
              selectedProgramme={selectedProgramme}
              setSelectedProgramme={setSelectedProgramme}
              filterState={filterState}
              onFilterChanged={updateFilterState}
              resetFilters={resetFilters}
            />
          </div>
          <div className="my-assets__list" ref={assetListRef}>
            {renderDownloadControls()}
            <AssetMaterialList
              resources={assets}
              markAssetForDownload={markAssetForDownload}
            />
          </div>
          {(totalPages > 1 || assets?.length >= pageSize) && (
            <Paginator
              currentPage={ pageNumber }
              totalPages={ totalPages }
              onChange={ (page) => {
                setPageNumber(parseInt(page))
                scrollTopOfList()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

const enhance = compose(
  withTheme,
  withUser,
  withModalRenderer,
)

export default enhance(MyAssets)