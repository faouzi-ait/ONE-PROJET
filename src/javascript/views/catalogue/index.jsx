import React, { useEffect, useState } from 'react'
import moment from 'moment'
import pluralize from 'pluralize'
import queryString from 'query-string'
import uuid from 'uuid/v4'
import deepEqual from 'deep-equal'

import allClientVariables from './variables'
import contentBlockClientVariables from 'javascript/views/admin/pages/content-blocks/variables'
import compose from 'javascript/utils/compose'
import useTheme from 'javascript/utils/theme/useTheme'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import SwitchOrder from 'javascript/utils/client-switch/components/switch-order'
import OrderSection from 'javascript/utils/client-switch/components/switch-order/order-section'
import { retrieveAllFilters } from 'javascript/containers/filters/filter-tools'
import { NO_CUSTOM_BANNER } from 'javascript/utils/constants'
import programmeQuery from 'javascript/utils/queries/programme-search-card'

// Services
import { isInternal } from 'javascript/services/user-permissions'
// Actions
import ProgrammeHighlightsActions from 'javascript/actions/programme-highlights'
import TalentsActions from 'javascript/actions/talents'
import ProgrammeTypesActions from 'javascript/actions/programme-types'
import ProgrammeSearchResultActions from 'javascript/actions/programme-search-results'
import PagesActions from 'javascript/actions/pages'
import ListsActions from 'javascript/actions/lists'

// Stores
import ProgrammeHighlightsStore from 'javascript/stores/programme-highlights'
import TalentsStore from 'javascript/stores/talents'
import ProgrammeTypesStore from 'javascript/stores/programme-types'
import ProgrammeSearchResultsStore from 'javascript/stores/programme-search-results'
import PagesStore from 'javascript/stores/pages'
import ListsStore from 'javascript/stores/lists'

// Components
import { NavLink } from 'react-router-dom'
import { ProgrammeTypeQuickLinks } from 'javascript/views/catalogue/ProgrammeTypeQuicklinks'
import AdminToolbar from 'javascript/components/admin-toolbar'
import Banner from 'javascript/components/banner'
import Blocks from 'javascript/views/blocks'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import Card from 'javascript/components/card'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import Icon from 'javascript/components/icon'
import ListModal from 'javascript/components/list-modal'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import Paginator from 'javascript/components/paginator'
import ProgrammeFilters from 'javascript/containers/filters/programme-filter'
import ProgrammeSearchSuggestions from 'javascript/components/programme-search-suggestions'
import Select from 'react-select'
import ShouldRenderContentBlock from 'javascript/views/blocks/should-render-content-block'
import { getKidsPage } from 'javascript/utils/helper-functions/get-kids-page'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import { findAllByModel } from 'javascript/utils/apiMethods'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import withPageHelper from 'javascript/components/hoc/with-page-helper'
import variables from 'javascript/components/layout/navigation/variables'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

const DefaultCatalogueIndex = (props) => {
  const { localisation, variables } = useTheme()
  const [page, setPage] = useState({})
  const { bannerVariant } = useClientVariables(allClientVariables)
  const [meta, setMeta] = useState({
    title: null,
    description: '',
    keywords: ''
  })

  const pageMeta = {
    title: meta?.title || `${localisation.client} :: ${variables.SystemPages.catalogue.upper}`,
    description: meta?.description || '',
    keywords: meta?.keywords || '',
    property: {
      'og:title': localisation.client,
      'og:image': `${window.location.origin}/assets/images/programme-placeholder-retina.jpg`
    }
  }

  useEffect(() => {
    findAllByModel('pages', {
      fields: ['content-blocks', 'page-images', 'title', 'slug', 'banner-urls', 'meta-datum', 'introduction'],
      include: ['page-images', 'meta-datum'],
      includeFields: {
        'page-images': ['file', 'filename'],
        'meta-datums': ['title', 'keywords', 'description'],
      },
      filter: {
        'page-type': 'catalogue',
        all: true
      }
    }).then((response) => {
      const cataloguePage = response[0] || {}
      if (!cataloguePage['content-blocks']) cataloguePage['content-blocks'] = []
      setPage(cataloguePage)
      setMeta(cataloguePage['meta-datum'])
    })
  }, [])

  const isUserCatalogue = displayUserCatalogue(props.location.pathname, variables)
  const catalogueTitle = isUserCatalogue
    ? variables.SystemPages.myProgrammes.upper
    : variables.SystemPages.catalogue.upper

  const cataloguePath = isUserCatalogue
    ? variables.SystemPages.myProgrammes.path
    : variables.SystemPages.catalogue.path

  return (
    <CatalogueIndex {...props}
      meta={pageMeta}
      bannerUrls={page['banner-urls']?.[bannerVariant] && page['banner-urls']}
      contentBlocks={page['content-blocks'] || []}
      pageImages={page['page-images'] || []}
      catalogueTitle={catalogueTitle}
      catalogueIntro={page['introduction'] || ''}
      cataloguePath={cataloguePath}
      cataloguePageId={page.id}
      isMainCatalogue={true}
      bannerVariant={bannerVariant}
    />
  )
}

