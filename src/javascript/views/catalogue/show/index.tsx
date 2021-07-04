import React, {useEffect, useState} from 'react'
import DOMPurify from 'dompurify'
import deepmerge from 'deepmerge-concat'
import queryString from 'query-string'
import { RouteComponentProps } from 'react-router'

import allClientVariables from './variables'
import contentBlockClientVariables from 'javascript/views/admin/pages/content-blocks/variables'

import compose from 'javascript/utils/compose'
import { catalogueLayout } from 'javascript/config/features'
import { isClient } from 'javascript/utils/client-switch/tools'
import { removeTrailingSlash } from 'javascript/utils/generic-tools'
import { safeLocalStorage } from 'javascript/utils/safeLocalStorage'

// Hooks
import useAnonymousAccessValidation from 'javascript/views/anonymous-access/use-anonymous-access-validation'
import useMediaQuery from 'javascript/utils/hooks/use-media-query'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useResource from 'javascript/utils/hooks/use-resource'
import useSortedVideos from 'javascript/utils/hooks/use-sorted-videos'
import useWatchForTruthy from 'javascript/utils/hooks/use-watch-for-truthy'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'
import withVideoProviders, { WithVideoProvidersType } from 'javascript/components/hoc/with-video-providers'

// Components
import AdminToolbar from 'javascript/components/admin-toolbar'
import AssetBrowser from 'javascript/views/catalogue/show/assets'
import Blocks from 'javascript/views/blocks'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import CatalogueBanner from 'javascript/views/catalogue/show/catalogue-banner'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import FormatProgrammes from 'javascript/components/format-programmes'
import ListModal from 'javascript/components/list-modal'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import ModalVideo from 'javascript/components/modal-video'
import MyAssets from 'javascript/components/my-assets'
import ProgrammeDetails from 'javascript/views/catalogue/show/programme-details'
import PreviewBanner from 'javascript/components/preview-banner'
import RecentlyViewed from 'javascript/components/recently-viewed'
import RelatedProgrammes from 'javascript/components/related-programmes'
import Session from 'javascript/views/sessions/new'
import ShouldRenderContentBlock from 'javascript/views/blocks/should-render-content-block'
import Tabs from 'javascript/components/tabs'
import VideoCarousel from 'javascript/views/catalogue/show/video-carousel'

//@ts-ignore
import pdfIcon from 'images/file-types/pdf.svg'

// Services
import { subscribeToUnauthorisedErrorEmitter, unsubscribeToUnauthorisedErrorEmitter } from 'javascript/utils/insertApiMiddleware'

// Types
import {
  ProgrammeType,
  SeriesType,
  GenreType,
  MetaDatumType,
  CustomAttributeType,
  LanguageType,
  PageImageType,
  ProgrammeAlternativeTitleType,
  QualityType,
  ProgrammeTalentType,
  UserType,
  CatalogueType
} from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'


interface Props extends RouteComponentProps, WithPageHelperType, WithVideoProvidersType {
  location: any;
  login: () => void;
  theme: ThemeType
  token: string
  user: UserType
}

const LOGGED_IN = 'loggedIn'
const LOGGED_OUT = 'loggedOut'

