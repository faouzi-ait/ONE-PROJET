import React, { useEffect, useState } from 'react'

import { createFilterOptions, SelectorPropsType } from 'javascript/views/virtual-screening/host/video-asset-search'
import { retrieveFileName } from 'javascript/utils/generic-tools'
import useMediaQuery from 'javascript/utils/hooks/use-media-query'
import useResource from 'javascript/utils/hooks/use-resource'
import useTheme from 'javascript/utils/theme/useTheme'

import Carousel from 'javascript/components/carousel'
import EmptySelection from 'javascript/views/virtual-screening/host/empty-selection'
import Icon from 'javascript/components/icon'

export interface AssetPreviewType {
  id: string
  name: string
  url: string
  restricted: boolean
}

interface Props {
  filterBy: string
  renderFilter: (filterOptions: any) => JSX.Element
  selectorProps: SelectorPropsType
}

const VirtualPdfSelector: React.FC<Props> = ({
  filterBy,
  renderFilter,
  selectorProps,
}) => {

  const { localisation } = useTheme()
  const largeScreen = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)')
  const programmeResource = useResource('programme')
  const assetMaterialResource = useResource('asset-material-search-result')
  const [filterOptions, setFilterOptions] = useState(null)
  const [assets, setAssets] = useState<AssetPreviewType[]>([])

  const {
    handleViewportChange,
    meetingIsLive,
    presentationPdf,
    selectedProgramme
  } = selectorProps

  useEffect(() => {
    if (selectedProgramme) {
      Promise.all([
        programmeResource.findOne(selectedProgramme.id, {
          fields: {
            'programmes': 'pdf-url,pdf-name,restricted,title',
          },
        }),
        assetMaterialResource.findAll({
          include: 'asset-material,asset-material.asset-items',
          fields: {
            'asset-material-search-results': 'name,asset-material',
            'asset-materials': 'name,asset-items,restricted,programme-name,series-name',
            'asset-items': 'file,file-identifier'
          },
          filter: {
            'programme': selectedProgramme.id,
            'file-type': 'pdf'
          },
        })
      ])
      .then((assetResponses) => {
        const programmeAsset = assetResponses[0]['pdf-url'] === null ? false : {
          id: `programme_${assetResponses[0]['id']}`,
          name: assetResponses[0]['pdf-name'] || retrieveFileName(assetResponses[0]['pdf-url']),
          url: assetResponses[0]['pdf-url'],
          restricted: assetResponses[0]['restricted'],
          filterable: assetResponses[0]['title']
        }
        const assetMaterialAssets = (assetResponses[1] || []).map((amsr) => {
          const assetMaterial = amsr['asset-material']
          const url = assetMaterial['asset-items'][0]?.file.url
          if (!url || !assetMaterial.name) return false
          return {
            id: assetMaterial['id'],
            name: assetMaterial['name'],
            url,
            restricted: assetMaterial['restricted'],
            'series-name': assetMaterial['series-name'],
            filterable: assetMaterial['series-name'] || assetMaterial['programme-name'],
          }
        })
        const pdfs = [programmeAsset, ...assetMaterialAssets].filter(Boolean)
        const {items, options} = createFilterOptions(pdfs, 'filterable')
        setFilterOptions(options)
        setAssets(items)
      })
    }
  }, [selectedProgramme])

  const renderAsset = (asset) => {
    const seriesName = asset['series-name'] || ''
    return (
      <div className={['virtual-asset-search__pdf-asset', presentationPdf?.id === asset.id && 'selected'].filter(Boolean).join(' virtual-asset-search__pdf-asset--')}>
        <div className="virtual-asset-search__pdf-buttons">
          {meetingIsLive && (
            <div className={'virtual-asset-search__present-button'}>
              <button
                type="button"
                onClick={() => handleViewportChange('pdf')(asset)}
              >
                <Icon id="i-present-video" />
              </button>
            </div>
          )}
          <div className={'virtual-asset-search__view-pdf-button'}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                window.open(asset.url)
              }}
            >
              <Icon id="i-view-eye" />
            </button>
          </div>
        </div>
       <div className="virtual-asset-search__titles">
          <h1
            className={['virtual-asset-search__titles-name', asset.name?.length > 25 && 'ellipsis'].filter(Boolean).join(' virtual-asset-search__titles-name--')}
            data-title={asset.name}
          >
            <span>{asset.name}</span>
          </h1>
          {seriesName &&
            <div
              className={['virtual-asset-search__titles-desc', seriesName.length > 25 && 'ellipsis'].filter(Boolean).join(' virtual-asset-search__titles-desc--')}
              data-title={seriesName}
            >
              {seriesName}
            </div>
          }
          {asset.restricted && (
            <div className="programme__strip">{localisation.restricted.upper}</div>
          )}
        </div>
      </div>
    )
  }

  let assetsToRender = assets || []
  if (filterBy !== 'all') {
    assetsToRender = assetsToRender.filter((pdf) => pdf['filterable'] === filterBy)
  }
  return (
    <>
      {renderFilter(filterOptions)}
      {assets?.length ? (
        <Carousel
          options={{
            arrows: true,
            scrollBar: true,
            slidesToShow: largeScreen ? 3 : 4,
            groups: true,
          }}
        >
          {assetsToRender.map(renderAsset)}
        </Carousel>
      ) : (
        <EmptySelection message={`There are no Assets available to share, try selecting a ${localisation.programme.upper} with pdf assets.`} />
      )}
    </>
  )
}

export default VirtualPdfSelector