export default DefaultCatalogueIndex


const displayUserCatalogue = (locationPathname, variables) => {
  return locationPathname === `/${variables.SystemPages.myProgrammes.path}`
}

class Catalogue extends React.Component {
  constructor(props) {
    super(props)
    const { catalogueCV, theme } = props
    this.browserListenStop = null
    this.params = queryString.parse(props.location.search)

    let genreFilter = null
    this.kids = getKidsPage(theme)

    if (this.kids) {
      genreFilter = {'filter[genre]': catalogueCV.kidsGenre}
    }

    const initialQuery = {
      ...genreFilter,
      'page[number]': 1,
      'filter[with-aggregations]': 'true',
      'page[size]': catalogueCV.initialPageSize,
      'sort': catalogueCV.initialSort,
      ...(props.catalogueFilter && {'filter[catalogue]': props.catalogueFilter})
    }



    const query = {
      ...initialQuery,
      ...props.location.state?.queryParams,
      ...this.params
    }

    this.state = {
      resources: null,
      query,
      initialQuery,
      filtered: this.retrieveAllFiltersWithoutSearch(this.params),
      programmeHighlights: [],
      ...(catalogueCV.displayLists && { list: [] }),
      preFiltered: false
    }

    this.pageSizeOptions = [{
      label: 12,
      value: 12
    }, {
      label: 24,
      value: 24
    }, {
      label: 48,
      value: 48
    }]

    this.sortOptions = catalogueCV.sortOrder.map((sortOption) => ({
      label: sortOption[0],
      value: sortOption[1]
    }))
    this.displayUserCatalogue = displayUserCatalogue(this.props.location.pathname, theme.variables)
  }

  componentWillMount() {
    const { catalogueCV, theme } = this.props
    ProgrammeSearchResultsStore.on('change', this.setFilterResources)
    if (catalogueCV.displayLists) {
      ListsStore.on('change', this.getResources)
    }
    if (theme.features.programmeOverview.highlights) {
      ProgrammeHighlightsStore.on('change', this.getResources)
    }
    if (theme.features.talents) {
      TalentsStore.on('change', this.getResources)
    }
    if(theme.features.programmeTypes.quickLinks) {
      ProgrammeTypesStore.on('change', this.getProgrammeTypeResources)
    }
    ProgrammeSearchResultsStore.unsetResources()

    this.browserListenStop = this.props.history.listen(() => this.getProgrammeResources(true))
  }

  componentWillUnmount() {
    const { catalogueCV, theme } = this.props
    ProgrammeSearchResultsStore.removeListener('change', this.setFilterResources)
    if (catalogueCV.displayLists) {
      ListsStore.removeListener('change', this.getResources)
    }
    if (theme.features.programmeOverview.highlights) {
      ProgrammeHighlightsStore.removeListener('change', this.getResources)
    }
    if (theme.features.talents) {
      TalentsStore.removeListener('change', this.getResources)
    }
    if(theme.features.programmeTypes.quickLinks) {
      ProgrammeTypesStore.removeListener('change', this.getProgrammeTypeResources)
    }
    this.browserListenStop()
  }

  componentDidMount() {
    const { catalogueCV, theme } = this.props
    document.body.scrollTop = document.documentElement.scrollTop = 0

    if (theme.features.programmeOverview.highlights) {
      ProgrammeHighlightsActions.getResources({
        include: 'programme',
        fields: {
          'programme-highlights': 'position,programme',
          programmes: 'title,thumbnail'
        },
        'page': {
          'size': 4
        },
        sort: 'position'
      })
    }
    if (theme.features.talents) {
      TalentsActions.getResources({
        fields: {
          'talents': 'firstname,surname'
        }
      })
    }

    if (catalogueCV.displayLists && this.props.user) {
      ListsActions.getResources({
        'filter[global]': false,
        'filter[meeting-list]': false,
        'filter[user_id]': this.props.user.id,
        'page': {
          'size': 4
        },
        'fields': {
          'lists': 'name,programmes-count-without-restricted,videos-count-without-restricted,series-count,global,meeting-list,updated-at,images',
        },
       'sort': '-updated_at'
      })
    }    

    this.getProgrammeResources(false)
  }

