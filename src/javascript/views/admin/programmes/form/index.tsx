// React
import React, { useEffect } from 'react'
import pluralize from 'pluralize'
import moment from 'moment'

import allVariables from './variables'

import { ReadOnlyAttrs } from 'javascript/config/features'
import compose from 'javascript/utils/compose'
import useResource from 'javascript/utils/hooks/use-resource'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'
import withTheme from 'javascript/utils/theme/withTheme'

// Store
import ResourceStore from 'javascript/stores/programmes'
import { StoreErrors } from 'javascript/stores/helper'

// Actions
import ResourceActions from 'javascript/actions/programmes'
import CustomAttributeActions from 'javascript/actions/custom-attributes'
import ProgrammeTalentActions from 'javascript/actions/programme-talents'

// Services
import TalentService from 'javascript/services/talents'

// Components
import { AsyncSearchVideo, makeVideoName } from 'javascript/components/async-search-videos'
import Button from 'javascript/components/button'
import DatePicker from 'javascript/components/datepicker'
import Editor from 'javascript/components/wysiwyg'
import FileUploader from 'javascript/components/file-uploader'
import FormControl from 'javascript/components/form-control'
import NavLink from 'javascript/components/nav-link'
import RelatedProgrammes from 'javascript/components/related-programmes'
import Select from 'react-select'
import { ProgrammesAutosuggest } from 'javascript/utils/hooks/use-programmes-autosuggest'
import AsyncSelect from 'javascript/components/async-select'

// Types
import {
  ProgrammeType,
  GenreType,
  QualityType,
  LanguageType,
  ProgrammeTypeType,
  CustomAttributeType,
  CustomAttributeTypeType,
  VideoType,
  VideoSearchResultType,
  ProgrammeTalentType,
  TalentType,
  TalentTypeType,
  CatalogueType,
} from 'javascript/types/ModelTypes'
import { RecursivePartial, CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  programme: ProgrammeType
  programmeTypes: ProgrammeTypeType[]
  genres: GenreType[]
  qualities: QualityType[]
  languages: LanguageType[]
  videos: VideoType[]
  types: CustomAttributeTypeType[]
  talentTypes: TalentTypeType[]
  catalogues: CatalogueType[]
  theme: CustomThemeType
  pageState: {
    errored: boolean
    isLoading: boolean
  }
  programmeFormCV: any
}

interface State {
  talents: RecursivePartial<ProgrammeTalentType>[]
  errors?: StoreErrors
  loading?: boolean
  programme: ProgrammeType | Partial<ProgrammeType>
  'production-start': ProgrammeType['production-start']
  'production-end': ProgrammeType['production-end']
  selectedGenres: GenreType[]
  selectedQualities: QualityType[]
  data: { key: string; value: string }[]
  selectedLanguages: LanguageType[]
  selectedCatalogues: CatalogueType[]
  selectedProgrammeType: ProgrammeTypeType
  searchResults: TalentType[]
  isEditing: boolean
  'custom-attributes': CustomAttributeType[]
  updatable: boolean
  startMonth?: string
  startYear?: string
  endMonth?: string
  endYear?: string
  assetPdf: {
    file: boolean,
    path: string
  },
  format: boolean
}

class ProgrammesForm extends React.Component<Props, State> {

  constructor(props) {
    super(props)
    const { programme, theme } = this.props
    this.state = {
      programme: {
        active: true,
        'data-sync': true,
        restricted: theme.features.restrictions.programmeDefault,
        'show-related-programmes': theme.features.relatedProgrammes.default
      },
      'production-start': '',
      'production-end': '',
      selectedGenres: [],
      selectedQualities: [],
      selectedLanguages: [],
      selectedCatalogues: [],
      selectedProgrammeType: null,
      data: [],
      isEditing: false,
      loading: false,
      errors: null,
      'custom-attributes': [],
      talents: [],
      searchResults: [],
      updatable: true,
      assetPdf: {
        file: false,
        path: ''
      },
      format: false
    }
    if (programme) {
      this.state = {
        programme: {
          ...programme,
          'video-banner': programme['video-banner']
            ? {
                ...programme['video-banner'],
                name: makeVideoName(programme['video-banner']),
              }
            : undefined,
        },
        'production-start': programme['production-start'],
        'production-end': programme['production-end'],
        selectedGenres: programme['genres']?.map(({ id }) => id),
        selectedQualities: programme['qualities']?.map(({ id }) => id),
        data: programme['data'] && Object.keys(programme['data']).map(key => ({
          key: key,
          value: programme['data'][key],
        })),
        selectedLanguages: programme['languages']?.map(language => language.id),
        selectedProgrammeType: programme['programme-type'],
        selectedCatalogues: (programme['catalogues'] || []).map(({ id }) => id),
        isEditing: true,
        'custom-attributes': programme['custom-attributes'],
        talents: programme['programme-talents'] || [],
        searchResults: [],
        updatable: this.props.programmeFormCV.updatableUsed ? programme['updatable'] : true,
        assetPdf: {
          file: !!(programme['pdf-url']),
          path: programme['pdf-url'] || ''
        },
        format: programme['format-programmes']?.length > 0
      }
    }

  }