const CatalogueShow: React.FC<Props & ReturnType<typeof useLogic>> = (props) => {
  const {
    active,
    anonymousAccessValidation,
    catalogueShowCV,
    currentVideoId,
    modalState,
    resource,
    selectedVideos,
    setCurrentVideoId,
    theme,
    token,
    user,
    video,
    videoProviders,
    formatProgrammes
  } = props

  const contentBlocksCV = useClientVariables(contentBlockClientVariables)
  const [autocueVideosPlayed, setAutocueVideosPlayed] = useState(1)
  const screenIsBigEnough = useMediaQuery('(min-width: 768px)')
  const isAnonymousUser = token && anonymousAccessValidation?.granted
  let loginView = user || isAnonymousUser ? LOGGED_IN : LOGGED_OUT
  if (theme.features.users.limitedAccess && user && user['user-type'] === 'external' && user['limited-access']) {
    loginView = props.hasLimitedAccessForProgramme ? LOGGED_IN : LOGGED_OUT
  }

  const findProgrammePath = () => {
    return theme?.features.programmeSlugs.enabled ? props.programmeSlug : props.programmeId
  }

  useEffect(() => {
    setLoginPrompt()
    document.body.scrollTop = document.documentElement.scrollTop = 0
  }, [resource.id])

  const setLoginPrompt = () => {
    if (theme.features.users.anonymousAccess.enabled) {
      return /* ignore login prompt for anonymousAccess users */
    }
    if(theme.features.loginPrompt && !props.user && !safeLocalStorage.getItem('LOGIN_PROMPT')) {
      // This is intentionally never reset. Login modal displayed only once per user.
      setTimeout(() => {
        props.login()
        safeLocalStorage.setItem('LOGIN_PROMPT', 'true')
      }, 2000)
    }
  }

  useEffect(() => {
    if (selectedVideos?.length && video && currentVideoId === video.id) {
      // waits for selectedVideos to load - needed for autocue
      openVideoModal(video)
    }
  }, [currentVideoId, video, selectedVideos?.length])

  const playNextAutocueVideo = ({nextVideo, resetAutocueCount}) => {
    setAutocueVideosPlayed((prevState) => resetAutocueCount ? 1 : prevState += 1)
    modalState.hideModal()
    openVideoModalWithHistory(nextVideo)
  }

  const closeVideo = () => {
    {props.user &&
      setAutocueVideosPlayed(1)
    }
    modalState.hideModal()
    removeRoute()
  }

  useEffect(() => {
    const handleBrowserButtons = (e) => {
      const nextPath = removeTrailingSlash(e.target.location.pathname)
      if (nextPath === `/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath()}`) {
        closeVideo()
      } else {
        const nextVideoId = nextPath.replace(`/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath()}/`, '')
        modalState.hideModal()
        setCurrentVideoId(nextVideoId)
      }
    }
    window.addEventListener('popstate', handleBrowserButtons)
    return () => {
      window.removeEventListener('popstate', handleBrowserButtons)
    }
  }, [])

  const openVideoModalWithHistory = (video) => {
    window.history.pushState(null, null, `/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath()}/${video.id}${tokenParam()}`)
    openVideoModal(video)
  }

  const openVideoModal = (video) => {
    if (video.id !== currentVideoId) {
      return setCurrentVideoId(video.id)
    }
    const { knox } = videoProviders
    modalState.showModal(() => {
      let classes = ['video']
      if(knox && video['knox-uuid']) {
        classes.push('full-width')
      }
      return (
        <Modal delay={500} closeEvent={closeVideo} modifiers={classes}>
          <h3 className="modal__title">{video.name}</h3>
          <ModalVideo
            video={video}
            playNextAutocueVideo={playNextAutocueVideo}
            closeVideo={closeVideo}
            autocueVideosPlayed={autocueVideosPlayed}
            shouldIgnoreResumeModal={!props.user}
          />
        </Modal>
      )
    })
    // This updates url in window without causing React Router to reload the component.
    // It is unaware that anything has changed, as it has not happened on BrowserHistory
    window.history.replaceState(null, null, `/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath()}/${video.id}${tokenParam()}`)
  }

  const tokenParam = () => token ? `?token=${token}` : ''

  const openFormModal = (video) => {
    modalState.showModal(({ hideModal }) => (
      <Modal title={video.name} modifiers={['small']} delay={500} closeEvent={hideModal}>
        <div className="modal__content">
          <p>We will generate a video with your unique watermark. Once complete it will be sent to the email address below.</p>
          <p><strong>{props.user.email}</strong></p>
          <button className="button button--filled" type="button" onClick={()=>props.generateWatermark(video)}>Generate</button>
        </div>
      </Modal>
    ))
  }

  const removeRoute = () => {
    // This updates url in window without causing React Router to reload the component.
    // It is unaware that anything has changed, as it has not happened on BrowserHistory or window.history
    window.history.replaceState({}, '', `/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath()}${tokenParam()}`)
    setCurrentVideoId(null)
  }

  const addToList = (resources) => () => {
    return new Promise((resolve) => {
      modalState.showModal(({ hideModal }) => (
        <Modal delay={500} customContent={true} modifiers={['custom-content']} closeEvent={hideModal}>
          <ListModal resourcesToAddToList={resources} closeEvent={hideModal} user={props.user} resourcesSubmitted={resolve} />
        </Modal>
      ))
    })
    return false
  }

  const renderContentTabs = (key) => {
    const tabs = getLoginViewLayoutType('contentTabs')
    const hasAssets = resource['has-assets']
    return (
      <Tabs containerClasses={"programme-tabs"}>
        { tabs.map((tab) => {
          const key = Object.keys(tab)[0]
          if (key !== 'myAssets' || (screenIsBigEnough && hasAssets)) {
            return (
              <div title={tab[key]}>
                {contentMap[key]() }
              </div>
            )
          }
        })}
      </Tabs>
    )
  }

  const addToListFnWhenAllowed = () => loginView === LOGGED_OUT || isAnonymousUser ? false : addToList

  const renderVideoCarousel = () => {
    return (
      <VideoCarousel key={`video_carousel`}
        programme={resource}
        openModal={openVideoModalWithHistory}
        openFormModal={openFormModal}
        addToList={addToListFnWhenAllowed()}
        public={loginView === LOGGED_OUT}
        token={token}
      />
    )
  }

  const renderLoggedOutVideoCarousel = () => {
    if (props.user) { // limited access - still show video carousel
      return renderVideoCarousel()
    }
    return (
      <div key={'logged-out-video-carousel'}>
        {renderVideoCarousel()}
        <section className="programme-tabs__form">
          <h1 className="heading--one programme-tabs__heading">Login for Full Access</h1>
          <Session location={props.location} inpage={true} />
        </section>
      </div>
    )
  }

  const renderProgrammeDetails = (key) => {
    const programmeDetails = (
      <div key={'programme_details'} title={(resource['has-assets'] && props.assetSeries && `${theme.localisation.programme.upper} Detail`) || ''}>
        <ProgrammeDetails {...props}
          openSeries={props.openSeries}
          updateOpenSeries={props.updateOpenSeries}
          addToList={addToListFnWhenAllowed()}
          type={'all'}
          token={token}
        />
      </div>
    )
    return renderDetailsAndAssets(programmeDetails, key)
  }

  const renderProgrammeInfo = (key) => {
    return (
      <section className={catalogueShowCV.programmeInfoSectionClasses} key={key} >
        <ProgrammeDetails {...props}
          openSeries={props.openSeries}
          updateOpenSeries={props.updateOpenSeries}
          addToList={addToListFnWhenAllowed()}
          type={'info'}
          token={token}
        />
      </section>
    )
  }

  const renderAsset = () => {
    if (resource['pdf-url']) {
      const pdfName = resource['pdf-name'] || resource['pdf-url'].slice(resource['pdf-url'].lastIndexOf('/') + 1)
      return (
        <div className="container">
          <div className="asset asset--display">
            <div className="asset__media">
              <img src={pdfIcon} className="file-type" />
            </div>
            <div className="asset__details">
              <a href={resource['pdf-url']} className="text-button" target="_blank">{pdfName}</a>
            </div>
          </div>
        </div>
      )
    }
  }

  const renderProgrammeMeta = (key) => {
    return (
      <div key={key} className="programme-meta">
        <ProgrammeDetails {...props}
          openSeries={props.openSeries}
          updateOpenSeries={props.updateOpenSeries}
          addToList={addToListFnWhenAllowed()}
          type={'meta'}
          token={token}
        />
      </div>
    )
  }

  const renderLoggedOutProgrammeDetails = (key) => {
    const styleOverride = {}
    if (props.user) {
      styleOverride['borderRight'] = 'none'
    }
    const programmeDetails = (
      <div title={resource['has-assets'] && props.assetSeries && `${theme.localisation.programme.upper} Detail`}>
        <section className={catalogueShowCV.loggedOutProgrammeDetailsSectionClasses} key={key} >
          <div className="container">
            <div className="programme-details programme-details--logged-out">
              <div className="programme-details__main" style={styleOverride}>
                <ClientChoice>
                  <ClientSpecific client="default">
                    {resource.description?.length > 0 &&
                      <h2 className="heading--two">{theme.localisation.programme.upper} overview</h2>
                    }
                  </ClientSpecific>
                  <ClientSpecific client="ae | all3 | amc | banijaygroup | cineflix"></ClientSpecific>
                </ClientChoice>

                <ClientChoice>
                  <ClientSpecific client="default">
                  {resource.description?.replace(/(<([^>]+)>)/ig, '').trim()?.length > 0 && (
                    <div>
                      <h3 className="heading--three">Description</h3>
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resource.description) }} className="wysiwyg"></div>
                    </div>
                  )}
                  </ClientSpecific>
                  <ClientSpecific client="drg">
                    <h3 className="heading--three">Description</h3>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(resource.description) }} className="wysiwyg"></div>
                  </ClientSpecific>
                  <ClientSpecific client="ae">
                  </ClientSpecific>
                </ClientChoice>

              </div>
              {renderLoginForm()}
            </div>
          </div>
        </section>
      </div>
    )
    return renderDetailsAndAssets(programmeDetails, key)
  }

  const renderDetailsAndAssets = (programmeDetails, key) => {
    const contentTabs = catalogueLayout[theme.features.programmeOverview.template]['contentTabs']
    return (
      <section className={catalogueShowCV.programmeDetailsSectionClasses} key={key} >
        { (resource['has-assets'] && props.assetSeries && !contentTabs) ? (
            <AssetBrowser {...props}
              resource={resource as ProgrammeType}
              programmeDetails={programmeDetails}
            />
          ) : (
            programmeDetails
          )
        }
      </section>
    )
  }

  const renderLoginForm = (staticForm = false) => {
    const form = (
      <ClientChoice>
        <ClientSpecific client="default">
          <div className="programme-details__side">
            <Session location={props.location} inpage={true} />
          </div>
        </ClientSpecific>
        <ClientSpecific client="keshet">
          <div className="programme-details__side">
            <p className="heading--three">Please register to gain full access to programme trailers, galleries, and episodes</p>
            <Session location={props.location} inpage={true} />
          </div>
        </ClientSpecific>
        <ClientSpecific client="ae">
          <div>
            <div className="programme-details__side">
              <p className="heading--three">To See All Information, <br/>Please Login or Register</p>
              <div>
                <Session location={props.location} inpage={true} />
              </div>
            </div>
          </div>
        </ClientSpecific>
      </ClientChoice>
    )
    if(!props.user) {
      if(staticForm) {
        return (
          <section className={catalogueShowCV.loggedOutProgrammeDetailsSectionClasses} >
            <div className="container">
              <div className="programme-details programme-details--logged-out">
                {form}
              </div>
            </div>
          </section>
        )
      }
      return form
    }
  }

  const renderContentBlocks = (key) => {
    if(!resource['content-blocks']?.length) return false

    return (
      <div key={key} className="programme-blocks">
        {(resource['content-blocks'] || []).map((block) => (
          <ShouldRenderContentBlock
            block={block}
            renderBlock={() => {
              const bgImage = block.bgImage ? resource['page-images'].find(i => i.id === block.bgImage.id) : null
              return (
                <section key={block.id}
                  className={contentBlocksCV.sectionClasses((block))}
                  style={block.background === 'image' && bgImage ? {
                    backgroundImage: `url(${bgImage.file.url.replace('.net/', `.net/${contentBlocksCV.backgroundSize}/`)})`,
                    backgroundSize: contentBlocksCV.backgroundCover
                  } : null}
                >
                  <div className={!contentBlocksCV.blocksWithoutContainers.includes(block.type)? 'container' : 'content-block__inner' }>
                    {Blocks(block, {
                      'page-images': resource['page-images']
                    }, { user: props.user, addToList })}
                  </div>
                </section>
              )
            }}
          />
        ))}
      </div>
    )
  }

  const renderBreadcrumbs = (classes = []) => {
    const { catalogueTitle, cataloguePath } = props.location?.state || {}
    return (
      <Breadcrumbs
        key={`breadcrumb`}
        paths={[
          { url: `/${cataloguePath || theme.variables.SystemPages.catalogue.path}`, name: catalogueTitle || theme.variables.SystemPages.catalogue.upper },
          { url: `/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath()}`, name: resource.title }
        ]}
        classes={classes}
      />
    )
  }

  const renderAnonymousAccessExpiredMsg = () => {
    modalState.showModal(({ hideModal }) => (
      <Modal title="Access Expired" modifiers={['small']} closeEvent={() => {
        hideModal()
        props.history.push(props.location.pathname)
      }}>
        <div className="modal__content">
          <p>The access provided by email has <strong>expired</strong>.</p>
        </div>
      </Modal>
    ))
  }

  useEffect(() => {
    if (token && anonymousAccessValidation?.denied) {
      props.pageIsLoading(false)
      renderAnonymousAccessExpiredMsg()
    }
  }, [anonymousAccessValidation])

  const meta: Partial<MetaDatumType> = resource['meta-datum'] || {}
  const mainGenres = catalogueShowCV.mainGenres(resource)

  const contentMap = {
    banner: () => (
      <CatalogueBanner
        key={`banner`}
        addToList={addToList}
        genres={mainGenres}
        openVideoModal={openVideoModal}
        isPublic={loginView === LOGGED_OUT || isAnonymousUser}
        resource={resource}
      />
    ),
    videoCarousel: renderVideoCarousel,
    loggedOutVideoCarousel: renderLoggedOutVideoCarousel,
    breadcrumbs: renderBreadcrumbs,
    breadcrumbsPlain: () => renderBreadcrumbs(['plain']),
    loggedOutProgrammeDetails: () => renderLoggedOutProgrammeDetails(`logged_out_programme`),
    programmeDetails: () => renderProgrammeDetails(`programme_detail`),
    programmeInfo: () => renderProgrammeInfo(`programme_detail`),
    programmeMeta: () => renderProgrammeMeta(`programme_detail_meta`),
    contentBlocks: () => renderContentBlocks(`content_block`),
    relatedProgrammes: () => {
      if (resource['show-related-programmes']) {
        return (
          <RelatedProgrammes
            key={`related_programme`}
            programme={resource}
            addToList={addToListFnWhenAllowed()} />
        )
      }
      return null
    },
    recentlyViewed: () => {
      if (resource.id && props.user) {
        return (
          <RecentlyViewed
            key={`recently_viewed`}
            programme={props.programmeId}
            addToList={addToList} />
        )
      }
      return null
    },
    contentTabs: () => renderContentTabs(`content_tabs`),
    myAssets: () => (
      <MyAssets key={`my_assets`} programme={resource} />
    ),
    pdfAsset: renderAsset,
    formatProgrammes: () => {
      if (theme.features.programmeFormats.enabled && formatProgrammes?.length) {
        return (
          <FormatProgrammes
            key={`format_programmes`}
            programmes={formatProgrammes}
            addToList={addToList}
          />
        )
      }
      return null
    },
    loginForm: () => renderLoginForm(true)
  }

  const getLoginViewLayoutType = (templateType) => {
    return catalogueLayout[theme.features.programmeOverview.template][templateType][loginView]
  }

  const layout = getLoginViewLayoutType('index')
  return (
    <Meta
      title={meta.title || resource.title}
      meta={{
        description: meta.description || '',
        keywords: meta.keywords || '',
        property: {
            'og:title': theme.localisation.client,
            'og:image': `${window.location.origin}/assets/images/programme-placeholder-retina.jpg`
          }
      }}
    >
      <main className={catalogueShowCV.genreClasses(mainGenres)}>
        <div className="fade-on-load">
          {!active && <PreviewBanner />}
          { layout.map((key) => {
           return  contentMap[key]()
          }) }
        </div>
        <AdminToolbar type={'programme'} id={props.programmeId} user={props.user} />
      </main>
    </Meta>
  )
}