  componentDidUpdate(prevProps, prevState) {
    const { catalogueCV, history, location } = this.props
    const urlParams = queryString.parse(this.props.location.search)
    const prevUrlParams = queryString.parse(prevProps.location.search)
    const queryParamUpdate = {
      ...this.state.initialQuery,
      ...location.state?.queryParams,
      ...urlParams
    }

    if (this.hasQueryParamsChanged(prevProps.location, location) && !this.hasCatalogueChanged(prevProps.location, location)) {
      return this.props.history.replace(...this.injectQueryParamsAndUrlFilters(location.pathname, queryParamUpdate))
    }

    if (!deepEqual(queryParamUpdate, this.state.query)) {
      this.setState({
        query: queryParamUpdate,
        filtered: this.retrieveAllFiltersWithoutSearch(urlParams)
      })
    }
    if (prevProps.catalogueFilter !== this.props.catalogueFilter) {
      const initialQuery = {
        ...this.state.initialQuery,
        ...(this.props.catalogueFilter && {'filter[catalogue]': this.props.catalogueFilter})
      }
      this.setState({
        initialQuery,
        query: initialQuery
      }, () => {
        this.props.history.push(...this.injectQueryParamsAndUrlFilters(this.props.location.pathname, this.state.query))
      })
    }
  }

  hasQueryParamsChanged = (prevLocation, currLocation) => {
    const prevQueryParamLength = Object.keys(prevLocation.state?.queryParams || {}).length
    const currQueryParamLength = Object.keys(currLocation.state?.queryParams || {}).length
    return prevQueryParamLength !== currQueryParamLength && !currQueryParamLength
  }

  hasCatalogueChanged = (prevLocation, currLocation) => {
    return prevLocation.pathname !== currLocation.pathname
  }

  injectQueryParamsAndUrlFilters = (path, queryParams) => {
    const hiddenParams = {...queryParams}
    const urlParams = Object.keys(queryParams).reduce((paramsForUrl, param) => {
      if (!this.state.initialQuery.hasOwnProperty(param)
      || (queryParams[param].toString() !== this.state.initialQuery[param].toString())) {
        paramsForUrl[param] = queryParams[param]
      }
      return paramsForUrl
    }, {})
    const locationState = {
      ...this.props.location.state,
      queryParams: hiddenParams
    }
    if (Object.keys(urlParams).length) {
      return [`${path}?${queryString.stringify(urlParams, { encode: false })}`, locationState]
    }
    return [path, locationState]
  }

  addToList = (resources) => {
    this.props.modalState.showModal(({ hideModal }) => (
      <Modal delay={500} customContent={true} modifiers={['custom-content']} closeEvent={hideModal}>
        <ListModal resourcesToAddToList={resources} closeEvent={hideModal} user={this.props.user} />
      </Modal>
    ))
  }

  getProgrammeResources = (filtersListener, hiddenParams = {}) => {
    const { history, location, theme, catalogueCV } = this.props
    let pathName = history.location.pathname
    const defaultQuery = programmeQuery(theme, catalogueCV)
    if (history.action === 'PUSH' && pathName !== location.pathname) {
      /*
      *  Do not re-fetch ProgrammeResources if navigating away from /catalogue
      *  Catalogue index has a history.listen in componentWillMount. Fetching again is not
      *  needed as component is being destroyed. Will cause 404 page error
      */
      return
    }
    const params = {
      ...location.state?.queryParams,
      ...queryString.parse(this.props.location.search),
      ...hiddenParams /// these are passed directly not via the url
    }
    const paramsFilters = Object.keys(params)
    if (paramsFilters.length === 1 && paramsFilters.includes('filter[keywords]')) {
      // This is a search from global programme search - reset all filters and search on all programmes again.
      this.setState({
        query: this.state.initialQuery
      }, () => {
        this.filter(params, false, false)
      })
      return
    }

    let filter = {}
    if(this.displayUserCatalogue){
      filter['limited-access-user'] = this.props.user.id
    }

    const query = Object.assign({
      ...defaultQuery,
      filter
    }, this.state.query)

    // If coming from catalogue to my programmes, don't fetch from store
    if (filtersListener &&
      (this.props.history.location.pathname === `/${theme.variables.SystemPages.myProgrammes.path}`) &&
      (this.props.location.pathname === `/${theme.variables.SystemPages.catalogue.path}`)) {
      return false
    }
    ProgrammeSearchResultActions.getResources(query)
  }