  searchTimer: any

  componentWillMount() {
    ResourceStore.on('error', this.retrieveErrors)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('error', this.retrieveErrors)
  }

  retrieveErrors = () => {
    this.setState({
      errors: ResourceStore.getErrors(),
      loading: false,
    })
  }

  renderErrors = () => {
    if (this.state.errors) {
      return (
        <ul className="cms-form__errors">
          {Object.keys(this.state.errors).map((key, i) => {
            const error = this.state.errors[key]
            return (
              <li key={i}>
                {key.charAt(0).toUpperCase() + key.slice(1)} {error}
              </li>
            )
          })}
        </ul>
      )
    }
  }

  resourceKeys = () => {
    const keys = [
      'active',
      'data-sync',
      'introduction',
      'production-end',
      'production-start',
      'title',
      'description',
      'genres',
      'programme-type',
      'qualities',
      'manual-number-of-series',
      'manual-number-of-episodes',
      'data',
      'languages',
      'pdf',
      'promo-video-id',
      'publish-date',
      'show-related-programmes',
      'related-programmes',
      'release-date',
      'video-banner',
      'pdf-name',
      'restricted',
      'visibility',
      'format',
      'format-programmes',
    ]
    if (this.props.programmeFormCV.createdDate) {
      keys.push('created-at')
    }
    if (this.props.theme.features.customCatalogues.enabled) {
      keys.push('catalogues')
    }
    if (this.props.theme.features.programmeSlugs.enabled){
      keys.push('slug')
    }
    return keys
  }

  saveResource = (saveType: 'update' | 'create') => (e) => {
    e.preventDefault()
    this.setState({ loading: true })

    let { programme, data } = this.state
    const keys = saveType === 'update' ? ['id', ...this.resourceKeys()] : this.resourceKeys()

    if (!this.state.updatable) {
      keys.splice(keys.indexOf('active'), 1)
    }

    programme['data'] = data.reduce((obj, item) => {
      obj[item.key] = item.value
      return obj
    }, {})

    const resolvedProgramme = Object.keys(programme)
      .filter(key => keys.includes(key))
      .reduce((obj, key) => {
        obj[key] = programme[key]
        return obj
      }, {})

    if (programme['remove-pdf']) {
      resolvedProgramme['remove-pdf'] = programme['remove-pdf']
    }

    if(this.state.format) {
      resolvedProgramme['format'] = null
    } else {
      resolvedProgramme['format-programmes'] = []
    }

    const resourcesToSave = [
      resolvedProgramme,
      this.state['custom-attributes'],
      this.state.talents,
    ]
    if (saveType === 'update') {
      ResourceActions.updateResource(...resourcesToSave)
    } else {
      ResourceActions.createResource(...resourcesToSave)
    }
  }

  handleSlugChange = e => {
    const update = this.state.programme
    update.slug = e.target.value.toLowerCase().replace(/[^\w\s\-]/gi, '').replace(/\s+/g, '-')
    this.setState({
      programme: update
    })
  }

  handleTitleChange = (e) => {
    const update = this.state.programme
    update[e.target.name] = e.target.value
    update.slug = e.target.value.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-')
    this.setState({
      programme: update
    })
  }

  handleInputChange = e => {
    let update = this.state.programme
    update[e.target.name] = e.target.value

    this.setState({
      programme: update,
    })
  }

  updateRelatedProgrammes = relatedProgrammes => {
    const { programme } = this.state
    this.setState({
      programme: {
        ...programme,
        'related-programmes': relatedProgrammes?.map(programme => {
          return { type: 'programmes', id: programme.id }
        }),
      },
    })
  }

  handleCheckboxChange = type => {
    this.setState(({ programme }) => ({
      programme: Object.assign({}, programme, {
        [type]: !programme[type],
      }),
    }))
  }

  updateDescription = value => {
    this.handleInputChange({ target: { name: 'description', value } })
  }

  handleCreationChange = date => {
    let update = this.state.programme
    update['created-at'] = date
    this.setState({
      programme: update,
    })
  }

  updateResourceDate = (date, dateName) => {
    this.setState(state => {
      const { programme } = state
      programme[dateName] = date
        ? date
            .toDate()
            .toString()
        : null
      return {
        ...state,
        programme,
      }
    })
  }