const resourceInitialState = {
  'title': '',
  'introduction': '',
  'description': '',
  'production-start': 0,
  'production-end': 0,
  'active-series-counter': '',
  'number-of-series': '',
  'number-of-episodes': '',
  'languages': [],
  'data': {},
  'catalogues': [],
  'genres': [],
  'qualities': [],
  'series': [],
  'active-series': [],
  'episodes': [],
  'content-blocks': [],
  'page-images': [],
  'custom-attributes': [],
  'programme-alternative-titles': [],
  'videos': [],
  'pdf-url': '',
  'pdf-name': '',
  'programme-type': null
}

const seriesQuery = (theme) => ({
  fields: {
    'custom-attributes': 'custom-attribute-type,value,position',
    'custom-attribute-type': 'name,attribute-type',
    series: [
      'name,description,has-assets,data,videos,show-in-programme-description,custom-attributes,has-description,restricted,programme-id,number-of-episodes,position',
      theme.features.talents && 'series-talents',
      theme.features.programmeOverview.seriesImages && 'series-images',
      theme.features.seriesReleaseDate.newRelease && 'new-release'
    ].filter(Boolean).join(',')
  }
})

const seriesEpisodesQuery = (theme) => ({
  fields: {
    episodes: 'name,videos,description',
    series: 'episodes'
  }
})