  setFilterResources = () => {
    const fetchedResources = ProgrammeSearchResultsStore.getResources()
    const resources = this.state.preFiltered ? this.state.resources : fetchedResources

    if(this.props.theme.features.programmeTypes.quickLinks && resources) {
      ProgrammeTypesActions.getResources({
        fields: {
          'programme-types': 'name',
        },
        'sort': 'position',
        filter: {
          id: fetchedResources.meta?.['programme-type-ids']?.join(',')
        },
      })
    }   

    this.setState({
      resources,
      meta: fetchedResources.meta
    }, () => {
      if (this.state.resources) {
        this.setState({
          totalPages: this.state.resources.meta['page-count']
        })
        this.props.pageIsLoading(false)
        if(this.props.modalState.isModalVisible()){
          this.openFilters()
        }
      }
    })
  }

  getResources = () => {
    const { catalogueCV, theme } = this.props
    let programmeHighlights = []
    let talents = []
    if (theme.features.programmeOverview.highlights) {
      programmeHighlights = ProgrammeHighlightsStore.getResources() || []
    }
    if (theme.features.talents) {
      talents = (TalentsStore.getResources() || []).sort((a, b) => a.position - b.position)
    }     

    this.setState({
      programmeHighlights,
      talents,
      ...(catalogueCV.displayLists && { list: ListsStore.getResources() || [] }),
    })
  }

  getProgrammeTypeResources = () => {
    const { theme } = this.props
    let programmeTypes = []
    if(theme.features.programmeTypes.quickLinks) {
      programmeTypes = ProgrammeTypesStore.getResources() || []
    }

    this.setState({
      programmeTypes
    })
  }

  openFilters = () => {
    const { catalogueCV, theme } = this.props
    this.props.modalState.showModal(({ hideModal }) => (
      <Modal
        closeEvent={hideModal}
        title={catalogueCV.filterTitle}
        titleIcon={catalogueCV.hasFilterTitleIcon && {
          id: 'i-filter',
        }}
        modifiers={['filters']}>
        <div className="modal__content">
          <ProgrammeFilters
            query={this.state.query}
            meta={this.state.meta}
            onSubmit={(filters, clear = false) => this.filter(filters, false, clear)}
            onPreFilter={this.getMeta}
            closeEvent={hideModal}
            types={this.state.types}
            talents={this.state.talents}
            programmeTypes={this.state.programmeTypes}
            allowCataloguesFilter={!this.props.catalogueFilter}
          />
        </div>
      </Modal>
    ))
  }

  filter = (newQuery, pageChange, clearFilters) => {
    const { catalogueCV } = this.props
    let update = {
      ...this.state.query,
      ...newQuery
    }
    if(!newQuery) {
      update = {...this.state.initialQuery}
      if(clearFilters && this.state.query['filter[keywords]']){
        update['filter[keywords]'] = this.state.query['filter[keywords]']
      }
    }
    if (!pageChange) {
      update['page[number]'] = 1
    }
    Object.keys(update).map((key) => {
      if (update[key].length < 1) {
        delete update[key]
      }
    })
    let filterQuery = Object.keys(update).filter(key => !this.state.initialQuery[key])
    if (filterQuery.length === 0) {
      newQuery = {}
    } else {
      filterQuery = filterQuery.filter(f => f !=='filter[keywords]')
    }

    if (update['filter[keywords]'] && (!this.state.query['filter[keywords]'] || clearFilters)) {
      update['sort'] = catalogueCV.relevanceSortOption.value
    } else if (!update['filter[keywords]'] && this.state.query['filter[keywords]'] && update['sort'] === catalogueCV.relevanceSortOption.value) {
      update['sort'] = this.props.catalogueCV.initialSort
    }

    this.setState({
      query: update,
      filtered: Object.keys(filterQuery).length,
      preFiltered: false
    }, ()=>{this.updateParams()})
  }

  getMeta = (newQuery) => {
    let update = {
      ...this.state.query,
      ...newQuery,
      'page[number]': 1
    }
    Object.keys(update).map((key) => {
      if (update[key].length < 1) {
        delete update[key]
      }
    })
    this.setState({
      query: update,
      preFiltered: true
    }, ()=>{this.getProgrammeResources(newQuery)})
  }

  sort = (newValue) => {
    const update = this.state.query
    update['sort'] = newValue
    this.setState({
      query: update
    }, ()=>{this.updateParams()})
  }

  updateParams = () => {
    this.props.history.push(...this.injectQueryParamsAndUrlFilters(this.props.location.pathname, this.state.query))
  }

