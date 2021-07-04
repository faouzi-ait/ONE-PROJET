import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import styled from 'styled-components'

import withTheme from 'javascript/utils/theme/withTheme'
import useResource from 'javascript/utils/hooks/use-resource'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

import breakpoint from 'javascript/utils/theme/breakpoint'
import filterClientVariables from 'javascript/containers/filters/filter.variables'

// Components
import AsyncSelect from 'javascript/components/async-select'
import Button from 'javascript/components/button'
import CustomCheckbox from 'javascript/components/custom-checkbox'
import CachedMultiSelect from 'javascript/components/cached-multi-select'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import { ProgrammesAutosuggest } from 'javascript/utils/hooks/use-programmes-autosuggest'

// Types
import { ProgrammeType } from 'javascript/types/ModelTypes'
import { SeriesType } from 'javascript/utils/theme/types/ApiLocalisationType'

interface FilterStateType {
  [key: string]: string
}

interface Props {
  filterState: FilterStateType
  meta: any
  onFilterChanged: (filterState: any) => void
  programme?: ProgrammeType
  selectedProgramme: ProgrammeType
  setSelectedProgramme: (selectedProgramme: ProgrammeType) => void
  resetFilters: () => void
  token?: string
  theme: CustomThemeType
}


const AssetMaterialFilters = ({
  filterState,
  meta,
  onFilterChanged,
  programme = null,
  selectedProgramme,
  setSelectedProgramme,
  resetFilters,
  token,
  theme,
}: Props) => {
  const [seriesOptions, setSeriesOptions] = useState([])
  const [episodeOptions, setEpisodeOptions] = useState([])
  const [assetCategoryOptions, setAssetCategoryOptions] = useState([])
  const [fileTypeOptions, setFileTypeOptions] = useState([])
  const [languageOptions, setLanguageOptions] = useState([])

  const filterCV = useClientVariables(filterClientVariables)

  const stringify = (values = []) => {
    return JSON.stringify(values.sort())
  }

  useEffect(() => {
    setFileTypeOptions((meta['file-types'] || []).map((fileType) => ({
      value: fileType,
      label: fileType
    })))
  }, [ stringify(meta['file-types']) ])

  useEffect(() => {
    getAssetCategories((meta['asset-category-id'] || []).join(','))
  }, [ stringify(meta['asset-category-id']) ])

  const assetCategoryResource = useResource('asset-category')
  const getAssetCategories = (categoryIds) => {
    if (categoryIds.length) {
      assetCategoryResource.findAll({
        fields: {
          'asset-category': 'name'
        },
        'filter[id]': categoryIds,
        ...(token && { token })
      })
      .then((response) => {
        setAssetCategoryOptions(createSelectOptions(response))
      })
    } else {
      setAssetCategoryOptions([])
    }
  }

  useEffect(() => {
    getLanguages((meta['language-ids'] || []).join(','))
  }, [ stringify(meta['language-ids']) ])

  const languageResource = useResource('language')
  const getLanguages = (languageIds) => {
    if (languageIds.length) {
      languageResource.findAll({
        fields: {
          'language': 'name'
        },
        'filter[id]': languageIds,
        ...(token && { token })
      })
      .then((response) => {
        setLanguageOptions(createSelectOptions(response))
      })
    } else {
      setLanguageOptions([])
    }
  }

  useEffect(() => {
    getSeries((meta['series-id'] || []).join(','))
  }, [ stringify(meta['series-id']) ])

  const seriesResource = useResource('series')
  const getSeries = (seriesIds) => {
    if (seriesIds.length) {
      seriesResource.findAll({
        fields: {
          'series': 'name'
        },
        'filter[id]': seriesIds,
        ...(token && { token })
      })
      .then((response) => {
        setSeriesOptions(createSelectOptions(response))
      })
    } else {
      setSeriesOptions([])
    }
  }

  useEffect(() => {
    getEpisodes((meta['episode-ids'] || []).join(','))
}, [ stringify(meta['episode-ids']) ])

  const episodeResource = useResource('episode')
  const getEpisodes = (episodeIds) => {
    if (episodeIds.length) {
      episodeResource.findAll({
        fields: {
          'episode': 'name'
        },
        'filter[id]': episodeIds
      })
      .then((response) => {
        setEpisodeOptions(createSelectOptions(response))
      })
    } else {
      setEpisodeOptions([])
    }
  }

  const createSelectOptions = (resources = []) => resources.map((resource) => ({
    value: resource.id,
    label: resource.name,
    resource
  }))

  const handleFilterChange = (filterName) => (selectedValues) => {
    onFilterChanged({ [filterName]: selectedValues })
  }

  return (
    <form className="form" onSubmit={(e) => e.preventDefault() }>
      <FilterHeading>Filters</FilterHeading>
      <FilterGrid isShowingProgramme={!programme} >
        {!programme && (
          <FilterRow>
            <label className="form__label">{pluralize(theme.localisation.programme.upper)}</label>
            <ProgrammesAutosuggest
              buildParams={(keywords) => {
                const params = {
                  filter: {
                    keywords,
                  }
                }
                if (meta['programme-id'] && meta['programme-id'].length) {
                  params.filter['ids'] = meta['programme-id'].join(',')
                }
                return params
              }}
              onLoad={(options, callback) => callback({ options })}
            >
              {({ programmeSuggestions, searchProgrammes, value, setValue }) => {
                return (
                  <AsyncSelect
                    options={programmeSuggestions}
                    loadOptions={searchProgrammes}
                    value={selectedProgramme}
                    onChange={(programme: ProgrammeType) => {
                      setSelectedProgramme(programme)
                      onFilterChanged({'filter[episode]' : null})
                      onFilterChanged({'filter[series]' : null})
                      onFilterChanged({'filter[programme]': programme?.id})
                    }}
                    labelKey="title-with-genre"
                  />
                )
              }
              }
            </ProgrammesAutosuggest>
          </FilterRow>
        )}

        {(selectedProgramme || programme) &&
          <FilterRow>
            <label className="form__label">{pluralize(theme.localisation.series.upper)}</label>
            <CachedMultiSelect
              options={filterState['filter[programme]'] ? seriesOptions : []}
              onChange={(series: SeriesType) => {
                onFilterChanged({'filter[episode]' : null})
                onFilterChanged({'filter[series]': series})
              }}
              value={filterState['filter[series]']}
            />
          </FilterRow>
        }

        {filterState['filter[series]'] &&
          <FilterRow>
            <label className="form__label">{pluralize(theme.localisation.episodes.upper)}</label>
            <CachedMultiSelect
              onChange={handleFilterChange('filter[episode]')}
              options={filterState['filter[series]'] ? episodeOptions : []}
              value={filterState['filter[episode]']}
            />
          </FilterRow>
        }

        <FilterRow>
          <label className="form__label">Category</label>
          <CachedMultiSelect
            onChange={handleFilterChange('filter[asset-category]')}
            options={assetCategoryOptions}
            value={filterState['filter[asset-category]']}
          />
        </FilterRow>

        <FilterRow>
          <label className="form__label">Type</label>
          <CachedMultiSelect
            onChange={handleFilterChange('filter[file-type]')}
            options={fileTypeOptions}
            value={filterState['filter[file-type]']}
          />
        </FilterRow>

        { theme.features.assetLanguages &&
          <FilterRow>
            <label className="form__label">Language</label>
            <CachedMultiSelect
              onChange={handleFilterChange('filter[language]')}
              options={languageOptions}
              value={filterState['filter[language]']}
            />
          </FilterRow>
        }

        <FilterRow>
          <CustomCheckbox
            checked={filterState['filter[gallery]']}
            label="Gallery Only"
            onChange={({target}) => {
              handleFilterChange('filter[gallery]')(target.checked ? true : null)
            }}
            id="gallery"
          />
        </FilterRow>
      </FilterGrid>


      <div className="programme-filters__actions">
        <Button className={filterCV.clearFiltersButtonClasses} type="button" onClick={resetFilters}>
          Clear filters
        </Button>
      </div>

    </form>
  )
}

export default withTheme(AssetMaterialFilters)

const FilterHeading = styled.h2`
  margin-bottom: 0px;
  ${breakpoint('large')`
    text-align: center;
  `}
`

const FilterGrid = styled.div<{ isShowingProgramme: boolean }>`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  ${breakpoint('large')`
    ${props =>  props.isShowingProgramme ? `height: 370px;` : `height: 250px;`}
  `}
  ${breakpoint('medium')`
    height: 100%;
  `}
`

const FilterRow = styled.div`
  margin: 20px 0px;
  width: 100%;
  ${breakpoint('large')`
    width: 45%;
    .custom-checkbox {
      position: relative;
      top: 50px;
    }
  `}
  ${breakpoint('medium')`
    width: 100%;
  `}
`