  handleGenresChange = values => {
    const { programme } = this.state
    programme.genres = this.props.genres.filter(genre =>
      values.split(',').includes(genre.id),
    )
    this.setState({
      selectedGenres: values,
      programme,
    })
  }

  handleLanguageChange = values => {
    const update = this.state.programme
    const languages = []
    values.map(val => {
      this.props.languages?.map(language => {
        if (val.value == language.id) {
          languages.push(language)
        }
      })
    })
    update.languages = languages
    this.setState({
      selectedLanguages: values,
      programme: update,
    })
  }

  handleProgrammeTypeChange = value => {
    const update = this.state.programme
    const selectedProgrammeType = value?.programmeType || null
    update['programme-type'] = selectedProgrammeType
    this.setState({
      selectedProgrammeType: selectedProgrammeType,
      programme: update,
    })
  }

  handleCataloguesChange = values => {
    const { programme } = this.state
    programme.catalogues = this.props.catalogues.filter(catalogue =>
      values.split(',').includes(catalogue.id),
    )
    this.setState({
      selectedCatalogues: values,
      programme,
    })
  }

  handleFormatChange = value => {
    const update = this.state.programme
    update['format'] = value
    this.setState({
      programme: update,
    })
  }

  handleFormatProgrammeChange = values => {
    const update = this.state.programme
    update['format-programmes'] = values
    this.setState({
      programme: update,
    })
  }

  handleQualityChange = e => {
    let update = this.state.selectedQualities
    if (e.target.checked) {
      update.push(e.target.value)
    } else {
      update.forEach((quality, i) => {
        if (e.target.value == quality) {
          update.splice(i, 1)
        }
      })
    }
    this.setState({
      selectedQualities: update,
    })
    let programmeUpdate = this.state.programme
    let newQualities = []
    this.props.qualities.forEach(quality => {
      this.state.selectedQualities.forEach(selected => {
        if (selected == quality.id) {
          newQualities.push(quality)
        }
      })
    })
    programmeUpdate.qualities = newQualities
    this.setState({
      programme: programmeUpdate,
    })
  }

  renderGenres = genres => {
    const options = []
    genres
      .filter(genre => !genre['parent-id'])
      .map(genre => {
        options.push({
          ...genre,
          label: genre.name,
          value: genre.id,
        })
        genres
          .filter(sub => sub['parent-id'] == genre.id)
          .map(sub => {
            options.push({
              ...sub,
              label: `${genre.name} - ${sub.name}`,
              value: sub.id,
            })
          })
      })
    return (
      <Select
        options={options}
        value={this.state.selectedGenres}
        multi={true}
        onChange={this.handleGenresChange}
        simpleValue={true}
      />
    )
  }

  renderQualities = qualities => {
    let inputs = qualities.map(quality => {
      let isChecked = false
      if (this.state.programme.qualities) {
        this.state.programme.qualities.forEach(item => {
          if (item.id == quality.id) {
            isChecked = true
          }
        })
      }
      return (
        <div className="checkbox" key={quality.id}>
          <input
            type="checkbox"
            className="checkbox__input"
            id={quality.name}
            value={quality.id}
            checked={isChecked}
            onChange={this.handleQualityChange}
          />
          <label htmlFor={quality.name} className="checkbox__label">
            {quality.name}
          </label>
        </div>
      )
    })
    return <div className="cms-form__collection">{inputs}</div>
  }

  addAttribute = () => {
    // @ts-ignore
    this.setState({
      'custom-attributes': [
        ...this.state['custom-attributes'],
        {
          'custom-attribute-type': {
            id: null,
          },
          value: '',
          position: this.state['custom-attributes'].length,
          related: {
            id: this.state.programme.id,
            type: 'programmes',
          },
        },
      ] as CustomAttributeType[],
    })
  }

  addTalent = () => {
    this.setState({
      talents: [
        ...this.state['talents'],
        {
          'talent-type': {
            id: null,
          },
          talent: null,
          programme: {
            id: this.state.programme.id,
            type: 'programmes',
          },
        },
      ],
    })
  }

  renderLanguages = languages => {
    const options = languages.map(langugage => {
      return {
        value: langugage.id,
        label: langugage.name,
      }
    })
    return (
      <Select
        options={options}
        value={this.state.selectedLanguages}
        multi={true}
        onChange={this.handleLanguageChange}
      />
    )
  }

  renderCatalogues = (catalogues) => {
    const options = catalogues.map((catalogue) => {
      return {
        value: catalogue.id,
        label: catalogue.name,
      }
    })
    return (
      <Select
        options={options}
        value={this.state.selectedCatalogues}
        multi={true}
        simpleValue={true}
        onChange={this.handleCataloguesChange}
      />
    )
  }