  sumListResources = (resource) => (resource['programmes-count-without-restricted'] + resource['series-count'] + resource['videos-count-without-restricted'])

  renderCatalogue = () => {
    const { theme, catalogueCV } = this.props
    const { resources } = this.state

    if (!resources) return null

    const items = resources.map((resource) => {
      const genres = catalogueCV.genres(resource.programme.genres)
      const catalogues = resource.programme.catalogues || []

      let introText = null
      const maxLength = catalogueCV.introTextMaxLength
      if (maxLength) {
        introText = resource.programme['introduction'] ? resource.programme['introduction'].substring(0, maxLength) : ''
        if (resource.programme['introduction'] && resource.programme['introduction'].length > maxLength) {
          introText = introText.substring(0, Math.min(introText.length, introText.lastIndexOf(' '))) + '...'
        }
      }
      const genreClass = genres.length ? genres[0].name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase() : ''

      let episodeTag = {}
      if (theme.features.programmeOverview.episodeTag) {
        const episodeCount = resource.programme['number-of-episodes']
        if (episodeCount > 0) {
          episodeTag = {
            name: `${episodeCount} ${episodeCount === 1 ? theme.localisation.episodes.shorthand : pluralize(theme.localisation.episodes.shorthand)}`,
            id: uuid(),
            alt: true
          }
        }
      }

      let restrictedTag = {}
      if(catalogueCV.displayRestrictedWithTags && resource.programme.restricted && isInternal(this.props.user)) {
        restrictedTag = {
          name: theme.localisation.restricted.upper,
          id: uuid()
        }
      }

      const programmeTitleTruncated = theme.features.cards.titleLimit && resource.programme.title.length > theme.features.cards.titleLimit
        ? `${resource.programme.title.substring(0, theme.features.cards.titleLimit)}...`
        : resource.programme.title

      let durationTags = []
      if(catalogueCV.durationTag) {
        {resource.programme['custom-attributes']?.map((i, index) => {
          if (i['custom-attribute-type'].name.toLowerCase() === 'duration') {
            durationTags.push({
              name: i.value,
              id: uuid()
            })
          } else {
            return false
          }
        })}
      }

      return (
        <ClientProps
          clientProps={{
            title: {
              default: programmeTitleTruncated,
              'cineflix': ''
            },
            intro: {
              'cineflix | drg | endeavor | fremantle': introText
            },
            description: {
              default: resource.programme['short-description'],
              'amc': introText,
              'ae | cineflix | drg | endeavor | fremantle': ''
            },
            classes: {
              'amc': ['hover'],
              'all3': ['catalogue', resource.programme['programme-type']?.name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()],
              'ae | banijaygroup | endemol | itv': ['catalogue'],
              'cineflix': [genreClass, 'catalogue']
            },
            size: {
              'ae | discovery | endeavor | fremantle | itv': 'medium',
              'banijaygroup': 'tall'
            },
            introTitle: {
              'cineflix': resource.programme.title
            },
            subTitle: {
              'all3': resource.programme['programme-type']?.name
            },
            tags: {
              default: [episodeTag, ...genres, restrictedTag],
              'all3': [resource.programme['programme-type']?.name !== 'Format' && episodeTag, ...genres, restrictedTag],
              'ae': [...catalogues, ...durationTags],
            }
          }}
          renderProp={(clientProps) => (
            <Card key={resource.programme.id} cardId={resource.programme.id}
              image={{ src: resource.programme.thumbnail && resource.programme.thumbnail.url, alt: resource.programme.title }}
              url={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(resource.programme, theme)}`}
              linkState={{ cataloguePath: this.props.cataloguePath, catalogueTitle: this.props.catalogueTitle }}
              logo={theme.features.programmeOverview.logoTitle && resource.programme.logo}
              {...clientProps}
            >
              <ClientSpecific client="drg">
                {resource.programme['active-series-counter'] > 0 && (
                  <p className="card__copy">Duration: {resource.programme['active-series-counter']} {resource.programme['active-series-counter'] === 1 ? theme.localisation.series.upper : pluralize(theme.localisation.series.upper)}</p>
                  )}
              </ClientSpecific>

              {catalogueCV.brandLogo && resource.programme['custom-attributes'] && resource.programme['custom-attributes'].map((i, index) => {
                if (i['custom-attribute-type'].name === 'Brand') {
                  const brand = i.value
                  const img = theme.variables.Brands[brand]
                  if (!img) {
                    return false
                  }
                  return (
                    <img key={index} src={img} className="card__brand" />
                  )
                } else {
                  return false
                }
              })}

              <ClientSpecific client="cineflix">
                <p className="card__data">
                  {resource.programme['custom-attributes'] && resource.programme['custom-attributes'].map((i, index) => {
                    if (i['custom-attribute-type'].name === 'Episode Info') {
                      return (
                        <span key={index}>
                          {i.value}
                        </span>
                      )
                    }
                    if (i['custom-attribute-type'].name === 'Season breakdown') {
                      return (
                        <span key={index}>{i.value}</span>
                      )
                    } else {
                      return false
                    }
                  })}
                </p>
              </ClientSpecific>
              {resource.programme.restricted && isInternal(this.props.user) && !catalogueCV.displayRestrictedWithTags &&
                <div class="card__strip">{theme.localisation.restricted.upper}</div>
              }
              {resource.programme['new-release'] &&
                <span className="tag tag--new">New</span>
              }
              { this.props.user &&
                <div className="card__actions">
                  <button onClick={() => this.addToList([resource])} className={catalogueCV.addListClasses} test-id="add_to_list_button" title={`Add to ${theme.localisation.list.lower}`}>
                    <ClientChoice>
                      <ClientSpecific client="default">
                        <Icon id="i-add-to-list" />
                      </ClientSpecific>
                      <ClientSpecific client="drg">
                        <span className="button-circle__icon"><Icon id="i-add-to-list" /></span>
                      </ClientSpecific>
                      <ClientSpecific client="cineflix">
                        <Icon id="i-add" />
                      </ClientSpecific>
                    </ClientChoice>
                  </button>
                </div>
              }
            </Card>
          )}
        />
      )
    })

    if (items.length > 0) {
      return (
        <div className={catalogueCV.gridClasses}>
          {items}
        </div>
      )
    } else {
      return <div className="fade-on-load grid grid--justify grid--center" style={{minHeight: '180px'}}>
        {`There are no ${pluralize(theme.localisation.programme.lower)} to show${this.state.filtered ? ', please check filters applied': '.'}`}
      </div>
    }
  }

  renderPaginator() {
    const { catalogueCV } = this.props
    if (this.state.totalPages <= 1) return null
    return (
      <Paginator currentPage={ parseInt(this.state.query['page[number]']) }
        totalPages={ this.state.totalPages }
        onChange={ (page) => {
          this.filter({ 'page[number]': page }, true)
          const offset = this.refs.programmes.offsetTop - catalogueCV.paginatorOffset
          document.body.scrollTop = document.documentElement.scrollTop = offset
        } }
      />
    )
  }

  renderClearFilterButton() {
    if(!this.state.filtered) return null
    return (
      <button className={this.props.catalogueCV.clearFiltersClasses} type="button" onClick={(e) => this.filter(false, false, true)}>
        Clear filters
      </button>
    )
  }

  renderFilterButton() {
    const {filtered} = this.state
    let buttonClasses = this.props.catalogueCV.buttonClasses(this.state.filtered)
    return (
      <button onClick={this.openFilters} className={buttonClasses}>
          <ClientChoice>
            <ClientSpecific client="default">
              <Icon classes="button__icon" id="i-filter" />
              {this.state.filtered ? 'Filters Applied' : 'Filters'}
            </ClientSpecific>
            <ClientSpecific client="ae">
              <Icon classes="button__icon" id="i-filter" />
              {filtered ? `${filtered} Filters` : 'Filters'}
            </ClientSpecific>
            <ClientSpecific client="discovery">
              Advanced Search
            </ClientSpecific>
          </ClientChoice>

      </button>
    )
  }

  retrieveAllFiltersWithoutSearch = (query) => {
    const filters = retrieveAllFilters(query, false)
    delete filters['filter[keywords]']
    return Object.keys(filters).length
  }

  renderProgrammeQuickLinks = (centered = false) => (
    <ProgrammeTypeQuickLinks
      typeSelected={this.state.query?.['filter[programme-type]']}
      onSelect={(typeId) => { this.filter({ 'filter[programme-type]': typeId }, false, false)}}
      centered={centered}
      data={this.state.programmeTypes}
    />
  )

  renderPlaceholderContent = (isFirstContentBlock) => {
    const { catalogueCV, theme, catalogueFilter } = this.props
    const {
      bgBrandClass,
      containerClasses,
      pageControlViewClasses,
    } = catalogueCV

    let programmeCount = null
    if (this.state.resources && this.state.resources.meta['record-count']) {
      const recordCount = this.state.resources.meta['record-count']
      const programmeStr = recordCount === 1 ? theme.localisation.programme.lower : pluralize(theme.localisation.programme.lower)
      programmeCount = `${recordCount} ${programmeStr}`
    }
    const appliedFilters = this.state.filtered > 0 ? retrieveAllFilters(this.state.query, false) : {}
    if (catalogueFilter) {
      appliedFilters['filter[catalogue]'] = catalogueFilter
    }
    const displayProgrammeHighlights = theme.features.programmeOverview.highlights && this.state.programmeHighlights.length > 0

    return (
      <div style={{ paddingTop: `${isFirstContentBlock ? 0 : 15}px`}} className={displayProgrammeHighlights && 'programme-highlights'}>
        { displayProgrammeHighlights && (
          <div className="content-block content-block--shade">
            <div className="container">
              <h2 class="content-block__heading">Highlights</h2>
                {Blocks({
                  type: 'programmes',
                  pages: this.state.programmeHighlights.map(v => ({ resource: v.programme }))
                }, {
                  'page-images': this.props.pageImages,
                }, {
                  user: this.props.user,
                  addToList: (r) => () => this.addToList([r])
                })}
            </div>
          </div>
        )}

        <section className={catalogueCV.mainSectionClasses(this.kids)}>
          {!this.displayUserCatalogue &&
            <>
              <ProgrammeSearchSuggestions ref={this.programmeSearchRef}
                onSubmit={this.filter}
                isFiltered={this.state.filtered > 0 || !!catalogueFilter}
                appliedFilters={appliedFilters}
                value={this.state.query['filter[keywords]']}
                clearQuery={true}
                onSuggestionSelected={(e, p) => this.props.history.push(`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(p.suggestion.programme, theme)}`)}
              />
              {theme.features?.programmeTypes?.quickLinks && !catalogueCV.programmeTypesInBanner && (
                this.renderProgrammeQuickLinks(true)
              )}
              <ClientSpecific client="ae">
                <div className="programme-filters-trigger">
                  <div className="container">
                    {this.renderClearFilterButton()}
                    {this.renderFilterButton()}
                  </div>
                </div>
              </ClientSpecific>
            </>
          }

          <div className={bgBrandClass}>
            <div className={containerClasses} ref="programmes">
              <div className="page-controls">
                <SwitchOrder
                  clientSpecificOrder={{
                    'ae': ['programmeCount', 'sortBy', 'viewBy']
                  }}
                >
                  <OrderSection name="programmeCount">
                    <p className="page-controls__left page-controls__count">
                      { programmeCount }
                    </p>
                  </OrderSection>

                  <OrderSection name="viewBy">
                    <div className={pageControlViewClasses}>
                      <span>{catalogueCV.pageControlViewLabel}</span>
                      <ClientProps
                        clientProps={{
                          options: {
                            default: this.pageSizeOptions,
                            'cineflix': this.pageSizeOptions.map(o => ({...o, label: o.label + ' per page'}))
                          },
                          onChange: {
                            default: (val) => this.filter({'page[size]':val}, false, false),
                            'endeavor': (val) => this.filter({ 'page[size]': val })
                          }
                        }}
                        renderProp={(clientProps) => (
                          <Select
                            value={parseInt(this.state.query['page[size]'])}
                            clearable={false}
                            simpleValue={true}
                            searchable={false}
                            {...clientProps}
                          />
                        )}
                      />
                      {catalogueCV.pageControlViewPerPageLabel &&
                        <span className="per-page__label">{catalogueCV.pageControlViewPerPageLabel}</span>
                      }
                    </div>
                  </OrderSection>

                  <OrderSection name="sortBy">
                    <div className={catalogueCV.pageControlSortClasses}>
                      <span>Sort by:</span>
                      <Select
                        clearable={false} simpleValue={true}
                        searchable={false} backspaceRemoves={false}
                        options={this.state.query['filter[keywords]']
                          ? [catalogueCV.relevanceSortOption, ...this.sortOptions]
                          : this.sortOptions
                        }
                        value={this.state.query['sort']}
                        onChange={(val) => { this.sort(val) }}
                      />
                    </div>
                  </OrderSection>

                  <OrderSection name="clear">
                    {this.renderClearFilterButton()}
                  </OrderSection>

                  <OrderSection name="filter">
                    {catalogueCV.pageControlFilterClasses ?
                      <div className={catalogueCV.pageControlFilterClasses}>
                        {this.renderFilterButton()}
                      </div>
                    : this.renderFilterButton()}
                  </OrderSection>
                </SwitchOrder>
              </div>

              <ClientChoice>
                <ClientSpecific client="default">
                  {this.renderCatalogue()}
                  {this.renderPaginator()}
                </ClientSpecific>
                <ClientSpecific client="drg"></ClientSpecific>
              </ClientChoice>
            </div>
          </div>
          <ClientSpecific client="drg">
            <div className="container container--soft-ends">
              {this.renderCatalogue()}
              {this.renderPaginator()}
            </div>
          </ClientSpecific>
        </section>

        {theme.features.catalogue.lists &&  this.props.user && this.state.list?.length > 0 && (
          <div className="content-block content-block--shade">
            <div className="container">
              <h2 class="content-block__heading">
                <span>My Lists</span>
                <NavLink class="button button--small button--filled" to={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/my-${theme.variables.SystemPages.list.path}`}>View all</NavLink>
              </h2>
              <div className="grid grid--four">
                {this.state.list && this.state.list.map((resource, index) => {
                  return (
                    <Card key={index} cardId={resource.id}
                      classes={resource.selected && ['active']}
                      images={resource.images && resource.images.length >= 4 ? resource.images : [resource.images && resource.images[0]]}
                      title={resource.name}
                      url={`/${theme.variables.SystemPages.account.path}/${theme.variables.SystemPages.list.path}/my-${theme.variables.SystemPages.list.path}/${resource.id}`}
                    >
                      <p className="card__count">{this.sumListResources(resource)}</p>
                      <p className="card__copy">{moment(resource['updated-at']).format('D MMM YYYY')}</p>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  render() {
    const {
      bannerUrls,
      bannerVariant,
      catalogueCV,
      catalogueFilter,
      contentBlocksCV,
      isMainCatalogue,
      theme,
      user,
    } = this.props
    const {
      bannerClasses,      
      bannerImage,
      bannerLabel,
      bannerTitlePrefix,
      breadcrumbClasses,
      metaDescription,
    } = catalogueCV

    const contentBlocks = [...this.props.contentBlocks]
    if (!contentBlocks.find((block) => block.type === 'content-placeholder')) {
      contentBlocks.unshift({ type: 'content-placeholder' })
    }
    const bannerTitle = catalogueFilter ?  this.props.catalogueTitle : `${bannerTitlePrefix}${this.props.catalogueTitle}`

    return (
      <Meta {...this.props.meta} >
        <main>
          <div className="fade-on-load">
            <Banner
              title={this.displayUserCatalogue
                ? `My ${pluralize(theme.localisation.programme.upper)}`
                : bannerTitle
              }
              {...(bannerLabel && { label: bannerLabel })}
              copy={this.props.catalogueIntro}
              image={bannerUrls || bannerImage || NO_CUSTOM_BANNER}
              classes={bannerClasses}
              variant={bannerVariant}>
              {theme.features?.programmeTypes?.quickLinks && catalogueCV.programmeTypesInBanner && (
                this.renderProgrammeQuickLinks()
              )}
            </Banner>

            <Breadcrumbs
              classes={breadcrumbClasses}
              paths={[{ name: this.props.catalogueTitle, url: this.props.cataloguePath }]}
            />

            {contentBlocks.map((block, index) => {
              if (block.type === 'content-placeholder') {
                return this.renderPlaceholderContent(index === 0)
              }
              return (
                <ShouldRenderContentBlock
                  block={block}
                  renderBlock={() => {
                    const bgImage = block.bgImage ? this.props.pageImages.find(i => i.id === block.bgImage.id) : null
                    return (
                      <section key={block.id} className={[block.type !== 'banner-carousel' && 'content-block', block.type, block.background].join(' content-block--')}
                      style={block.background === 'image' && bgImage ? {
                        backgroundImage: `url(${bgImage.file.url.replace('.net/', `.net/${contentBlocksCV.backgroundSize}/`)})`,
                        backgroundSize: contentBlocksCV.backgroundCover
                      } : null}>
                        <div className={!contentBlocksCV.blocksWithoutContainers.includes(block.type) ? 'container': 'content-block__inner'}>
                          {Blocks(block, {
                            'page-images': this.props.pageImages,
                          }, {
                            user: this.props.user,
                            addToList: (r) => () => this.addToList([r])
                          })}
                        </div>
                      </section>
                    )
                  }}
                />
              )
            })}
          </div>
          <AdminToolbar user={user}
            type={this.props.catalogueFilter ? 'catalogue' : 'page'}
            id={this.props.catalogueFilter || this.props.cataloguePageId}
          />
        </main>
      </Meta>
    )
  }
}

const enhance = compose(
  withClientVariables('catalogueCV', allClientVariables),
  withClientVariables('contentBlocksCV', contentBlockClientVariables),
  withPageHelper,
)

export const CatalogueIndex = enhance(Catalogue)