const customAttributeQuery = {
  include: 'custom-attribute-type',
  fields: {
    'custom-attributes': 'custom-attribute-type,value,position',
  }
}

const programmesQuery = theme => ({
  fields: {
    programmes: [
      'video-banner,has-assets,page-images,content-blocks,title,slug,introduction',
      'description,short-description,production-start,production-end',
      'number-of-series,manual-number-of-series,active-series-counter,number-of-episodes,banner',
      'banner-urls,thumbnail,data,languages,asset-materials-count',
      'videos,custom-attributes,promo-video-id,programme-alternative-titles',
      'show-related-programmes,related-programmes,restricted,meta-datum',
      'pdf-url,pdf-name,active',
      theme.features.programmeOverview.logoTitleBanner && 'logo',
      theme.features.programmeTypes.enabled && 'programme-type',
      theme.features.programmeFormats.enabled && 'format,format-programmes',
      theme.features.programmeReleaseDate.newRelease && 'new-release',
      theme.features.customCatalogues.enabled && 'catalogues'
    ]
      .filter(Boolean)
      .join(','),
  },
})

const filterMainGenres = (genres = []) => genres.filter(g => !g['parent-id']).map(g => g.name.replace(/[^A-Z0-9]+/ig, "_"))

const useProgrammePath = (props) => {
  const { theme } = props
  const [programmeId, setProgrammeId] = useState(null)
  const [programmeSlug, setProgrammeSlug] = useState(null)
  const programmeResource = useResource('programme-search-result')
  const token = queryString.parse(location.search)?.token

  const getProgrammeSlug = () => {
    const query = {
      include: 'programme',
      fields: {
        'programme': 'slug'
      },
      filter: {
        ids: props.match.params.programme
      },
      page: {
        size: 1
      }
    }
    if (theme.features.users.anonymousAccess.enabled && !props.user && token) {
      query['token'] = token
    }
    programmeResource.findAll(query).then((response) => {
      setProgrammeId(props.match.params.programme)
      if(response.length > 0){
        const tokenParam = () => token ? `?token=${token}` : ''
        const slug = response?.[0]?.programme?.slug
        window.history.replaceState(null, null, `/${theme.variables.SystemPages.catalogue.path}/${slug}${tokenParam()}`)
        setProgrammeSlug(slug)
      }
    })
  }

  const getProgrammeId = () => {
    const query = {
      fields: {
        'programme': 'id'
      },
      filter: {
        slug: props.match.params.programme
      },
      page: {
        size: 1
      }
    }
    if (theme.features.users.anonymousAccess.enabled && !props.user && token) {
      query['token'] = queryString.parse(location.search)?.token
    }

    programmeResource.findAll(query).then((response) => {
      if(response.length > 0){
        setProgrammeId(response?.[0]?.id)
        setProgrammeSlug(props.match.params.programme)
      } else {
        getProgrammeSlug()
      }
    })
  }

  useEffect(() => {
    if(theme.features.programmeSlugs.enabled){
      getProgrammeId()
    } else {
      setProgrammeId(props.match.params.programme)
    }
  }, [props.match.params.programme])

  return {
    programmeId,
    programmeSlug
  }

}