  renderFormats = () => {
    const {format, programme} = this.state
    const {theme} = this.props
    return (
      <div style={{marginTop: '25px'}}>
        <FormControl modifiers={['start']} label="Format">
          <div className="checkbox">
            <input
              type="checkbox"
              name="is-format-programme"
              className="checkbox__input"
              id="is-format-programme"
              checked={format}
              onChange={() => {
                this.setState({
                  format: !format
                })
              }}
            />
            <label
              htmlFor="is-format-programme"
              className="checkbox__label"
            >{`${theme.localisation.programme.upper} is a format`}</label>
          </div>
        </FormControl>
        {this.state.format ? (
          <FormControl label={`Format ${pluralize(theme.localisation.programme.upper)}`}>
            <ProgrammesAutosuggest
              buildParams={(keywords) => ({
                filter: {
                  not_ids: [programme.id, this.state.programme['format-programmes'].map(s => s.id)].join(','),
                  formats: false,
                  'programmes-with-format': false,
                  keywords: encodeURIComponent(keywords)
                },
              })}
            onLoad={(options, callback) => callback({ options })}
          >
            {({ programmeSuggestions, searchProgrammes }) => (
              <AsyncSelect
                value={this.state.programme['format-programmes']}
                multi={true}
                onChange={this.handleFormatProgrammeChange}
                options={programmeSuggestions}
                loadOptions={searchProgrammes}
                placeholder="Type to search"
                labelKey="title-with-genre"
              />
            )}
          </ProgrammesAutosuggest>
          </FormControl>
        ) : (
          <FormControl label={`Format ${theme.localisation.programme.upper}`}>
            <ProgrammesAutosuggest
              buildParams={(keywords) => ({
                filter: {
                  not_ids: programme.id,
                  'programmes-with-format': false,
                  keywords: encodeURIComponent(keywords)
                },
              })}
            onLoad={(options, callback) => callback({ options })}
          >
            {({ programmeSuggestions, searchProgrammes }) => (
              <AsyncSelect
                value={this.state.programme.format}
                onChange={this.handleFormatChange}
                options={programmeSuggestions}
                loadOptions={searchProgrammes}
                placeholder="Type to search"
                labelKey="title-with-genre"
              />
            )}
          </ProgrammesAutosuggest>
          </FormControl>
        )}
      </div>
    )
  }

  renderProgrammeTypes = programmeTypes => {
    const options = programmeTypes.map(programmeType => {
      return {
        value: programmeType.id,
        label: programmeType.name,
        programmeType
      }
    })
    return (
      <Select
        options={options}
        value={this.state.selectedProgrammeType?.id}
        multi={false}
        onChange={this.handleProgrammeTypeChange}
      />
    )
  }

  searchForTalent = (search, callback) => {
    clearTimeout(this.searchTimer)
    if (search.length) {
      this.searchTimer = setTimeout(() => {
        TalentService.search(
          {
            fields: {
              talent: 'full-name',
            },
            page: {
              size: 10,
            },
            filter: {
              search_by_full_name: search,
            },
          },
          response => {
            this.setState(
              {
                searchResults: response,
              },
              () => {
                callback(null, {
                  options: this.state.searchResults.map(t => ({
                    ...t,
                    label: `${t['full-name']}`,
                    value: t.id,
                  })),
                })
              },
            )
          },
        )
      }, 300)
    }
  }

