import React, { useEffect, useState } from 'react'
import queryString from 'query-string'

import compose from 'javascript/utils/compose'
import useAnonymousAccessValidation from 'javascript/views/anonymous-access/use-anonymous-access-validation'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useResource from 'javascript/utils/hooks/use-resource'
import withPageHelper, { WithPageHelperType } from 'javascript/components/hoc/with-page-helper'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'

// Components
import Banner from 'javascript/components/banner'
import Card from 'javascript/components/card'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import Meta from 'react-document-meta'
import Modal from 'javascript/components/modal'
import { NavLink } from 'react-router-dom'
import { RouteComponentProps  } from 'react-router'

// Variables
import allClientVariables from 'javascript/views/anonymous-access/variables'
import listsShowCardsClientVariables from 'javascript/components/cards/list/variables'

// Types
import { UserType } from 'javascript/types/ModelTypes'
import VideoProviders from 'javascript/types/VideoProviders'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

interface MatchParams {
  id: string
}

interface Props extends RouteComponentProps<MatchParams>, WithPageHelperType {
  history: any
  location: any
  theme: ThemeType
  user: UserType
  videoProviders: VideoProviders,
}

const AnonymousAccessIndex: React.FC<Props> = ({
  history,
  location,
  match,
  modalState,
  pageIsLoading,
  pageReceivedError,
  theme,
  user,
  videoProviders,
}) => {

  const {
    gridClasses,
    cardWithCenteredIcon,
  } = useClientVariables(allClientVariables)

  const {
    videoCardCopy,
    videoCardSmallTitle,
    videoCardMainTitle,
    videoCardOrder,
    seriesCardTitle,
    programmeCardDescription,
  } = useClientVariables(listsShowCardsClientVariables)

  const anonAccessId = match.params.id
  const { wistia } = videoProviders
  const [token] = useState(queryString.parse(location.search)?.token || '')
  const [accessItems, setAccessItems] = useState(null)
  const [tokenIsValidated, setTokenIsValidated] = useState(false)
  const [accessDetails, setAccessDetails] = useState(null)
  const [videoProgrammes, setVideoProgrammes] = useState([])

  const anonAccessResource = useResource('anonymous-access')
  const anonAccessItemsResource = useResource('anonymous-access-item')
  const programmeResource = useResource('programme')

  const anonymousAccessValidation = useAnonymousAccessValidation(token, user)

  useEffect(() => {
    setTokenIsValidated(anonymousAccessValidation?.granted)
  }, [anonAccessId, token, user, anonymousAccessValidation])

  useEffect(() => {
    if (tokenIsValidated && anonAccessId && token) {
      anonAccessResource.findOne(anonAccessId, {
        fields: {
          'anonymous-accesses': 'name',
        },
        token
      })
      .then((response) => {
        if (response.length === 0) throw new Error('No validation found')
        setAccessDetails(response)
      })

      const videos = ['name,programme-id,programme-name,poster,parent', wistia && 'wistia-thumbnail-url'].filter(Boolean).join(',')
      const programmes = ['thumbnail,title,short-description,genres', theme?.features.programmeOverview.logoTitle && 'logo'].filter(Boolean).join(',')
      const query = {
        'include': 'programme,programme.genres,series,series.programme,series.programme.genres,video,video.parent',
        'fields': {
          'anonymous-access-items': 'link,programme,series,video',
          programmes,
          'series': 'name,short-description,programme,programme-id,programme-name',
          'genres': 'name',
          videos
        },
        token
      }
      anonAccessItemsResource.findAllFromOneRelation({
        'name': 'anonymous-access',
        id: anonAccessId
      }, query)
      .then((response) => {
        setAccessItems(response.map((item) => {
          const types = ['programme', 'series', 'video']
          for (let i = 0; i < types.length; i += 1) {
            if (item[types[i]]) {
              return {
                link: item.link,
                ...item[types[i]]
              }
            }
          }
        }))
      })
    }
  }, [tokenIsValidated])

  useEffect(() => {
    if (accessItems) {
      const programmeIdsForVideos = accessItems
        .filter((item) => item.type === 'videos')
        .map((item) => item['programme-id'])
      programmeResource.findAll({
        include: 'genres',
        fields: {
          'programmes': 'genres',
          'genres': 'name',
        },
        filter: {
          ids: programmeIdsForVideos.join(',')
        }
      })
      .then((response) => {
        setVideoProgrammes(response)
        pageIsLoading(false)
      })
    }
  }, [accessItems])

  useEffect(() => {
    if (user) {
      pageReceivedError(true)
    }
  }, [user])

  const findProgrammePath = (resource) => {
    return theme?.features.programmeSlugs.enabled ? resource['programme-slug'] : resource['programme-id']
  }

  const renderResource = (resource) => {
    const renderFuncs = {
      'videos': () => {
        const programme = videoProgrammes.find(p => p.id == resource['programme-id'])
        let thumbnail = resource.poster.small.url
        if (wistia && thumbnail === null) {
          thumbnail = resource['wistia-thumbnail-url']
        }
        const programmeName = resource['programme-name']
        const contentTitles = {
          programmeName,
          seriesName: resource.parent.type === 'series' ? resource.parent.name : '',
          videoName: resource.name
        }
        const cardChildren = {
          'cardCopy': () => (
            <p key={`${resource.id}-cardCopy`}
              className="card__copy"
            >
              {contentTitles[videoCardCopy]}
            </p>
          ),
          'cardSmallTitle': () => (
            <p key={`${resource.id}-cardSmallTitle`}
              className="card__title card__title--small"
            >
              {contentTitles[videoCardSmallTitle]}
            </p>
          ),
          'amcCustomContent': () => (
            <div key={`${resource.id}-amcCustomContent`}>
              <div className="card__actions"></div>
              <div className="card__title-wrap">
                <div className="card__list-item-details">
                  <span className="card__list-count">
                    {contentTitles.programmeName}
                    {contentTitles.seriesName &&
                      <span> - {contentTitles.seriesName}</span>
                    }
                  </span><br />
                </div>
                <h3 className="card__title">
                  <NavLink draggable={false}
                    to={`/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath(resource)}/${resource.id}?token=${token}`}
                  >
                    {resource.name}
                  </NavLink>
                </h3>
              </div>
            </div>
          ),
          'fremantleCustomContent': () => (
            <>
              <p className="card__copy card__copy--small">
                {resource.parent.type === 'series' ? contentTitles[videoCardCopy] : contentTitles[videoCardSmallTitle]}
              </p>
            </>
          )
        }
        return (
          <Card key={`${resource.id}-${resource.type}`}
            image={{ src: thumbnail, alt: resource.name }}
            iconCentered={cardWithCenteredIcon}
            title={contentTitles[videoCardMainTitle]}
            url={`/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath(resource)}/${resource.id}?token=${token}`}
            video={true}
            tags={programme ? programme.genres : []}
          >
            {videoCardOrder.map((childType) => cardChildren[childType]())}
          </Card>
        )
      },
      'series': () => {
        const programmeName = resource['programme-name']
        return (
          <Card key={`${resource.id}-${resource.type}`}
            image={{ src: resource.programme.thumbnail.small.url, alt: resource.programme.title }}
            title={seriesCardTitle(resource.name)}
            tags={resource.programme.genres}
            url={`/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath(resource)}?token=${token}`}
          >
            <ClientChoice>
              <ClientSpecific client="default">
                <p className="card__title card__title--small">{programmeName}</p>
                <p className="card__copy" dangerouslySetInnerHTML={{ __html: resource['short-description'] }}></p>
              </ClientSpecific>
              <ClientSpecific client="amc">
                <div className="card__actions"></div>
                <div className="card__title-wrap">
                  <div className="card__list-item-details">
                    <span className="card__list-count">{programmeName}</span><br />
                  </div>
                  <h3 className="card__title">
                    <NavLink draggable={false} to={`/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath(resource)}?token=${token}`}>
                      {resource.name}
                    </NavLink>
                  </h3>
                </div>
              </ClientSpecific>
              <ClientSpecific client="wildbrain"></ClientSpecific>
            </ClientChoice>
          </Card>
        )
      },
      'programmes': () => {
        return (
          <Card key={`${resource.id}-${resource.type}`}
            image={{ src: resource.thumbnail.small.url, alt: resource.title }}
            title={theme.features.cards.titleLimit && resource.title.length > theme.features.cards.titleLimit ? `${resource.title.substring(0, theme.features.cards.titleLimit)}...` : resource.title}
            description={programmeCardDescription(resource['short-description'])}
            url={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(resource.programme, theme)}?token=${token}`}
            logo={theme.features.programmeOverview.logoTitle && resource.logo}
            tags={resource.genres}
          >
            <ClientSpecific client="amc">
              <div className="card__actions"></div>
            </ClientSpecific>
          </Card>
        )
      }
    }
    return renderFuncs[resource.type]()
  }

  const renderAnonymousAccessExpiredMsg = () => {
    modalState.showModal(({ hideModal }) => (
      <Modal title="Access Expired" modifiers={['small']} closeEvent={() => {
        hideModal()
        history.push('/')
      }}>
        <div className="modal__content">
          <p>The access provided by email has <strong>expired</strong>.</p>
        </div>
      </Modal>
    ))
  }

  useEffect(() => {
    if (anonymousAccessValidation?.denied) {
      pageIsLoading(false)
      renderAnonymousAccessExpiredMsg()
    }
  }, [anonymousAccessValidation])

  return (
    <Meta
      title={`${theme.localisation.client} :: ${accessDetails?.name || theme.variables.SystemPages.anonymousAccess.upper}`}
      meta={{
        description: `Guide view for ${theme.variables.SystemPages.anonymousAccess.upper}`,
      }}
    >
      <Banner
        classes={['short']}
        title={accessDetails?.name || theme.variables.SystemPages.anonymousAccess.upper}
      />
      <main>
        <div className="container" style={{ marginTop: '20px' }}>
          <div className={gridClasses}>
            {(accessItems || []).map(renderResource)}
          </div>
        </div>
      </main>
    </Meta>
  )
}

const enhance = compose(
  withPageHelper,
  withVideoProviders,
)

export default enhance(AnonymousAccessIndex)