const useLogic = (props) => {
  const programmeId = props.programmeId
  const programmeSlug = props.programmeSlug

  const programmeRelation = {
    'name': 'programme',
    'id': programmeId
  }
  const { theme } = props
  const tokenParam = queryString.parse(location.search)?.token
  const token = theme.features.users.anonymousAccess.enabled && !props.user
    ? tokenParam || ''
    : false

  if (tokenParam && !token) {
    // removes token if user is logged in - anonymous access token only for logged out users
    window.history.replaceState(null, null, location.pathname)
  }
  const catalogueShowCV = useClientVariables(allClientVariables, {
    mainGenres: {
      default: (resource) => [],
      'all3 | banijaygroup | discovery | drg | keshet | endeavor | fremantle': (resource) => filterMainGenres(resource.genres),
      'itv': (resource) => props.user ? filterMainGenres(resource.genres) : []
    },
    genreClasses: {
      default: (genres) => genres?.join(' ').toLowerCase(),
    }
  })

  const sortedVideos = useSortedVideos()
  const anonymousAccessValidation = useAnonymousAccessValidation(token, props.user)

  const [active, setActive] = useState(true)
  const [currentVideoId, setCurrentVideoId] = useState(props.match.params.video)
  const [anchored, setAnchored] = useState(false)
  const [assetSeries, setAssetSeries] = useState(null)
  const [resource, setResource] = useState<Partial<ProgrammeType>>(resourceInitialState)
  const [programmeView, setProgrammeView] = useState(null)
  const [video, setVideo] = useState(null)
  const [openSeries, setOpenSeries] = useState([])
  const [tokenIsValidated, setTokenIsValidated] = useState(false)
  const [hasLimitedAccessForProgramme, setHasLimitedAccessForProgramme] = useState(false)

  // Resources
  const [activeSeries, setActiveSeries] = useState<SeriesType[]>([])
  const [customAttributes, setCustomAttributes] = useState<CustomAttributeType[]>([])
  const [catalogues, setCatalogues] = useState<CatalogueType[]>([])
  const [genres, setGenres] = useState<GenreType[]>([])
  const [languages, setLanguages] = useState<LanguageType[]>([])
  const [metaDatum, setMetaDatum] = useState(null)
  const [pageImages, setPageImages] = useState<PageImageType[]>([])
  const [programme, setProgramme] = useState<Partial<ProgrammeType>>({})
  const [programmeAlternateTitles, setProgrammeAlternateTitles] = useState<ProgrammeAlternativeTitleType[]>([])
  const [qualities, setQualities] = useState<QualityType[]>([])
  const [relatedProgrammes, setRelatedProgrammes] = useState<ProgrammeType[]>(null)
  const [programmeTalents, setProgrammeTalents] = useState<ProgrammeTalentType[]>([])
  const [formatProgrammes, setFormatProgrammes] = useState<ProgrammeType[]>(null)
  const [seriesEpisodes, setSeriesEpisodes] = useState(false)

  // Api Resources
  const activeSeriesResource = useReduxResource('active-series', 'catalogue-show/active-series', programmeRelation)
  const inactiveProgrammeSeriesResource = useReduxResource('series', 'catalogue-show/series', programmeRelation)
  const activeSeriesEpisodesResource = useReduxResource('active-series', 'catalogue-show/active-series-episodes', programmeRelation)
  const inactiveProgrammeSeriesEpisodesResource = useReduxResource('series', 'catalogue-show/series-episodes', programmeRelation)
  const cataloguesResource = useReduxResource('catalogue', 'catalogue-show/catalogue', programmeRelation)
  const customAttrTypeResource = useReduxResource('custom-attribute-type', 'catalogue-show/custom-attribute-type', programmeRelation)
  const customAttributesResource = useReduxResource('custom-attribute', 'catalogue-show/custom-attributes', programmeRelation)
  const genresResource = useReduxResource('genre', 'catalogue-show/genre', programmeRelation)
  const languageResource = useReduxResource('language', 'catalogue-show/languages', programmeRelation)
  const limitedAccessResource = useResource('limited-access-programme-user')
  const metaDataResource = useReduxResource('meta-datum', 'catalogue-show/meta-datums', programmeRelation)
  const pageImageResource = useReduxResource('page-image', 'catalogue-show/page-images', programmeRelation)
  const programmeAlternateTitlesResource = useReduxResource('programme-alternative-title', 'catalogue-show/programme-alternative-titles', programmeRelation)
  const programmeTalentsResource = useReduxResource('programme-talent', 'catalogue-show/programme-talent', programmeRelation)
  const programmeViewResource = useReduxResource('programme-view', 'catalogue-show/programme-view', programmeRelation)
  const programmesResource = useReduxResource('programme', 'catalogue-show/programme', programmeRelation)
  const qualitiesResource = useReduxResource('quality', 'catalogue-show/qualities', programmeRelation)
  const relatedProgrammesResource = useReduxResource('related-programme', 'catalogue-show/related-programmes', programmeRelation)
  const talentTypeResource = useReduxResource('talent-type', 'catalogue-show/talent-type', programmeRelation)
  const videoResource = useReduxResource('video', 'catalogue-show/video', programmeRelation)
  const watermarkedVideoResource = useReduxResource('watermarked-video', 'watermarked-videos')
  const formatProgrammesResource = useReduxResource('format-programme', 'catalogue-show/format-programmes', programmeRelation)

  useEffect(() => {
    if (!props.user) {
      props.location.state = {
        nextPathname: props.location.pathname
      }
    }
  }, [props.user])

  useEffect(() => {
    if (programme.id === programmeId) {
      setResource({
        ...resource,
        ...programme,
        'active-series': activeSeries.filter((sery) => sery['programme-id'] === Number.parseInt(programme.id)),
        'custom-attributes': customAttributes,
        catalogues,
        genres,
        languages,
        'meta-datum': metaDatum,
        'page-images': pageImages,
        'programme-alternative-titles': programmeAlternateTitles,
        qualities,
        'related-programmes': relatedProgrammes,
        'programme-talents': programmeTalents,
        'format-programmes': formatProgrammes
      })
    }
  }, [
    activeSeries,
    customAttributes,
    catalogues,
    genres,
    languages,
    metaDatum,
    pageImages,
    programme,
    programmeAlternateTitles,
    qualities,
    relatedProgrammes,
    programmeTalents,
    formatProgrammes
  ])


  /* Finished Loading Resources */
  const goToHash = () => {
    const hash = window.location.hash
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el && !anchored) {
        //@ts-ignore
        window.scrollTop = el.offsetTop
        setAnchored(true)
      }
    }
  }

  useEffect(() => {
    if (programme.id === programmeId) {
      setTimeout(() => {
        props.pageIsLoading(false)
        startProgrammeViewTracking()
        goToHash()
      }, 300)
    }
  }, [programme])
  /* End Finished Loading Resources */

  const withToken = (query) => {
    const queryWithToken = {...query}
    if (token && !props.user) {
      queryWithToken['token'] = token
    }
    return queryWithToken
  }

  /* Get Programme Resources */
  const getProgramme = () => {
    const query = withToken(programmesQuery(theme))
    const include = ['video-banner']

    if(theme.features.programmeTypes.enabled){
      include.push('programme-type')
      query['fields']['programme-type'] = 'name'
    }
    if(theme.features.programmeFormats.enabled) {
      include.push('format,format-programmes')
    }
    if(theme.features.customCatalogues.enabled) {
      include.push('catalogues')
    }
    programmesResource.findOne(
      programmeId,
      deepmerge.concat(query, {
        include: include.filter(Boolean).join(','),
        fields: {
          videos: 'brightcove-id,wistia-id'
        }
      })
    )
    .then((result) => {
      setActive(result.active)
      setProgramme(result)
    })
    .catch((error) => {
      if (props.user || token) {
        props.pageReceivedError()
      } else {
        props.history.push(`/${theme.variables.SystemPages.login.path}?from=${location.pathname}`)
      }
    })
  }

  const getTalents = () => {
    if (theme.features.talents) {
      programmeTalentsResource.findAllFromOneRelation(programmeRelation, withToken({
        include: 'talent,talent-type',
        fields: {
          'programme-talents': 'talent,talent-type,summary',
          'talents': 'firstname,surname',
          'talent-types': 'name'
        },
      })).then(setProgrammeTalents)
    }
  }

  const getTalentTypes = () => {
    if (theme.features.talents) {
      talentTypeResource.findAll({
        page: {
          size: 100
        }
      })
    }
  }

  const getCustomAttrTypes = () => {
    customAttrTypeResource.findAll({
      page: {
        size: 200
      }
    })
  }

  const getGenres = () => {
    genresResource.findAllFromOneRelation(programmeRelation, withToken(catalogueShowCV.genreQuery))
    .then((genresResult: GenreType[]) => {
      setGenres(genresResult)
      if (isClient('drg')) {
        const mainGenres = filterMainGenres(genresResult).join(' ').toLowerCase()
        props.changeTheme(mainGenres)
      }
    })
  }

  const getCatalogues = () => {
    if(theme.features.customCatalogues.enabled){
      cataloguesResource.findAllFromOneRelation(programmeRelation, withToken({
        fields: {
          catalogues: 'name'
        }
      }))
      .then(setCatalogues)
    }
  }

  const getQualities = () => {
    qualitiesResource.findAllFromOneRelation(programmeRelation, withToken({
      fields: {
        qualities: 'name',
      }
    }))
    .then(setQualities)
  }

  const getActiveSeries = () => {
    const query = withToken(seriesQuery(theme))
    const include = ['custom-attributes,custom-attributes.custom-attribute-type']
    const seriesResourceToUse = active ? activeSeriesResource : inactiveProgrammeSeriesResource

    if(theme.features.programmeOverview.seriesImages){
      include.push('series-images')
      query['fields']['series-images'] = 'file'
    }
    if(theme.features.talents){
      include.push('series-talents,series-talents.talent,series-talents.talent-type')
      query['fields']['series-talents'] = 'talent,talent-type,summary'
      query['fields']['talents'] = 'firstname,surname',
      query['fields']['talent-types'] = 'name,position'
    }
    if(!active){
      query['filter[active]'] = true
    }

    seriesResourceToUse.findAllFromOneRelation(
      programmeRelation,
      deepmerge.concat(query, {
        include: include.filter(Boolean).join(',')
      })
    )
    .then((response) => {
      setActiveSeries(response)
      setAssetSeries(true)
    })
  }

  const getActiveSeriesEpisodes = () => {
    const query = withToken(seriesEpisodesQuery(theme))
    const episodesResourceToUse = active ? activeSeriesEpisodesResource : inactiveProgrammeSeriesEpisodesResource

    if(!active){
      query['filter[active]'] = true
    }

    episodesResourceToUse.findAllFromOneRelation(
      programmeRelation,
      deepmerge.concat(query, {
        include: 'episodes'
      })
    )
    .then((response) => {
      const seriesWithEpisodes = activeSeries.map(s => ({
        ...s,
        'episodes' : response.filter(r => r.id === s.id)?.[0]?.episodes
      }))
      setActiveSeries(seriesWithEpisodes)
      setSeriesEpisodes(true)
    })
  }

  const getLanguages = () => {
    languageResource.findAllFromOneRelation(programmeRelation, withToken({
      fields: {
        languages: 'name',
      }
    }))
    .then(setLanguages)
  }

  const getCustomAttributes = () => {
    customAttributesResource.findAllFromOneRelation(programmeRelation, withToken(customAttributeQuery))
    .then(setCustomAttributes)
  }

  const getPageImages = () => {
    pageImageResource.findAllFromOneRelation(programmeRelation, withToken({
      fields: {
        'page-images': 'file,filename',
      }
    }))
    .then(setPageImages)
  }

  const getProgrammeAlternateTitles = () => {
    programmeAlternateTitlesResource.findAllFromOneRelation(programmeRelation, withToken({
      fields: {
        'programme-alternative-titles': 'name,position',
      }
    }))
    .then(setProgrammeAlternateTitles)
  }

  const getMetaDatum = () => {
    metaDataResource.findOneFromOneRelation(programmeRelation, withToken({
      fields: {
        'meta-data': 'title,keywords,description'
      }
    }))
    .then(setMetaDatum)
  }

  const getRelatedProgrammes = () => {
    const query = deepmerge.concat(catalogueShowCV.genreQuery, programmesQuery(theme))
    relatedProgrammesResource.findAllFromOneRelation(programmeRelation, withToken(query))
    .then(setRelatedProgrammes)
  }

  const getFormatProgrammes = () => {
    if (theme.features.programmeFormats.enabled) {
      const extendedQuery = deepmerge.concat(catalogueShowCV.genreQuery, {
        fields: {
          programmes: 'genres'
        },
        include: 'genres,format,format-programmes',
      })
      const query = deepmerge.concat(extendedQuery, programmesQuery(theme))
      formatProgrammesResource.findAllFromOneRelation(programmeRelation, withToken(query))
      .then(setFormatProgrammes)
    }
  }

  const updateOpenSeries = (series) => {
    if (openSeries?.filter(a => a === series)?.length > 0) {
      setOpenSeries([])
    } else {
      setOpenSeries([series])
    }
  }

  const getLimitedAccessStatus = () => {
    if (theme.features.users.limitedAccess
        && props.user?.id
        && props.user['user-type'] === 'external') {

      limitedAccessResource.findAll({
        include: 'limited-access-user',
        fields: {
          'limited-access-programme-user': 'id,limited-access-user',
          'users': 'limited-access'
        },
        filter: {
          'limited-access-programme': programmeId,
          'limited-access-user': props.user.id
        }
      })
      .then((response) => {
        setHasLimitedAccessForProgramme(response.length > 0)
      })
    }
  }

  const setInitialState = () => {
    setResource(resourceInitialState)
    setActiveSeries([])
    setCatalogues([])
    setGenres([])
    setLanguages([])
    setMetaDatum([])
    setPageImages([])
    setProgramme({})
    setProgrammeAlternateTitles([])
    setQualities([])
    setRelatedProgrammes([])
    setHasLimitedAccessForProgramme(false)
    setSeriesEpisodes(false)
  }

  const getResources = () => {
    setInitialState()
    props.pageIsLoading(true)
    getCustomAttrTypes()
    getCustomAttributes()
    getGenres()
    getCatalogues()
    getLanguages()
    getLimitedAccessStatus()
    getMetaDatum()
    getPageImages()
    getProgramme()
    getProgrammeAlternateTitles()
    getQualities()
    getRelatedProgrammes()
    getTalentTypes()
    getTalents()
    getFormatProgrammes()
  }

  useEffect(() => {
    setTokenIsValidated(!token || anonymousAccessValidation?.granted)
  }, [programmeId, props.user, anonymousAccessValidation, token])

  useEffect(() => {
    if (programmeId && tokenIsValidated) {
      getResources()
    }
  }, [programmeId, props.user, tokenIsValidated])

  useEffect(() => {
    if (programme.id && tokenIsValidated) {
      getActiveSeries()
    }
  }, [programme])
  /* End Get Programme Resources */

  /* Video Viewing */
  useEffect(() => {
    if (currentVideoId && tokenIsValidated) {
      videoResource.findOne(currentVideoId, withToken({}))
      .then(setVideo)
    } else {
      setVideo(null)
    }
  }, [currentVideoId, tokenIsValidated])
  /* End Video Viewing */

  /* Programme View Tracking */
  const startProgrammeViewTracking = () => {
    if (props.user) {
      programmeViewResource.unsetReduxResources()
      programmeViewResource.createResource({
        'programme': {
          'id': programmeId
        }
      })
      .then((programmeView) => {
        setProgrammeView(programmeView)
      })
    }
  }

  useEffect(() => {
    if (!seriesEpisodes && activeSeries.length) {
      getActiveSeriesEpisodes()
    }
  }, [activeSeries])

  useEffect(() => {
    const timeInterval = 30000
    let interval
    if (programmeView) {
      interval = setInterval(() => {
        programmeViewResource.updateResource({
          'id': programmeView.id,
          'time-spent': timeInterval
        })
      }, timeInterval);
    }
    return () => clearInterval(interval);
  }, [programmeView]);
  /* End Programme View Tracking */

  const generateWatermark = video => {
    watermarkedVideoResource.createResource({video})
  }

  useWatchForTruthy(watermarkedVideoResource.mutationState.succeeded, props.modalState.hideModal)

  return {
    active,
    anonymousAccessValidation,
    assetSeries,
    catalogueShowCV,
    currentVideoId,
    generateWatermark,
    openSeries,
    programmeId,
    programmeSlug,
    resource,
    selectedVideos: sortedVideos.getCurrentSortedVideos(),
    setCurrentVideoId,
    talentTypes: talentTypeResource.getReduxResources(),
    token,
    types: customAttrTypeResource.getReduxResources(),
    updateOpenSeries,
    hasLimitedAccessForProgramme,
    video,
    formatProgrammes,
  }
}

const useCheckFor401 = ({ history, location, theme }) => {
  const ids = location.pathname.split('/').filter(id => id !== 'catalogue')
  const onUnauthorisedRequest = ({ detail }) => {
    if (new RegExp(ids.join('|')).test(detail.requestUrl)) {
      history.push(`/${theme.variables.SystemPages.login.path}?from=${location.pathname}`)
    }
  }
  useEffect(() => {
    subscribeToUnauthorisedErrorEmitter(onUnauthorisedRequest)
    return unsubscribeToUnauthorisedErrorEmitter(onUnauthorisedRequest)
  }, [])
}

const enhance = compose(
  withVideoProviders,
  withPageHelper,
  withHooks(useProgrammePath),
  withHooks(useLogic),
  withHooks(({ history, location, theme }) => {
    useCheckFor401({ history, location, theme })
  })
)

export default enhance(CatalogueShow)


