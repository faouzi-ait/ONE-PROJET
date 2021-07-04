import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import { NavLink } from 'react-router-dom'

import compose from 'javascript/utils/compose'

import useSortedVideos from 'javascript/utils/hooks/use-sorted-videos'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'
import withUser from 'javascript/components/hoc/with-user'
import { isInternal } from 'javascript/services/user-permissions'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

import { NO_CUSTOM_BANNER } from 'javascript/utils/constants'
import Banner, { getBannerImageUrls } from 'javascript/components/banner'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import Icon from 'javascript/components/icon'
import PdfDownloadButton from 'javascript/components/pdf-download-button'

import {
  GenreType,
  ProgrammeType,
  UserType,
  VideoType,
} from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

import allClientVariables from './variables'
import programmeDetailsClientVariables from 'javascript/views/catalogue/show/programme-details/variables'

interface Props {
  addToList: (resource: Partial<ProgrammeType>[]) => (e: any) => void
  breakpoints: any
  genres: GenreType[]
  isPublic: boolean
  openVideoModal: (video: VideoType) => void
  resource: Partial<ProgrammeType>
  theme: ThemeType
  user: UserType
}

const CatalogueBanner: React.FC<Props> = ({
  addToList,
  breakpoints,
  genres,
  isPublic,
  openVideoModal,
  resource,
  theme,
  user,
}) => {

  let bannerImage = getBannerImageUrls(resource)
  const sortedVideos = useSortedVideos()
  const BannerTextColor = resource['custom-attributes'].find(a => a['custom-attribute-type'].name === 'Banner Text Colour')
  const bannerVideo = resource['video-banner']
  const [promoVideo, setPromoVideo] = useState<VideoType>()

  useEffect(() => {
    const fetchPromoVideo = async (promoVideoId) => {
      setPromoVideo(await sortedVideos.getPromoVideo(promoVideoId))
    }
    fetchPromoVideo(resource['promo-video-id'])
  }, [resource['promo-video-id']])

  // @ts-ignore
  const clientVariables = useClientVariables(allClientVariables, {
    bannerClasses: {
      'cineflix': [bannerImage ? 'end' : 'intro', sortedVideos.getAllSortedVideosLength() ? 'shaded' : 'white']
    },
    tagsOrder: {
      default: [],
      'ae': ['catalogueName', 'seriesCount', 'episodesCount'],
      'all3': [resource?.['programme-type']?.name !== 'Format' && 'episodesCount', 'genres'],
      'banijaygroup | discovery | fremantle': ['genres'],
    },
  })
  const programmeDetailsCV = useClientVariables(programmeDetailsClientVariables)

  const renderAddToList = () => {
    return (
      <div style={clientVariables.bannerActionButtonStyles} >
        <button onClick={addToList([resource])} className={clientVariables.addListClasses} title={`Add to ${theme.localisation.list.lower}`}>
          <ClientChoice>
            <ClientSpecific client="default">
              <Icon id="i-add-to-list" />
            </ClientSpecific>
            <ClientSpecific client="ae">
              <Icon id="i-add-to-list" width="48px" height="48px" />
            </ClientSpecific>
            <ClientSpecific client="drg">
                <span className="button-circle__icon">
                  <Icon id="i-add-to-list" />
                </span>
                <span className="button-circle__text">Add {theme.localisation.programme.lower} to a {theme.localisation.list.lower}</span>
            </ClientSpecific>
            <ClientSpecific client="itv">
              <Icon id="i-add-to-list-simple" width="19px" height="18px" viewBox="0 0 19 18" className="button__icon" />
              <span>Add to {theme.localisation.list.lower}</span>
            </ClientSpecific>
            <ClientSpecific client="amc | banijaygroup | demo">
              <Icon id="i-add-to-list" className="button__icon" />
              <span>Add {theme.localisation.programme.lower} to a {theme.localisation.list.lower}</span>
            </ClientSpecific>
            <ClientSpecific client="cineflix">
              <Icon id="i-add" className="button__icon" />
              <span> Add to a {theme.localisation.list.lower}</span>
            </ClientSpecific>
          </ClientChoice>
        </button>
      </div>
    )
  }

  const renderPromoVideo = () => {
    if(promoVideo){
      return (
        <div>
          <button
            className={clientVariables.openPromoVideoButtonClasses}
            style={clientVariables.bannerActionButtonStyles}
            onClick={() => openVideoModal(promoVideo)}
            title="Watch Promo"
            >
            <ClientChoice>
              <ClientSpecific client="default">
                <Icon classes="button__icon" id="i-play" />
              </ClientSpecific>
              <ClientSpecific client="discovery">
              </ClientSpecific>
            </ClientChoice>
            {clientVariables.promoButtonCopy &&
              <span>{clientVariables.promoButtonCopy}</span>
            }
          </button>
        </div>
      )
    }
  }

  const renderPdfSheet = () => {
    if(theme.features.programmeOverview.pdfSheet) {
      return (
        <div style={clientVariables.bannerActionButtonStyles}>
          <PdfDownloadButton
            displayPdf={true}
            pdfType="programmes"
            pdfTitle={resource.title}
            postData={{
              id: resource.id || -1,
              Localisation: theme.localisation,
              programmeFeatures: {
                ...theme.features.programmeOverview,
                talent: theme.features.talents
              }
            }}
          />
        </div>
      )
    }
  }

  const renderGenres = () => {
    return genres || null
  }

  const renderCatalogueName = () => {
    return resource.catalogues?.map(c => c.name) || null
  }

  const renderSeriesCount = () => {
    const seriesCount = resource['manual-number-of-series'] || resource['active-series-counter']
    if(seriesCount >= programmeDetailsCV.seriesMinimumDisplay) {
      return [`${seriesCount} ${pluralize(theme.localisation.series.upper)}`]
    } else {
      return null
    }
  }

  const renderEpisodesCount = () => {
    const episodeCount = resource['number-of-episodes']
    if(episodeCount >= 1) {
      return [`${episodeCount} ${pluralize(theme.localisation.episodes.shorthand)}`]
    } else {
      return null
    }
  }

  const renderTags = () => {
    let tags = []
    clientVariables.tagsOrder.map((content) => {
      const update = content && contentMap[content]()
      if(update) {
        tags.push(...update)
      }
    })
    tags.filter(a => {return a?.length > 0 })
    return tags
  }

  const renderIntroduction = () => (
    <p className="banner__copy">
      {resource.introduction}
    </p>
  )

  const renderFormatLink = () => {
    if(theme.features.programmeFormats.enabled && resource.format) {
      return (
        <NavLink
          to={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(resource.format, theme)}`}
          className={clientVariables.formatButtonClasses}>
            {clientVariables.formatButtonCopy}
          </NavLink>
      )
    }
  }

  const renderNewRelease = () => {
    if(theme.features.programmeReleaseDate.newRelease && resource['new-release']){
      return (
        <span className="tag tag--new">New</span>
      )
    }
  }

  const contentMap = {
    'addToList': renderAddToList,
    'promoVideo': renderPromoVideo,
    'pdfSheet': renderPdfSheet,
    'introduction': renderIntroduction,
    'catalogueName': renderCatalogueName,
    'seriesCount': renderSeriesCount,
    'episodesCount': renderEpisodesCount,
    'genres': renderGenres,
    'format': renderFormatLink,
    'newRelease': renderNewRelease
  }

  return (
    <ClientProps
      clientProps={{
        title: {
          default: resource.title,
          'itv': !isPublic ? resource.title : null
        },
        copy: {
          'default': resource.introduction,
          'amc | banijaygroup | cineflix | fremantle': null,
          'itv': !isPublic ? resource.introduction : null
        },
        genres: {
          'banijaygroup | discovery | drg | keshet': genres,
          'itv': !isPublic ? genres : null
        },
        subTitle: {
          'all3': resource['programme-type']?.name
        },
        placeholder: {
          default: null,
          'ae': clientVariables.placeholderImage(resource.catalogues?.[0]?.name.toLowerCase(), resource.genres?.filter(g => !g['parent-id'])?.[0]?.name?.replace(/[^A-Z0-9]+/ig, "_").toLowerCase())
        }
      }}
      renderProp={(clientProps) => (
        <Banner
          image={bannerImage || NO_CUSTOM_BANNER}
          video={bannerVideo}
          shouldShowVideo={Boolean(bannerVideo)}
          textColor={BannerTextColor ? BannerTextColor.value : ''}
          logo={theme.features.programmeOverview.logoTitleBanner && resource.logo}
          restricted={user && resource.restricted && isInternal(user)}
          breakpoints={breakpoints}
          imageConfigVersion={'programme-banner'}
          classes={clientVariables.bannerClasses}
          tags={renderTags()}
          {...clientProps}
        >
          {user &&
            <div className={clientVariables.bannerActionClasses} >
              {clientVariables.contentOrder.map((content) => {
                return contentMap[content]()
              })}
            </div>
          }
        </Banner>
      )}
    />
  )
}

const enhance = compose(
  withUser,
  withTheme
)

export default enhance(CatalogueBanner)