  renderAttributeValue = (a,i) => {
    const attrs = this.state['custom-attributes']
    const type = this.props.types.find(t => t.id === a['custom-attribute-type'].id)
    if(!ReadOnlyAttrs.includes(a['custom-attribute-type'].name)) {
      if(type && type['attribute-type'] === 'Boolean') {
        return (
          <div>
            <input
              type="checkbox"
              className="checkbox__input"
              id={`boolean-attribute${i}`}
              value={a.value}
              checked={a.value}
              onChange={({ target }) => {
                attrs[i].value = !a.value ? 1 : 0
                this.setState(() => ({
                  'custom-attributes': attrs,
                }))
              }}
            />
            <label
              htmlFor={`boolean-attribute${i}`}
              className="checkbox__label cms-form__label"
            ></label>
          </div>
        )
      } else if(type && type.config.limitValues) {
        return (
          <Select
            options={type.config.values
              .filter(v => {
                const match = this.state[
                  'custom-attributes'
                ].find(
                  a =>
                    a['custom-attribute-type'].id ===
                      type.id && a.value === v,
                )
                if (match && match.value !== a.value) {
                  return false
                } else {
                  return v
                }
              })
              .map(v => ({ label: v, value: v }))}
            value={a.value}
            clearable={false}
            simpleValue={true}
            onChange={v => {
              attrs[i].value = v
              this.setState(() => ({
                'custom-attributes': attrs,
              }))
            }}
            required
          />
        )
      } else if (type && type['attribute-type'] === 'Date') {
        return (
          <DatePicker
            selected={a.value}
            dateFormat={this.props.theme.features.formats.shortDate} onChange={e => {
              attrs[i].value = e.toDate().toString()
              this.setState(() => ({ 'custom-attributes': attrs }))
            }} />
        )
      } else {
        return (
          <input
            type={
              type && type['attribute-type'] === 'Integer'
                ? 'number'
                : 'text'
            }
            value={a.value}
            placeholder={
              type && type['attribute-type'] === 'Integer'
                ? 'Attribute value (number)'
                : 'Attribute value'
            }
            className="cms-form__input"
            onChange={({ target }) => {
              attrs[i].value =
                type['attribute-type'] === 'Integer'
                  ? Number(target.value)
                  : target.value
              this.setState(() => ({
                'custom-attributes': attrs,
              }))
            }}
            required
          />
        )
      }
    } else {
      return (
        <input
          type="text"
          readOnly
          className="cms-form__input"
          value={a.value}
        />
      )
    }
  }

  createdAtDate = () => {
    const { programme } = this.state
    return programme['created-at'] || moment(new Date()).toDate().toString()
  }

