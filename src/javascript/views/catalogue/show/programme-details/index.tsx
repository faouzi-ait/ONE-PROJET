
import React, { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import Humanize from 'humanize'
import moment from 'moment'
import pluralize from 'pluralize'
import useSWR from 'swr'

import allClientVariables from './variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useMediaQuery from 'javascript/utils/hooks/use-media-query'
import { catalogueLayout } from 'javascript/config/features'
import { findAllByModel, findOneByModel } from 'javascript/utils/apiMethods'
import { singularize } from 'javascript/utils/generic-tools'

// Components
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import Icon from 'javascript/components/icon'
import { NavLink } from 'react-router-dom'
import Session from 'javascript/views/sessions/new'
import ShowHide from 'javascript/components/show-hide'
import Tooltip from 'javascript/components/tooltip'
import Gallery from 'javascript/components/gallery'

// Services
import { isInternal } from 'javascript/services/user-permissions'

//@ts-ignore
import pdfIcon from 'images/file-types/pdf.svg'
//@ts-ignore
import zipIcon from 'images/file-types/zip.svg'

// Types
import {
  GenreType,
} from 'javascript/types/ModelTypes'

type GenreListType = 'normal' | 'alphabetical' | 'parentFirst' | 'parentAndChild' | 'childWithParent' | 'parentOnly'

const ProgrammeDetails = (props) => {
  const { theme, token } = props

  const programmeDetailsHasSidePanel = useMediaQuery('(min-width: 1024px)')

  const programmeDetailsCV = useClientVariables(allClientVariables, {
    activeSeriesSubTitle: {
      default: (series) => theme.features.programmeOverview.seriesEpisodeCount
          && series['number-of-episodes'] > 0
          && `${series['number-of-episodes']} ${pluralize(theme.localisation.episodes.upper)}`,
      'ae': () => null,
      'cineflix': (series) => series['custom-attributes']?.length > 0
          && series['custom-attributes']
            .sort((a, b) => a.position - b.position)
            .map(c => c.value).join('  |  ')

    },
    cataloguesHeading: {
      default: theme.localisation.customCatalogues.upper
    },
    genresHeading: {
      default: pluralize(theme.localisation.genre.upper),
      'ae | banijaygroup | fremantle':  theme.localisation.genre.upper
    },
    productionCompaniesText: {
      default: (programmeFromApi) => programmeFromApi?.['production-companies-programmes']?.length === 1
        ? theme.localisation.productionCompany.upper
        : pluralize(theme.localisation.productionCompany.upper),
      'cineflix | fremantle' : (programmeFromApi) => 'Producer(s)'
    },
    seriesAndEpisodeCountText: {
      default: `Number of ${pluralize(theme.localisation.series.lower)}`,
      'cineflix': `${pluralize(theme.localisation.series.upper)} Breakdown`
    },
    showLanguages: {
      default: (resource) => true
    },
    showProgrammeDescription: {
      default: (resource) => true
    },
    subGenresHeading: {
      default: `Sub-${pluralize(theme.localisation.genre.upper)}`,
      'ae':  `Category`
    },
  })

  const { data: programmeFromApi } = useSWR(`programmes/${props.resource?.id}/production-companies`, () => {
    if (props.resource?.id) {
      const query = {
        fields: ['production-companies-programmes'],
        include: ['production-companies-programmes', 'production-companies-programmes.production-company'],
        includeFields: {
          "production-companies-programmes": ['position', 'production-company'],
          "production-companies": ['name']
        }
      }
      if (theme.features.users.anonymousAccess?.enabled && token) {
        query['token'] = token
      }
      return findOneByModel('programmes', props.resource.id, query as any)
    }
    return null
  })

  const { resource, types } = props

  const activeSeries = props.resource['active-series'].filter(s => s['show-in-programme-description']);
  const programmeTypes = (types || []).filter(t => resource['custom-attributes'].find(a => a['custom-attribute-type'].id === t.id)).filter(t => t.config.displayOnFrontend).sort((a, b) => a.position - b.position)
  const seriesCount = resource['manual-number-of-series'] || resource['active-series-counter']

  const [programmeBroadcasters, setProgrammeBroadcasters] = useState([])
  const activeSeriesIds = activeSeries.map((series) => series.id).join(',')

  const reduceBySeriesId = (acc, curr) => {
    if (!acc[curr.series.id]) acc[curr.series.id] = []
    acc[curr.series.id].push(curr)
    return acc
  }

  const [seriesBroadcasters, setSeriesBroadcasters] = useState({})
  const fetchSeriesBroadCasters = () => {
    if (theme.features.programmeOverview.broadcasters.series) {
      findAllByModel('series-broadcasters', {
        fields: ['broadcaster', 'series'],
        include: ['broadcaster', 'series'],
        includeFields: {
          broadcasters: ['name'],
          series: ['id']
        },
        filter: {
          series: activeSeriesIds
        },
        sort: 'position'
      })
      .then((response) => {
        setSeriesBroadcasters(response.reduce(reduceBySeriesId, {}))
      })
    }
  }

  const [productionCompaniesSeries, setProductionCompaniesSeries] = useState({})
  const fetchSeriesProductionCompanies = () => {
    if (theme.features.programmeOverview.productionCompanies.series) {
      findAllByModel('production-companies-series', {
        fields: ['production-company', 'series'],
        include: ['production-company', 'series'],
        includeFields: {
          'production-companies': ['name'],
          series: ['id']
        },
        filter: {
          series: activeSeriesIds
        },
        sort: 'position'
      })
      .then((response) => {
        setProductionCompaniesSeries(response.reduce(reduceBySeriesId, {}))
      })
    }
  }

  useEffect(() => {
    if (activeSeriesIds) {
      fetchSeriesBroadCasters()
      fetchSeriesProductionCompanies()
    }
  }, [activeSeriesIds])

  useEffect(() => {
    if (theme.features.programmeOverview.broadcasters.programme && props.resource?.id) {
      findAllByModel('programme-broadcasters', {
        fields: ['broadcaster'],
        include: ['broadcaster'],
        includeFields: {
          broadcasters: ['name'],
        },
        filter: {
          programme: props.resource.id
        },
        sort: 'position'
      })
      .then(setProgrammeBroadcasters)
    }
  }, [props.resource?.id])

  if (!types) {
    return <div />
  }

  const durations = (asTag = false) => {
    const { resource } = props
    const durations = resource['active-series'].map(series => {
      const { label, episodes, duration } = series['custom-attributes'].reduce((obj, attr) => ({
        ...obj,
        [attr['custom-attribute-type'].name.toLowerCase()]: attr.value
      }), {})

      if (!episodes || !duration) {
        return false
      }
      return (
        <span className={programmeDetailsCV.unlinkedTagClasses} key={`durations_${series.id}`}>{label || series.name} - {episodes} x {duration}</span>
      )
    })

    // if no series - level durations, then let's use programme level
    if (durations?.filter(duration => duration !== false)?.length == 0) {
      let episodes, duration;

      resource['custom-attributes'].forEach(attr => {
        if (attr['custom-attribute-type'].name.toLowerCase() === 'episodes') {
          episodes = attr.value
        } else if (attr['custom-attribute-type'].name.toLowerCase() === 'duration') {
          duration = attr.value
        }
      })

      if (duration) {
        episodes = episodes ? episodes : resource['number-of-episodes']

        if(asTag) {
          return <span className={programmeDetailsCV.unlinkedTagClasses}>{episodes && episodes > 0 ? `${episodes} x ${duration}` : duration}</span>
        }

        return (
          <div key={'durations'}>
            <h3 className="heading--four">Duration</h3>
            <p className={programmeDetailsCV.unlinkedTagClasses}>{episodes && episodes > 0 ? `${episodes} x ${duration}` : duration}</p>
          </div>
        )
      }
      else {
        return false
      }
    }

    return (
      <div key={'durations'}>
        <h3 className="heading--four">Durations</h3>
        {durations}
      </div>
    )
  }

  const renderAsset = () => {
    if (props.resource['pdf-url']) {
      const pdfName = props.resource['pdf-name'] || props.resource['pdf-url'].slice(props.resource['pdf-url'].lastIndexOf('/') + 1)
      return (
        <div className="asset asset--display">
          <div className="asset__media">
            <img src={pdfIcon} className="file-type" />
          </div>
          <div className="asset__details">
            <a href={props.resource['pdf-url']} className="text-button" target="_blank">{pdfName}</a>
          </div>
        </div>
      )
    }
  }

  const renderRequestForAsset = () => {
    return (
      <div className="asset asset--display" key={'request_for_asset'}>
        <a href={
            `mailto:${theme.features.programmeOverview.requestForAssets.mailToLink}
            ?subject=${props.resource.title}
            &body=${props.user.email} is requesting ${pluralize(theme.localisation.asset.lower)} for ${props.resource.title}`}
            className="button button--filled" type="button">
          <Icon id="i-email" classes="button__icon" />
          Request {pluralize(theme.localisation.asset.upper)}
        </a>
      </div>
    )
  }


  const renderActiveSeries = () => {
    const hash = window.location.hash
    let seriesTypes = (props.types || []).filter(t => props.resource['active-series'].find(series => series['custom-attributes'].find(a => a['custom-attribute-type'].id === t.id))).filter(t => t.config.displayOnFrontend).sort((a, b) => a.position - b.position)
    const featuredSeriesTypes = seriesTypes.filter(s => s.config.featured)
    if(props.theme.features.customAttributes.featured) {
      seriesTypes = seriesTypes.filter(s => !s.config.featured)
    }

    //check client doesn't have specifc conditions to hide series
    const hideSeriesDisplay = programmeDetailsCV.hideSeriesCondition(resource['programme-type']?.name)

    if (activeSeries.length >= programmeDetailsCV.seriesMinimumDisplay && !hideSeriesDisplay) {
      return (
        <div key={'active_series'} style={{
          ...(!shouldDisplaySeriesCount() && {paddingTop: '45px'})
        }}
        >
          <ClientSpecific client="ae">
            <h2 className="heading--two">By {theme.localisation.series.upper}</h2>
          </ClientSpecific>
          <ClientSpecific client="drg">
            <h2 className="heading--two">{theme.localisation.programme.upper} info</h2>
          </ClientSpecific>
          {activeSeries.sort((a, b) => theme.features.programmeOverview.seriesReverseOrder ? (b.position - a.position || b?.name?.localeCompare(a?.name)) : (a.position - b.position || a?.name?.localeCompare(b?.name)))
            .map((series, index) => {
            const nonFeaturedAttributes = series['custom-attributes'].filter(a => !a['custom-attribute-type'].config.featured)
            const hasSeriesAttributes = theme.features.programmeOverview.series && nonFeaturedAttributes?.length > 0 && seriesTypes?.length > 0
            const hasSeriesTalents = theme.features.talents && series['series-talents'] && series['series-talents']?.length > 0
            const hasEpisodes = theme.features.programmeOverview.episodes && series.episodes?.length > 0
            const hasSeriesBroadcasters = theme.features.programmeOverview.broadcasters.series && seriesBroadcasters[series.id]?.length > 0
            const hasProductionCompanies = theme.features.programmeOverview.productionCompanies.series && productionCompaniesSeries[series.id]?.length > 0
            const seriesCollapsible = (series.description && series.description?.length > 400) || hasSeriesAttributes || hasSeriesTalents || hasEpisodes || hasSeriesBroadcasters || hasProductionCompanies
            let seriesClasses= 'programme-details__series'
            if(theme.features.programmeOverview.seriesReveal){
              seriesClasses += ` programme-details__series--collapsible ${!props.openSeries.includes(index) && 'programme-details__series--closed'}`
            }
            let featuredAttributes = []
            featuredSeriesTypes.map(t => {
              series['custom-attributes'].filter(a => a['custom-attribute-type'].id === t.id)
              .sort((a, b) => a.position - b.position)
              .map(c => {
                featuredAttributes.push({
                  id: c.id,
                  value: c['custom-attribute-type']['attribute-type'] === 'Date' ? moment(c.value).format(theme.features.formats.shortDate) : (
                    c['custom-attribute-type']['attribute-type'] === 'Boolean' ? (c.value ? 'Yes' : 'No') : c.value)
                })
              })
            })

            return (
              <ShowHide key={series.id} id={`series-${series.id}`}
                open={hash ? hash === `#series-${series.id}` : (programmeDetailsCV.firstSeriesOpen && index === 0)}
                subTitle={programmeDetailsCV.activeSeriesSubTitle(series)}
                tags={props.theme.features.customAttributes.featured && featuredAttributes}
                title={series.name}
                restricted={series.restricted && props.user && isInternal(props.user)}
                newRelease={series['new-release']}
                triggerContent={() => props.user && props.addToList && (
                  <button onClick={props.addToList([series])} className="icon-button" type="button" title={`Add to ${props.theme.localisation.list.lower}`}>
                    <ClientChoice>
                      <ClientSpecific client="default">
                        <Icon id="i-add-to-list" />
                      </ClientSpecific>
                      <ClientSpecific client="cineflix">
                        <Icon id="i-add" />
                      </ClientSpecific>
                    </ClientChoice>
                  </button>
                )} >


                {theme.features.programmeOverview.series && (series['has-description'] || hasSeriesAttributes || hasSeriesTalents || hasEpisodes) &&
                  <>
                  <div className={seriesClasses}>
                    {theme.features.programmeOverview.series && series.description &&
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(series.description) }} className="wysiwyg"></div>
                    }
                    {(hasSeriesAttributes || hasSeriesTalents || hasSeriesBroadcasters) &&
                      <div className="programme-details__breakdown">
                        <ClientChoice>
                          <ClientSpecific client="default">
                            <p><strong>{theme.localisation.series.upper} Information</strong></p>
                          </ClientSpecific>
                          <ClientSpecific client="ae">
                            <div className="tags">
                              {series['number-of-episodes'] > 0 &&
                                <span className="tag tag--secondary">{`${series['number-of-episodes']} ${pluralize(theme.localisation.episodes.upper)}`}</span>
                              }
                            </div>
                          </ClientSpecific>
                        </ClientChoice>
                        <table className="attributes">
                          <tbody>
                            {theme.features.talents &&
                              props.talentTypes && props.talentTypes.sort((a, b) => a.position - b.position).map(t => {
                                const attributes = series['series-talents'].filter(a => a['talent-type'].id === t.id)
                                if(!attributes?.length){
                                  return false
                                }
                                return (
                                  <tr className="attributes__row" key={t.id} >
                                    <td className="attributes__cell">{t.name}</td>
                                    <td className="attributes__cell">
                                      {attributes?.map(attr => {
                                        return (
                                          <Tooltip direction={'top'} content={attr.summary}>
                                            <NavLink key={attr.id}
                                              className="tag"
                                              to={`/${theme.variables.SystemPages.catalogue.path}?filter[talent]=${attr.talent.id}`}>
                                              {`${attr.talent.firstname || ''} ${attr.talent.surname || ''}`}
                                            </NavLink>
                                          </Tooltip>
                                        )
                                      })}
                                    </td>
                                  </tr>
                                )
                              })}

                            {hasSeriesBroadcasters && (
                              <tr className="attributes__row" key={'someID'}>
                                <td className="attributes__cell">{theme.localisation.broadcaster.upper}</td>
                                <td className="attributes__cell">
                                  {theme.features.programmeFilters.broadcasters ? (
                                    seriesBroadcasters[series.id].map((sb) => (
                                      <NavLink
                                        key={sb.id}
                                        className={programmeDetailsCV.tagClasses}
                                        to={`/${theme.variables.SystemPages.catalogue.path}?filter[broadcaster]=${sb.broadcaster.id}`}
                                      >
                                        {sb.broadcaster.name}
                                      </NavLink>
                                    ))
                                  ) : (
                                    seriesBroadcasters[series.id].map((sb) => sb.broadcaster.name).join(', ')
                                  )}
                                </td>
                              </tr>
                            )}

                            {hasProductionCompanies && (
                              <tr className="attributes__row" key={'someID'}>
                                <td className="attributes__cell">{pluralize(theme.localisation.productionCompany.upper)}</td>
                                <td className="attributes__cell">
                                  {theme.features.programmeFilters.productionCompanies ? (
                                    productionCompaniesSeries[series.id].map((pcS) => (
                                      <NavLink
                                        key={pcS.id}
                                        className={programmeDetailsCV.tagClasses}
                                        to={`/${theme.variables.SystemPages.catalogue.path}?filter[production_company]=${pcS['production-company'].id}`}
                                      >
                                        {pcS['production-company'].name}
                                      </NavLink>
                                    ))
                                  ) : (
                                    productionCompaniesSeries[series.id].map((pcS) => pcS['production-company'].name).join(', ')
                                  )}
                                </td>
                              </tr>
                            )}

                            {hasSeriesAttributes && seriesTypes.map(t => {
                              const attributes = nonFeaturedAttributes
                                .filter(a => a['custom-attribute-type'].id === t.id)
                                .sort((a, b) => a.position - b.position)
                                .map(c => {
                                  if(t['attribute-type'] === 'Boolean') {
                                    return c.value ? 'Yes' : 'No'
                                  } else if(t['attribute-type'] === 'Date') {
                                    return moment(c.value).format(theme.features.formats.shortDate)
                                  } else {
                                    return c.value
                                  }
                                })
                              if(!attributes?.length){
                                return false
                              }
                              return (
                                <tr className="attributes__row" key={t.id}>
                                  <td className="attributes__cell">{singularize(t.name)}</td>
                                  <td className="attributes__cell">{attributes.join(', ')}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    }
                    {hasEpisodes &&
                      <div className="wysiwyg">
                        {series.episodes.map((e, index) => {
                          return (
                            <div key={e.id} >
                              <h4 className="show-hide__content" key={index}>{e.name}</h4>
                              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(e.description) }} className="wysiwyg"></div>
                            </div>
                          )
                        })}
                      </div>
                    }
                  </div>
                  { theme.features.programmeOverview.seriesReveal && seriesCollapsible &&
                    <button className={'text-button'} type="button" onClick={() => props.updateOpenSeries(index)}>{props.openSeries.includes(index) ? 'Show Less' : 'Read More'}</button>
                  }
                  { theme.features.programmeOverview.seriesImages && series['series-images'] && series['series-images']?.length > 0 &&
                    <Gallery items={
                      series['series-images'].map(s => s.file && ({
                        image: s.file.url.replace('.net/', '.net/1300xnull/'),
                        thumbnail: s.file.admin_preview.url.replace('.net/', '.net/360x220/'),
                        alt: series.name,
                        caption: 'Click to enlarge'
                      }))} />
                  }
                  </>
                }
              </ShowHide>
            )
          })}
        </div>
      )
    }
    return null
  }

  const years = (range = false) => {
    const startDate = props.resource['production-start'] || props.resource['production-end']
    const endDate = props.resource['production-end'] || props.resource['production-start']
    const startYear = moment(startDate).year()
    let endYear = moment(endDate).year()
    //if start date is newer then either user entered dates wrong
    //or no end date is provided so 1970 is coming as end year
    if (startYear > endYear) {
      endYear = startYear
    }
    const tags = []
    if(range && startYear !== endYear) {
      tags.push(<NavLink className={programmeDetailsCV.tagClasses} to={`/${theme.variables.SystemPages.catalogue.path}?filter[production_year]=${startYear},${endYear}`}>{`${startYear} - ${endYear}`}</NavLink>)
    } else {
      for (let i = 0; i < endYear - startYear + 1; i += 1) {
        tags.push(<NavLink key={i} className={programmeDetailsCV.tagClasses} to={`/${theme.variables.SystemPages.catalogue.path}?filter[production_year]=${props.resource['production-start'] ? startYear + i : ''},${props.resource['production-end'] ? startYear + i : ''}`}>{startYear + i}</NavLink>)
      }
    }
    return tags
  }

  const renderList = (list) => (
    <div className="tags">
      {list.map(({ id, name }) => (<span key={id+name} className="tag">{name}</span>))}
    </div>
  )

  const renderLinkList = (list, filter) => {
    let {tagClasses, tagGenreColours} = programmeDetailsCV
    return (
      <div className="tags">
        {list.map(({ id, name }) => (<NavLink key={id+name} className={`${tagClasses} ${tagGenreColours && `tag--${name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()}`}`} to={`/${theme.variables.SystemPages.catalogue.path}?${filter}=${id}`}>{name}</NavLink>))}
      </div>
    )
  }

  const renderProductionCompanies = () => {
    if (theme.features.programmeOverview.productionCompanies.programme && programmeFromApi?.['production-companies-programmes']?.filter((p) => p['production-company'])?.length) {
      return (
        <div className="programme-details__tags">
          <h3 className={programmeDetailsCV.attributeHeadingClasses}>{programmeDetailsCV.productionCompaniesText(programmeFromApi)}</h3>
          <div className="tags">
            {programmeFromApi?.["production-companies-programmes"]?.sort((a, b) => a.position - b.position)
              .filter((p) => p['production-company'])
              .map((companyProgramme) => theme.features.programmeFilters.productionCompanies ? (
                <NavLink
                  key={companyProgramme.id}
                  className={programmeDetailsCV.tagClasses}
                  to={`/${theme.variables.SystemPages.catalogue.path}?filter[production_company]=${companyProgramme['production-company'].id}`}
                >
                  {companyProgramme['production-company'].name}
                </NavLink>
              ) : (
                <span className="tag">
                  {companyProgramme['production-company'].name}
                </span>
              ))}
          </div>
        </div>
      )
    } else {
      return false
    }
  }

  const renderProgrammeBroadcasters = () => {
    const { localisation, features } = theme
    if (features.programmeOverview.broadcasters.programme && programmeBroadcasters.length) {
      return (
        <div className="programme-details__tags">
          <h3 className={programmeDetailsCV.attributeHeadingClasses}>
            {pluralize(localisation.broadcaster.upper)}
          </h3>
          <div className="tags">
            {theme.features.programmeFilters.broadcasters ? (
              programmeBroadcasters.map((programmeBroadcaster) => (
                <NavLink
                  key={programmeBroadcaster.id}
                  className={programmeDetailsCV.tagClasses}
                  to={`/${theme.variables.SystemPages.catalogue.path}?filter[broadcaster]=${programmeBroadcaster.broadcaster.id}`}
                >
                  {programmeBroadcaster.broadcaster.name}
                </NavLink>
              ))
            ) : (
              programmeBroadcasters.map((programmeBroadcaster) => (
                <span className="tag">
                  {programmeBroadcaster.broadcaster.name}
                </span>
              ))
            )}
          </div>
        </div>
      )
    } else {
      return false
    }
  }

  const sortAlphabetically = genres => genres.sort((a, b) => a.name.localeCompare(b.name))

  const putParentsFirst = (genres) => {
    const parentGenres = []
    const childGenres = []
    genres.filter(({ name }) => name).forEach((genre, i) => {
      if (genre['parent-id']) {
        childGenres.push(genre)
      } else {
        parentGenres.push(genre)
      }
    });
    return [
      ...parentGenres.sort((a, b) => a?.name?.localeCompare(b?.name)),
      ...childGenres.sort((a, b) => a?.name?.localeCompare(b?.name)),
    ]
  }

  const renderProgrammeDescription = () => {
    if (programmeDetailsCV.showProgrammeDescription(resource)) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resource.description) }}
          className="wysiwyg"
          key={'programme_description'}
        />
      )
    }
    return null
  }

  const renderProgrammeDescriptionSubHeading = () => (
    <h3 className="heading--three" key={'programme_description_sub_heading'}>Description</h3>
  )

  const renderProgrammeDescriptionIfExists = () => {
    if (!resource.description || !resource.description.replace(/(<([^>]+)>)/ig, '').trim().length) return null
    return renderProgrammeDescriptionWithSubHeading()
  }

  const renderProgrammeDescriptionWithSubHeading = () => (
    <div key={'progDesc-with-subHeading'}>
      { renderProgrammeDescriptionSubHeading() }
      { renderProgrammeDescription() }
    </div>
  )

  const renderProgrammeDescriptionWithTagline = () => {
    const tagline = resource['custom-attributes'].find(v => v['custom-attribute-type'].name === 'Tagline')
    return (
      <>
        {tagline && (
          <h3 className="heading--three" key={'programme_description_tagline'}>{tagline.value}</h3>
        )}
        { renderProgrammeDescription() }
      </>
    )
  }

  const renderMarketingCreditLine = () => {
    const marketingCreditLine = resource['custom-attributes'].find(v => v['custom-attribute-type'].name === 'Marketing credit line')
    if (marketingCreditLine) {
      return (
        <p key={'marketing_credit_line'}>{marketingCreditLine.value}</p>
      )
    }
    return null
  }

  const renderGenres = (genreList: GenreListType) => {
    if (!resource.genres?.length || (genreList === 'parentOnly' && !resource.genres?.filter(g => !g['parent-id'])?.length)) return null
    const genreGenerator: { [K in GenreListType]: (genres: GenreType[]) => any } = {
      normal: (genres) => genres,
      childWithParent: (genres) => genres,
      alphabetical: (genres) => sortAlphabetically(genres),
      parentFirst: (genres) => putParentsFirst(genres),
      parentAndChild: (genres) => ({
        parentGenre: genres.filter(g => !g['parent-id']),
        childGenre: genres.filter(g => g['parent-id'])
      }),
      parentOnly: (genres) => genres.filter(g => !g['parent-id']),
    }
    if (genreList === 'parentAndChild') {
      const { parentGenre, childGenre } = genreGenerator[genreList](resource.genres)
      return (
        <div key={'genres'} className="programme-details__tags">
          {parentGenre?.length > 0 &&
            <div>
              <h3 className={programmeDetailsCV.attributeHeadingClasses}>{programmeDetailsCV.genresHeading}</h3>
              {renderLinkList(parentGenre, 'filter[genre]')}
            </div>
          }
          {childGenre?.length > 0 &&
            <div>
              <h3 className={programmeDetailsCV.attributeHeadingClasses}>Sub-{programmeDetailsCV.genresHeading}</h3>
              {renderLinkList(childGenre, 'filter[genre]')}
            </div>
          }
        </div>
      )
    }
    if(genreList === 'childWithParent'){
      resource.genres = resource.genres.map(g => {
        return ({
          ...g,
          name: g['parent-name'] && !g.name.includes(g['parent-name']) ? `${g['parent-name']} - ${g.name}` : g.name
        })
      })
    }
    return (
      <div key={'genres'} className="programme-details__tags">
        <h3 className={programmeDetailsCV.attributeHeadingClasses}>{programmeDetailsCV.genresHeading}</h3>
        {renderLinkList(genreGenerator[genreList](resource.genres), 'filter[genre]')}
      </div>
    )
  }

  const renderSubGenres = () => {
    const subGenres = resource.genres.filter(g => g['parent-id'])
    if (!subGenres.length) return null
    return (
      <div key={'sub-genres'} className="programme-details__tags">
        <h3 className={programmeDetailsCV.attributeHeadingClasses}>{programmeDetailsCV.subGenresHeading}</h3>
        {renderLinkList(subGenres, 'filter[genre]')}
      </div>
    )
  }

  const renderCatalogues = () => {
    const catalogues = resource.catalogues
    if (!catalogues?.length) return null
    return (
      <div key={'catalogues'} className="programme-details__tags">
        <h3 className={programmeDetailsCV.attributeHeadingClasses}>{programmeDetailsCV.cataloguesHeading}</h3>
        {renderLinkList(catalogues, 'filter[catalogue]')}
      </div>
    )
  }

  const renderProductionYears = (range = false) => {
    const yearsTags = years(range)
    if ((resource['production-start'] || resource['production-end']) && yearsTags?.length > 0 ) {
      return (
        <div key={'production_years'} className="programme-details__tags">
          <h3 className={programmeDetailsCV.attributeHeadingClasses}>{programmeDetailsCV.productionYearsHeading}</h3>
          <div className="tags">
            {yearsTags}
          </div>
        </div>
      )
    }
    return null
  }

  const renderProductionStartYear = () => {
    let heading = 'Release Year'
    if (resource['production-start'] && activeSeries?.length === 0) {
      return (
        <div key={'production_years'} className="programme-details__tags">
          <h3 className={programmeDetailsCV.attributeHeadingClasses}>{heading}</h3>
          {renderList([{
            id: 0,
            name: moment(resource['production-start']).year()
          }])}
        </div>
      )
    }
    return null
  }

  const renderBooleanProgrammeTypes = () => {
    const booleanProgrammeTypes = programmeTypes.filter(t => t['attribute-type'] === 'Boolean')
    if (!booleanProgrammeTypes?.length) return null
    return (
      <div key={'boolean_programmes'} className="programme-details__tags">
        <ClientSpecific client="ae">
          <h3 className={programmeDetailsCV.attributeHeadingClasses}></h3>
        </ClientSpecific>
        <div className="tags">
          {booleanProgrammeTypes.map(type => {
            const attributes = resource['custom-attributes']
              .filter(attr => attr.value && attr['custom-attribute-type'].id === type.id)
              .sort((a, b) => a.position - b.position)

            return attributes.map(attr => {
              if (type.config.filterable) {
                return <NavLink key={attr.id} className="tag" to={`/${theme.variables.SystemPages.catalogue.path}?filter[custom_attribute_id_and_value]=${type.id}:true` }>
                  {type.name}
                </NavLink>
              } else {
                return <span className="tag" key={attr.id}>
                  {type.name}
                </span>
              }
            })
          })}
        </div>
      </div>
    )
  }

  const renderNonBooleanProgrammeTypes = () => {
    let nonBooleanProgrammeTypes = programmeTypes.filter(t => t['attribute-type'] !== 'Boolean' && !programmeDetailsCV.customAttributeDisplayOverride.includes(t.name.toLowerCase()))
    nonBooleanProgrammeTypes = programmeDetailsCV.filterNonBooleanProgrammeTypes(nonBooleanProgrammeTypes)
    //These attributes are shown if there are no series to show it instead
    const nonBooleaanAttributesOverride = activeSeries?.length <= 1 ? programmeTypes.filter(t => t['attribute-type'] !== 'Boolean' && programmeDetailsCV.customAttributeDisplayOverride.includes(t.name.toLowerCase())) : []
    return (
      <>
        {[...nonBooleanProgrammeTypes, ...nonBooleaanAttributesOverride].map(t => {
          const attributes = resource['custom-attributes'].filter(a => a['custom-attribute-type'].id === t.id).sort((a, b) => a.position - b.position)
          return (
            <div key={`non_boolean_programmes_${t.id}`} className="programme-details__tags">
              <h3 className={programmeDetailsCV.attributeHeadingClasses}>{Humanize(t.name)}</h3>
              <div className="tags">
                {attributes.map(attr => {
                  let value = attr.value
                  if (t['attribute-type'] === 'Date') {
                    value = moment(attr.value).format(theme.features.formats.shortDate)
                  }
                  if (t.config.filterable) {
                    return (
                      <NavLink key={attr.id}
                        className="tag"
                        // need to keep the double usage of encodeURIComponent
                        to={`/${theme.variables.SystemPages.catalogue.path}?filter[custom_attribute_id_and_value]=${t.id}:${encodeURIComponent(encodeURIComponent(attr.value))}`}
                      >
                        {typeof value === typeof true ? value ? 'Yes' : 'No' : value}
                      </NavLink>
                    )
                  } else {
                    return <span className="tag" key={attr.id}>
                      {typeof value === typeof true ? value ? 'Yes' : 'No' : value}
                    </span>
                  }
                })}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  const renderCustomAttributes = () => {
    return resource['custom-attributes'].sort((x, y) => x.position - y.position).map((t, i) => {
      const type = programmeTypes.find(a => a.id === t['custom-attribute-type'].id)
      if (!type) {
        return false
      }
      const attributes = resource['custom-attributes'].filter(c => c['custom-attribute-type'].id === type.id).sort((x, y) => x.position - y.position)
      if (type.name.toLowerCase() === 'duration') {
        return durations()
      } else {
        return (
          <div key={`custom_attributes_${type.id}`} className="programme-details__tags">
            <h3 className={programmeDetailsCV.attributeHeadingClasses}>{type.name}</h3>
            <div className="tags">
              {attributes.map(attr => {
                let value = attr.value
                if (attr['custom-attribute-type'] && (attr['custom-attribute-type']['attribute-type'] === 'Date')) {
                  value = moment(attr.value).format(theme.features.formats.shortDate)
                }
                if (type.config.filterable) {
                  return (
                    <NavLink key={attr.id}
                      className="tag tag--plain"
                      // need to keep the double usage of encodeURIComponent
                      to={`/${theme.variables.SystemPages.catalogue.path}?filter[custom_attribute_id_and_value]=${type.id}:${encodeURIComponent(value)}` }
                    >
                      {typeof value === typeof true ? value ? 'Yes' : 'No' : value}
                    </NavLink>
                  )
                } else {

                  return <span className="tag tag--plain" key={attr.id}>
                    {typeof value === typeof true ? value ? 'Yes' : 'No' : value}
                  </span>
                }
              })}
            </div>
          </div>
        )
      }
    })
  }

  const renderTalents = () => {
    if (theme.features.talents && resource['programme-talents'] && props.talentTypes) {
      const programmeTalentTypes = props.talentTypes.filter(t => resource['programme-talents'] && resource['programme-talents'].find(a => a['talent-type'].id === t.id)).sort((a, b) => a.position - b.position)
      return programmeTalentTypes.map(t => {
        const attributes = resource['programme-talents'].filter(a => a['talent-type'].id === t.id)
        if (!attributes?.length) {
          return false
        }
        return (
          <div key={`programme_talents_${t.id}`} className="programme-details__tags">
            <h3 className={programmeDetailsCV.attributeHeadingClasses}>{t.name}</h3>
            <div className="tags">
              {attributes?.map(attr => {
                return (
                  <div style={{width: '100%'}}>
                    <Tooltip direction={programmeDetailsHasSidePanel ? 'top' : 'right'} content={attr.summary}>
                      <NavLink key={attr.id}
                        className="tag"
                        to={`/${theme.variables.SystemPages.catalogue.path}?filter[talent]=${attr.talent.id}`}>
                        {`${attr.talent.firstname || ''} ${attr.talent.surname || ''}`}
                      </NavLink>
                    </Tooltip>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })
    }
    return null
  }

  const renderProgrammeTags = () => (
    <div className="tags">
      {programmeDetailsCV.programmeTagsOrder.map((key) => contentMap[key]())}
    </div>
  )

  const renderProgrammeType = () => {
    if (!resource['programme-type'] || !theme.features.programmeTypes.enabled) return null

    return (
      <div key={'programme-type'} className="programme-details__tags">
        <h3 className={programmeDetailsCV.attributeHeadingClasses}>{theme.localisation.programmeType.upper}</h3>
        <div className="tags">
          <NavLink className={programmeDetailsCV.tagClasses}
            to={`/${theme.variables.SystemPages.catalogue.path}?filter[programme-type]=${resource['programme-type'].id}` }
          >
            {resource['programme-type'].name}
          </NavLink>
        </div>
      </div>
    )
  }

  const renderLanguages = () => {
    if (!resource.languages?.length) return null
    if (programmeDetailsCV.showLanguages(resource)) {
      return (
        <div key={'languages'} className="programme-details__tags">
          <h3 className={programmeDetailsCV.attributeHeadingClasses}>{programmeDetailsCV.languagesHeading(resource.languages)}</h3>
          <div className="tags">
            {resource.languages.map(({ id, name }, index) => (
              <NavLink key={`languages_${index}`} className={programmeDetailsCV.tagClasses}
                to={`/${theme.variables.SystemPages.catalogue.path}?filter[language]=${id}` }
              >
                {name}
              </NavLink>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const renderProductionInfoHeading = () => {
    return (
      <h2 className={programmeDetailsCV.headingClasses} key={'production_info'}>{programmeDetailsCV.productionInfoTitle}</h2>
    )
  }

  const shouldDisplaySeriesCount = () => {
    if (!theme.features.programmeOverview.seriesCount) return false
    return resource['manual-number-of-series'] !== null ? resource['manual-number-of-series'] >= programmeDetailsCV.seriesMinimumDisplay : resource['active-series-counter'] >= programmeDetailsCV.seriesMinimumDisplay
  }

  const seriesCountString = () => {
    return <><span className="tag__highlight">{seriesCount}</span>&nbsp;{seriesCount > 1 ? pluralize(theme.localisation.series.lower) : theme.localisation.series.lower}</>
  }

  const contentMap = {
    activeSeries: renderActiveSeries,
    alternativeTitles: () => {
      if (theme.features.alternativeTitles && resource['programme-alternative-titles']?.length) {
        return (
          <div key={'alternative_titles'}>
            <h3 className={programmeDetailsCV.attributeHeadingClasses}>
              {pluralize(theme.localisation.programmeAlternativeTitle.upper)}
            </h3>
            {renderList(resource['programme-alternative-titles'])}
          </div>
        )
      }
      return null
    },
    booleanProgrammeTypes: renderBooleanProgrammeTypes,
    catalogues: renderCatalogues,
    customAttributes: renderCustomAttributes,
    durationTag: () => durations(true),
    episodeCount: () => {
      if (theme.features.programmeOverview.episodeCount) {
        return (
          <p key={'episode_count'}>{seriesCountString()} ({resource['number-of-episodes']} episodes)</p>
        )
      }
      return null
    },
    episodeTag: () => {
      if(resource['number-of-episodes'] >= 1) {
        <span className="tag tag--secondary"><span className="tag__highlight">{resource['number-of-episodes']}</span> episodes</span>
      }
    },
    genres: () => renderGenres('normal'),
    genresAlphabetical: () => renderGenres('alphabetical'),
    genresParentFirst: () => renderGenres('parentFirst'),
    genresParentAndChild: () => renderGenres('parentAndChild'),
    genresChildWithParent: () => renderGenres('childWithParent'),
    genresParentOnly: () => renderGenres('parentOnly'),
    languages: renderLanguages,
    login: () => {
      if (!props.user && !token) {
        return (
          <div key={'login'}>
            <ClientSpecific client="cineflix">
              <h3 className="heading--two">Login to Screen</h3>
            </ClientSpecific>
            <Session location={ props.location } inpage={ true } />
          </div>
        )
      }
      return null
    },
    marketingCreditLine: renderMarketingCreditLine,
    nonBooleanProgrammeTypes: renderNonBooleanProgrammeTypes,
    pdfAsset: renderAsset,
    productionCompanies: renderProductionCompanies,
    productionInfoHeading: renderProductionInfoHeading,
    productionYears: renderProductionYears,
    productionYearsRange: () => renderProductionYears(true),
    productionStartYear: renderProductionStartYear,
    programmeBroadcasters: renderProgrammeBroadcasters,
    programmeDescriptionIfExists: renderProgrammeDescriptionIfExists,
    programmeDescription: renderProgrammeDescription,
    programmeDescriptionWithSubHeading: renderProgrammeDescriptionWithSubHeading,
    programmeDescriptionWithTagline: renderProgrammeDescriptionWithTagline,
    programmeHeading: () => (
      <h2 className="heading--two" key={'programme_heading'}>{programmeDetailsCV.programmeHeading(theme.localisation.programme.upper)}</h2>
    ),
    programmeTags: renderProgrammeTags,
    programmeType: renderProgrammeType,
    qualities: () => {
      if (resource.qualities?.length) {
        return (
          <div key={'qualities'} className="programme-details__tags">
            <h3 className={programmeDetailsCV.attributeHeadingClasses}>{resource['qualities']?.length === 1 ? theme.localisation.quality.upper : pluralize(theme.localisation.quality.upper)}</h3>
            {renderLinkList(resource.qualities, 'filter[quality]')}
          </div>
        )
      }
      return null
    },
    requestForAsset: () => {
      if (theme.features.programmeOverview.requestForAssets.enabled && props.user && resource['programme-type'] && resource['programme-type'].name !== 'Format') {
        return renderRequestForAsset()
      }
      return null
    },
    seriesAndEpisodeCount: () => {
      if (shouldDisplaySeriesCount()) {
        return (
          <div key={'series_episode_count'}>
            <h3 className={programmeDetailsCV.attributeHeadingClasses}>
             {programmeDetailsCV.seriesAndEpisodeCountText}
            </h3>
            <p>{seriesCountString()}
              { theme.features.programmeOverview.episodeCount && resource['number-of-episodes'] > 0 &&
                ` (${resource['number-of-episodes']} episodes)`
              }
            </p>
          </div>
        )
      }
      return null
    },
    seriesCount: () => {
      if (shouldDisplaySeriesCount()) {
        return (
          <div key={'series_count'}>
            <h3 className={programmeDetailsCV.attributeHeadingClasses}>{pluralize(theme.localisation.series.upper)}</h3>
            <div className="tags">
              <span className="tag">{seriesCount}</span>
            </div>
          </div>
        )
      }
      return null
    },
    seriesTag: () => {
      if (shouldDisplaySeriesCount()) {
        return <span className="tag tag--secondary">{seriesCountString()}</span>
      }
    },
    subGenres: renderSubGenres,
    talents: renderTalents,
  }

  const layout = catalogueLayout[theme.features.programmeOverview.template].programmeDetails
  if(props.type === 'info') {
    return (
      <div className="container" >
        <div className="programme-details programme-details--full">
           {layout.main.map((key) => contentMap[key]())}
        </div>
      </div>
    )
  } else if (props.type === 'meta') {
    return (
      <div className="container">
        {layout.side.map((key) => contentMap[key]())}
      </div>
    )
  } else {
    return (
      <div className="container" >
        <div className="programme-details">
          <div className="programme-details__main">
            { layout.main.map((key) => contentMap[key]()) }
          </div>
          <div className="programme-details__side">
            { layout.side.map((key) => contentMap[key]()) }
          </div>
        </div>
      </div>
    )
  }
}

export default ProgrammeDetails