  render() {
    if (this.props.pageState.isLoading) return null

    const { programme, isEditing, loading } = this.state
    const {
      genres,
      qualities,
      programmeTypes,
      languages,
      theme,
      catalogues,
    } = this.props
    const attrs = this.state['custom-attributes']
    const { talents } = this.state
    let submitAction = isEditing ? this.saveResource('update') : this.saveResource('create')
    let buttonText = isEditing
      ? `Save ${theme.localisation.programme.upper}`
      : `Create ${theme.localisation.programme.upper}`
    let buttonClasses = loading
      ? 'button button--filled button--loading'
      : 'button button--filled'

    const easytrack =
      theme.features.rightsManagement &&
      theme.features.rightsManagement.includes('easytrack')

    return (
      <div className="container">
        <form className="cms-form cms-form--large" onSubmit={submitAction}>
          <h3 className="cms-form__title">
            {theme.localisation.programme.upper} Details
          </h3>
          <FormControl
            type="text"
            label={`Title`}
            name="title"
            value={programme['title']}
            required
            onChange={this.handleTitleChange}
          />
          {theme.features.programmeSlugs.enabled &&
            <FormControl
              type="text"
              label={`Slug`}
              name="slug"
              value={programme['slug']}
              required
              onChange={this.handleSlugChange}
            />
          }
          {isEditing &&
            <FormControl
              key="external_id"
              type="text"
              label={easytrack ? 'EasyTrack ID' : 'External ID'}
              name="external-id"
              readonly
              value={programme['external-id'] || ''}
            />
          }
          <FormControl modifiers={['start']} label="Status">
            <div className="grid">
              <div className="checkbox">
                <input
                  type="checkbox"
                  name="active"
                  className="checkbox__input"
                  id="active"
                  checked={programme['active']}
                  onChange={() => this.handleCheckboxChange('active')}
                  disabled={Boolean(!this.state.updatable)}
                />
                <label htmlFor="active" className="checkbox__label">
                  Active
                </label>
              </div>
              <div className="checkbox">
                <input
                  type="checkbox"
                  name="restricted"
                  className="checkbox__input"
                  id="restricted"
                  checked={programme['restricted']}
                  onChange={() => this.handleCheckboxChange('restricted')}
                />
                <label htmlFor="restricted" className="checkbox__label">
                  Restricted
                </label>
              </div>
            </div>
          </FormControl>
          { theme.features.dataSync &&
            <FormControl modifiers={['start']} label="Data Sync">
              <div className="checkbox">
                <input
                  type="checkbox"
                  name="data-sync"
                  className="checkbox__input"
                  id="data-sync"
                  checked={programme['data-sync']}
                  onChange={()=>this.handleCheckboxChange('data-sync')}
                />
                <label htmlFor="data-sync" className="checkbox__label"></label>
              </div>
            </FormControl>
          }
          <FormControl label="Publish Date">
            <DatePicker
              selected={programme['publish-date']}
              onChange={e => {
                this.updateResourceDate(e, 'publish-date')
              }}
              dateFormat={theme.features.formats.mediumDate}
              isClearable={Boolean(programme['publish-date'])}
              showYearDropdown
            />
          </FormControl>
          <FormControl label="Visibility">
            <Select
              options={[
                {value: 'visible', label: 'All Devices'},
                {value: 'web_only', label: 'Web Only'},
                {value: 'app_only', label: 'App Only'}
              ]}
              onChange={value =>
                this.handleInputChange({
                  target: { name: 'visibility', value },
                })
              }
              name="visibility"
              value={programme['visibility'] || 'visible'}
              clearable={false}
              simpleValue={true}
            />
          </FormControl>
          {theme.features.customCatalogues.enabled && (
            <FormControl label={pluralize(theme.localisation.catalogue.upper)}>
              {this.renderCatalogues(catalogues)}
            </FormControl>
          )}
          <FormControl
            type="textarea"
            label="Introduction"
            name="introduction"
            value={programme['introduction']}
            maxlength="255"
            onChange={this.handleInputChange}
          />
          <FormControl label="Description" modifiers={['tall']} required>
            <Editor
              value={programme['description'] || ''}
              onChange={this.updateDescription}
            />
          </FormControl>
          <FormControl label={pluralize(theme.localisation.genre.upper)}>
            {this.renderGenres(genres)}
          </FormControl>

          {theme.features.programmeTypes.enabled && (
            <FormControl label={theme.localisation.programmeType.upper}>
              {this.renderProgrammeTypes(programmeTypes)}
            </FormControl>
          )}

          <FormControl
            type="text"
            label={`Number of ${pluralize(theme.localisation.series.upper)}`}
            name="manual-number-of-series"
            value={
              programme.hasOwnProperty('manual-number-of-series')
                ? programme['manual-number-of-series']
                : programme['number-of-series']
            }
            onChange={this.handleInputChange}
          />
          <FormControl
            type="text"
            label="Number of Episodes"
            name="manual-number-of-episodes"
            value={
              programme.hasOwnProperty('manual-number-of-episodes')
                ? programme['manual-number-of-episodes']
                : programme['number-of-episodes']
            }
            onChange={this.handleInputChange}
          />
          {programme.id && theme.features.videos.promo && (
            <FormControl label={`Promo ${theme.localisation.video.lower}`}>
              <Select
                options={this.props.videos.map(v => ({
                  value: Number(v.id),
                  label: v.name,
                }))}
                onChange={value =>
                  this.handleInputChange({
                    target: { name: 'promo-video-id', value },
                  })
                }
                name="promo-video-id"
                value={programme['promo-video-id']}
                clearable={true}
                simpleValue={true}
              />
            </FormControl>
          )}
          {programme.id && theme.features.videos.videoBanners && (
            <FormControl label="Banner video">
              <AsyncSearchVideo
                onChange={(video: VideoSearchResultType) => {
                  this.handleInputChange({
                    target: {
                      name: 'video-banner',
                      value: (video || { video: null }).video,
                    },
                  })
                }}
                value={programme['video-banner']}
                theme={theme}
              />
            </FormControl>
          )}
          {this.props.programmeFormCV.createdDate && (
            <FormControl label="Created date">
              <DatePicker
                onChange={this.handleCreationChange}
                selected={this.createdAtDate()}
                dateFormat={theme.features.formats.longDate}
              />
            </FormControl>
          )}
          <h3 className="cms-form__title">Production Details</h3>
          <FormControl label="Production Start">
            <DatePicker
              selected={programme['production-start']}
              onChange={e => {
                this.updateResourceDate(e, 'production-start')
              }}
              dateFormat={theme.features.formats.mediumDate}
              isClearable={Boolean(programme['production-start'])}
              showYearDropdown
            />
          </FormControl>
          <FormControl label="Production End">
            <DatePicker
              selected={programme['production-end']}
              onChange={e => {
                this.updateResourceDate(e, 'production-end')
              }}
              dateFormat={theme.features.formats.mediumDate}
              isClearable={Boolean(programme['production-end'])}
              showYearDropdown
            />
          </FormControl>
          <FormControl label="Languages">
            {this.renderLanguages(languages)}
          </FormControl>
          <FormControl label={pluralize.plural(theme.localisation.quality.upper)}>
            {this.renderQualities(qualities)}
          </FormControl>
          {theme.features.programmeReleaseDate.enabled &&
            <FormControl
              type="date"
              label="Release Date"
              selected={programme['release-date']}
              onChange={e =>  this.updateResourceDate(e, 'release-date')}
              dateFormat={theme.features.formats.mediumDate}
              isClearable={true}
              showYearDropdown
            />
          }
          {theme.features.programmeFormats.enabled &&
            this.renderFormats()
          }


          <h3 className="cms-form__title">PDF Upload</h3>

          <FileUploader
            title={'PDF Asset'}
            name="asset-pdf"
            fileType={'PDF'}
            acceptedFileTypes={['application/pdf']}
            previewImage={false}
            fileSrc={this.state.assetPdf.file}
            filePath={this.state.assetPdf.path}
            pathIsLink={true}
            deleteConfirmation={false}
            onRemoveFile={() => {
              const programme = Object.assign({}, this.state.programme)
              programme['pdf'] = null
              programme['remove-pdf'] = true
              this.setState({
                programme,
                assetPdf: {
                  file: false,
                  path: ''
                }
              })

            }}
            onChange={(targetName, baseStr, file) => {
              const programme = Object.assign({}, this.state.programme)
              programme['pdf'] = baseStr
              programme['remove-pdf'] = ''
              this.setState({
                programme,
                assetPdf: {
                  file: true,
                  path: file.name
                }
              })
            }}
          />

          {this.state.assetPdf && this.state.assetPdf.file &&
            <FormControl
              type="text"
              label={'PDF Name'}
              name="pdf-name"
              value={programme['pdf-name']}
              onChange={this.handleInputChange}
            />
          }

          {theme.features.talents && (
            <>
              <h3 className="cms-form__title">
                {pluralize(theme.localisation.talent.upper)}
              </h3>
              <div>
                {talents.map((a, i) => {
                  return (
                    <div className="cms-form__group" key={i} style={{ margin: '0px 20px 20px'}}>
                       <div className="cms-form__group-actions">
                        <Button
                          type="button"
                          className="button button--smallest button--error"
                          onClick={() => {
                            if (a.id) {
                              ProgrammeTalentActions.deleteResource({ id: a.id })
                            }
                            this.setState(() => ({
                              talents: talents.filter((item, index) => i !== index)
                            }))
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                      <FormControl label={theme.localisation.talent.upper}>
                        <Select.Async
                          loadOptions={this.searchForTalent}
                          value={a['talent']}
                          clearable={false}
                          simpleValue={true}
                          onChange={v => {
                            talents[i]['talent'] = this.state.searchResults.filter((result) => {
                              return parseInt(result.id) === parseInt(v)
                            })[0]
                            this.setState(() => ({ talents: talents }))
                          }}
                          labelKey="full-name"
                          valueKey="id"
                          required
                        />
                      </FormControl>
                      <FormControl label={`${theme.localisation.talent.upper} Type`}>
                        <Select
                          options={this.props.talentTypes.map(t => ({...t, label: t.name, value: t.id}))}
                          value={a['talent-type'] && a['talent-type'].id}
                          clearable={false}
                          simpleValue={true}
                          onChange={v => {
                            talents[i]['talent-type'].id = v
                            this.setState(() => ({ talents: talents }))
                          }}
                          required
                        />
                      </FormControl>
                      <FormControl
                        type="textarea"
                        label={'Summary'}
                        outerStyle={{ width: '100%' }}
                        style={{ height: '70px' }}
                        value={a['summary']}
                        onChange={({target}) => {
                          talents[i].summary = target.value
                          this.setState(() => ({ talents }))
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="cms-form__actions">
                <Button
                  className="button button--small"
                  onClick={this.addTalent}
                  type="button"
                >
                  Add A New {theme.localisation.talent.upper}
                </Button>
              </div>
            </>
          )}

          <h3 className="cms-form__title">Custom Attributes</h3>
          <div className="cms-form__table">
            {(this.state['custom-attributes'] || []).map((a, i) => {
              return (
                <div className="cms-form__control" key={i}>
                  <div>
                    {!ReadOnlyAttrs.includes(
                      a['custom-attribute-type'].name,
                    ) ? (
                      <Select
                        options={this.props.types.map(t => ({
                          ...t,
                          label: t.name,
                          value: t.id,
                        }))}
                        value={a['custom-attribute-type'].id}
                        clearable={false}
                        simpleValue={true}
                        onChange={v => {
                          attrs[i]['custom-attribute-type'].id = v
                          attrs[i].value = ''
                          this.setState(() => ({ 'custom-attributes': attrs }))
                        }}
                        required
                      />
                    ) : (
                      <input
                        type="text"
                        readOnly
                        className="cms-form__input"
                        value={a['custom-attribute-type'].name}
                      />
                    )}
                  </div>
                  <div>{this.renderAttributeValue(a,i)}</div>
                  <div>
                    {!ReadOnlyAttrs.includes(
                      a['custom-attribute-type'].name,
                    ) && (
                      <Button
                        type="button"
                        className="button button--small button--filled button--danger"
                        onClick={() => {
                          if (a.id) {
                            CustomAttributeActions.deleteResource({ id: a.id })
                          }
                          this.setState(() => ({
                            'custom-attributes': attrs.filter(
                              (item, index) => i !== index,
                            ),
                          }))
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="cms-form__actions">
            <Button
              className="button button--small"
              onClick={this.addAttribute}
              type="button"
            >
              Add A New Attribute
            </Button>
          </div>
          <h3 className="cms-form__title">
            Related {pluralize(theme.localisation.programme.upper)}
          </h3>
          <FormControl modifiers={['start']}>
            <div className="checkbox">
              <input
                type="checkbox"
                name="show-related-programmes"
                className="checkbox__input"
                id="show-related-programmes"
                checked={
                  programme['show-related-programmes']
                }
                onChange={() => {
                  this.setState(({ programme }) => ({
                    programme: Object.assign({}, programme, {
                      'show-related-programmes': !programme[
                        'show-related-programmes'
                      ],
                    }),
                  }))
                }}
              />
              <label
                htmlFor="show-related-programmes"
                className="checkbox__label"
              >
                Show Related {pluralize(theme.localisation.programme.upper)}
              </label>
            </div>
          </FormControl>
          {programme['show-related-programmes'] && (
            <RelatedProgrammes
              programme={programme}
              showEditOptions={true}
              onChange={this.updateRelatedProgrammes}
            />
          )}
          <div className="cms-form__control cms-form__control--actions">
            {this.renderErrors()}
            <NavLink
              to={`/admin/${theme.localisation.programme.path}`}
              className="button"
            >
              Cancel
            </NavLink>
            <Button type="submit" className={buttonClasses}>
              {buttonText}
            </Button>
          </div>
        </form>
      </div>
    )
  }
}

const enhance = compose(
  withTheme,
  withLoader,
  withClientVariables('programmeFormCV', allVariables),
  withHooks((props) => {

    const { theme } = props

    const customAttributeTypesResource = useResource('custom-attribute-type')
    const getCustomAttributeTypes = () => {
      customAttributeTypesResource.findAll({
        filter: {
          related_type: 'Programme'
        },
        page: {
          size: 200
        }
      })
    }

    const genresResource = useResource('genre')
    const getGenres = () => {
      genresResource.findAll({
        fields: {
          genres: 'name,parent-id'
        }
      })
    }

    const languagesResource = useResource('language')
    const getLanguages = () => {
      languagesResource.findAll({
        fields: {
          languages: 'name'
        }
      })
    }

    const programmeTypesResource = useResource('programme-type')
    const getProgrammeTypes = () => {
      programmeTypesResource.findAll({
        fields: {
          'programme-types': 'name'
        }
      })
    }

    const qualitiesResource = useResource('quality')
    const getQualities = () => {
      qualitiesResource.findAll({
        fields: {
          qualities: 'name'
        }
      })
    }

    const talentTypesResource = useResource('talent-type')
    const getTalentTypes = () => {
      talentTypesResource.findAll({
        page: {
          size: '48'
        },
        fields: {
          'talent-types': 'name'
        }
      })
    }

    const cataloguesResource = useResource('catalogue')
    const getCustomCatalogues = () => {
      cataloguesResource.findAll({
        fields: {
          'catalogues': 'name'
        }
      })
    }

    const fetchAllResources = () => {
      getCustomAttributeTypes()
      getGenres()
      getLanguages()
      getQualities()
      if (theme.features.talents) {
        getTalentTypes()
      }
      if (theme.features.programmeTypes.enabled) {
        getProgrammeTypes()
      }
      if (theme.features.customCatalogues.enabled) {
        getCustomCatalogues()
      }
    }

    useEffect(() => {
      fetchAllResources()
    }, [])

    const finishedLoading = (resource) => !Boolean(resource)

    const customAttributeTypes = customAttributeTypesResource.getDataAsArray()
    const genres = genresResource.getDataAsArray()
    const languages = languagesResource.getDataAsArray()
    const programmeTypes = theme.features.programmeTypes.enabled ? programmeTypesResource.getDataAsArray() : []
    const qualities = qualitiesResource.getDataAsArray()
    const talentTypes = theme.features.talents ? talentTypesResource.getDataAsArray() : []
    const catalogues = theme.features.customCatalogues.enabled ? cataloguesResource.getDataAsArray() : []

    useEffect(() => {
      props.pageIsLoading([
        finishedLoading(customAttributeTypes),
        finishedLoading(genres),
        finishedLoading(languages),
        finishedLoading(programmeTypes),
        finishedLoading(qualities),
        finishedLoading(talentTypes),
        finishedLoading(catalogues)
      ])
    }, [ customAttributeTypes, genres, languages , programmeTypes, qualities, talentTypes, catalogues])

    return {
      genres,
      languages,
      programmeTypes,
      qualities,
      talentTypes,
      types: customAttributeTypes,
      catalogues,
    }
  })
)

export default enhance(ProgrammesForm)