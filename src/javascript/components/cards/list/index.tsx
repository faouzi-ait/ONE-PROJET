import React from 'react'
import { NavLink } from 'react-router-dom'
import uuid from 'uuid/v4'

import allClientVariables from './variables'

import compose from 'javascript/utils/compose'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'
import withUser from 'javascript/components/hoc/with-user'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import ClientProps from 'javascript/utils/client-switch/components/client-props'

import { ProgrammeType, UserType, ListType } from 'javascript/types/ModelTypes'
import VideoProviders from 'javascript/types/VideoProviders'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

// Components
import Card from 'javascript/components/card'
import Like from 'javascript/components/like'
import Toggle from 'javascript/components/toggle'

// Services
import { isInternal } from 'javascript/services/user-permissions'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

interface Props {
  resource: any,
  user: UserType,
  theme: ThemeType
  videoProviders: VideoProviders,
  dragged?: any
  list: ListType,
  programmes: ProgrammeType[],
  showLike?: boolean,
  onClick?: (e?: any) => void,
  onDragStart?: (e?: any) => void,
  onDragEnd?: (e?: any) => void,
  onDragOver?: (e?: any) => void,
  onDrop?: (e?: any) => void
}

const ListCards: React.FC<Props> = ({
  resource,
  user,
  theme,
  videoProviders,
  dragged,
  list,
  programmes,
  showLike,
  onClick,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}) => {

  const listsShowCardsCV = useClientVariables(allClientVariables)
  const { wistia } = videoProviders

  const findProgrammeName = (r) => {
    const { data } = list?.['list-elements']?.find(({ data }) => data.id === r.id && data.type === r.type)
    if (data) {
      return data.attributes['programme-name']
    }
  }

  const findProgrammePath = (r) => {
    const { data } = list?.['list-elements']?.find(({ data }) => data.id === r.id && data.type === r.type)
    if (data) {
      return theme?.features.programmeSlugs.enabled ? data.attributes['programme-slug'] : data.attributes['programme-id']
    }
  }

  const getProgrammeDuration = (attributes = []) => {
    let durationTags = []
    {attributes?.map((i, index) => {
      if (i['custom-attribute-type']?.name.toLowerCase() === 'duration') {
        durationTags.push({
          name: i.value,
          id: uuid()
        })
      } else {
        return false
      }
    })}
    return durationTags
  }


  const listCardClasses = (classes) => [
    ...classes,
    resource.selected && 'active',
    resource.id === dragged?.id && 'hidden',
    !list.global && 'with-like'
  ]

  const renderFuncs = {
    'list-videos': () => {
      const programme = programmes.find(p => p.id == resource['programme-id'])
      let thumbnail = resource.video.poster.small.url
      if (wistia && thumbnail === null) {
        thumbnail = resource.video['wistia-thumbnail-url']
      }
      const contentTitles = {
        programmeName: findProgrammeName(resource),
        seriesName: resource.video.parent.type === 'series' ? resource.video.parent.name : '',
        videoName: resource.video.name
      }
      const cardChildren = {
        'cardCopy': () => (
          <p className="card__copy">
            {contentTitles[listsShowCardsCV.videoCardCopy]}
          </p>
        ),
        'cardSmallTitle': () => (
          <p className="card__title card__title--small">
            {contentTitles[listsShowCardsCV.videoCardSmallTitle]}
          </p>
        ),
        'amcCustomContent': () => (
          <>
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
                <NavLink draggable="false" to={`/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath(resource)}/${resource.video.id}`}>{resource.video.name}</NavLink>
              </h3>
            </div>
          </>
        ),
        'fremantleCustomContent': () => (
          <>
            <p className="card__copy card__copy--small">
              {resource.video.parent.type === 'series' ? contentTitles[listsShowCardsCV.videoCardCopy] : contentTitles[listsShowCardsCV.videoCardSmallTitle]}
            </p>
          </>
        )
      }
      let restrictedTag = {}
      if(listsShowCardsCV.displayRestrictedWithTags && resource.video.restricted && isInternal(user)) {
        restrictedTag = {
          name: theme.localisation.restricted.upper,
          id: uuid()
        }
      }
      const genres = programme?.genres || []
      const catalogues = programme?.catalogues || []
      return (
        <ClientProps
          clientProps={{
            subTitle: {
              'all3': programme && programme['programme-type']?.name
            },
            classNames: {
              default: [onDragStart && 'draggable', onClick && 'toggle'],
              'ae | itv': [onDragStart && 'draggable', 'catalogue'],
              'all3': [onDragStart && 'draggable', 'catalogue', onClick && 'toggle', programme?.['programme-type']?.name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()],
              'banijaygroup': [onDragStart && 'draggable', 'video'],
              'cineflix | drg': [onDragStart && 'draggable', onClick && 'toggle', 'list'],
              'fremantle': [onDragStart && 'draggable', onClick ? 'toggle': 'catalogue'],
            },
            tags: {
              default: [...genres, restrictedTag],
              'ae': [...catalogues, ...getProgrammeDuration(programme?.['custom-attributes'] || [])],
            }
          }}
          renderProp={(clientProps) => (
            <Card key={`${resource.id}-${resource.type}`}
              image={{ src: thumbnail, alt: resource.video.name }}
              draggable={onDragStart && ((user['user-type'] === 'external' && !list.global) || user['user-type'] === 'internal')}
              classes={listCardClasses(clientProps.classNames)}
              title={contentTitles[listsShowCardsCV.videoCardMainTitle]}
              url={`/${theme.variables.SystemPages.catalogue.path}/${findProgrammePath(resource)}/${resource.video.id}`}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
              video={true}
              icon={resource['notes-count'] && resource['notes-count'] > 0 ? 'note' : null}
              iconsOutside={listsShowCardsCV.iconsOutside}
              {...clientProps}>
              {listsShowCardsCV.videoCardOrder.map((childType) => cardChildren[childType]())}
              {onClick && (!list.global || user['user-type'] === 'internal') &&
                <Toggle onClick={onClick} classes={resource.selected && ['active']} />
              }
              {!list.global && showLike &&
                <Like type={theme.localisation.programme.upper} resource={resource} />
              }
              {resource.video.restricted && isInternal(user) && !listsShowCardsCV.displayRestrictedWithTags &&
                <div className="card__strip">{theme.localisation.restricted.upper}</div>
              }
            </Card>
          )
        } />
      )
    },
    'list-series': () => {
      const contentTitles = {
        programmeName: findProgrammeName(resource),
        programmeId: findProgrammePath(resource),
        seriesName: resource.series.name,
        seriesDescription: resource.series['short-description'],
      }
      const cardChildren = {
        'cardCopy': () => (
          <p className="card__copy" dangerouslySetInnerHTML={{ __html: contentTitles[listsShowCardsCV.seriesCardCopy] }}></p>
        ),
        'cardSmallTitle': () => (
          <p className="card__title card__title--small">
            {contentTitles[listsShowCardsCV.seriesCardSmallTitle]}
          </p>
        ),
        'amcCustomContent': () => (
          <>
            <div className="card__actions"></div>
            <div className="card__title-wrap">
              <div className="card__list-item-details">
                <span className="card__list-count">{contentTitles.programmeName}</span><br />
              </div>
              <h3 className="card__title">
                <NavLink draggable="false" to={`/${theme.variables.SystemPages.catalogue.path}/${contentTitles.programmeId}}`}>{resource.series.name}</NavLink>
              </h3>
            </div>
          </>
        )
      }
      let restrictedTag = {}
      const catalogues = resource.series.programme.catalogues || []
      if(listsShowCardsCV.displayRestrictedWithTags && resource.series.restricted && isInternal(user)) {
        restrictedTag = {
          name: theme.localisation.restricted.upper,
          id: uuid()
        }
      }
      return (
        <ClientProps
          clientProps={{
            subTitle: {
              'all3': resource.series.programme['programme-type']?.name
            },
            classNames: {
              default: [onDragStart && 'draggable', onClick && 'toggle'],
              'all3': ['drag' && 'draggable','catalogue', onClick && 'toggle', resource.series?.programme?.['programme-type']?.name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()],
              'ae | banijaygroup | itv': [onDragStart && 'draggable', 'catalogue'],
              'cineflix | drg': [onDragStart && 'draggable', onClick && 'toggle', 'list'],
              'fremantle': [onDragStart && 'draggable', onClick ? 'toggle': 'catalogue'],
            },
            tags: {
              default: [...resource.series.programme.genres, restrictedTag],
              'ae': [...catalogues, ...getProgrammeDuration(resource.series.programme['custom-attributes'])],
            }
          }}
          renderProp={(clientProps) => (
            <Card key={`${resource.id}-${resource.type}`}
              image={{ src: resource.series.programme.thumbnail.url, alt: resource.series.programme.title }}
              draggable={onDragStart && ((user['user-type'] === 'external' && !list.global) || user['user-type'] === 'internal')}
              classes={listCardClasses(clientProps.classNames)}
              tags={[...resource.series.programme.genres, restrictedTag]}
              size={listsShowCardsCV.programmeCardSize}
              title={contentTitles[listsShowCardsCV.seriesCardMainTitle]}
              url={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(resource.series.programme, theme)}`}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
              icon={resource['notes-count'] && resource['notes-count'] > 0 ? 'note' : null}
              intro={listsShowCardsCV.seriesCardIntro(resource.series['short-description'])}
              iconsOutside={listsShowCardsCV.iconsOutside}
              {...clientProps}>
              {listsShowCardsCV.seriesCardOrder.map((childType) => cardChildren[childType]())}
              {onClick && (!list.global || user['user-type'] === 'internal') &&
                <Toggle onClick={onClick} classes={resource.selected && ['active']} />
              }
              {!list.global && showLike &&
                <Like type={theme.localisation.programme.upper} resource={resource} />
              }
              {resource.series.restricted && isInternal(user) && !listsShowCardsCV.displayRestrictedWithTags &&
                <div className="card__strip">{theme.localisation.restricted.upper}</div>
              }
            </Card>
          )
        } />
      )
    },
    'list-programmes': () => {
      let restrictedTag = {}
      const catalogues = resource.programme.catalogues || []
      if(listsShowCardsCV.displayRestrictedWithTags && resource.programme.restricted && isInternal(user)) {
        restrictedTag = {
          name: theme.localisation.restricted.upper,
          id: uuid()
        }
      }

      return (
        <ClientProps
          clientProps={{
            subTitle: {
              'all3': resource.programme['programme-type']?.name
            },
            classNames: {
              default: [onDragStart && 'draggable', onClick && 'toggle'],
              'all3': ['drag' && 'draggable','catalogue', onClick && 'toggle', resource.programme['programme-type']?.name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()],
              'ae | banijaygroup | itv': [onDragStart && 'draggable', 'catalogue'],
              'cineflix | drg': [onDragStart && 'draggable', onClick && 'toggle', 'list'],
              'fremantle': [onDragStart && 'draggable', onClick ? 'toggle': 'catalogue'],
            },
            tags: {
              default: [...resource.programme.genres, restrictedTag],
              'ae': [...catalogues, ...getProgrammeDuration(resource.programme['custom-attributes'])],
            }
          }}
          renderProp={(clientProps) => (
            <Card key={`${resource.id}-${resource.type}`}
              image={{ src: resource.programme.thumbnail.url, alt: resource.programme.title }}
              title={theme.features.cards.titleLimit && resource.programme.title.length > theme.features.cards.titleLimit ? `${resource.programme.title.substring(0, theme.features.cards.titleLimit)}...` : resource.programme.title}
              description={listsShowCardsCV.programmeCardDescription(resource.programme['short-description'])}
              intro={listsShowCardsCV.programmeCardIntro(resource.programme['short-description'])}
              url={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(resource.programme, theme)}`}
              draggable={onDragStart && ((user['user-type'] === 'external' && !list.global) || user['user-type'] === 'internal')}
              classes={listCardClasses(clientProps.classNames)}
              size={listsShowCardsCV.programmeCardSize}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={onDrop}
              icon={resource['notes-count'] && resource['notes-count'] > 0 ? 'note' : null}
              logo={theme.features.programmeOverview.logoTitle && resource.programme.logo}
              iconsOutside={listsShowCardsCV.iconsOutside}
              {...clientProps}>
              {onClick && (!list.global || user['user-type'] === 'internal') &&
                <Toggle onClick={onClick} classes={resource.selected && ['active']} />
              }
              {!list.global && showLike &&
                <Like type={theme.localisation.programme.upper} resource={resource} />
              }
              <ClientSpecific client="amc">
                <div className="card__actions"></div>
              </ClientSpecific>
              {resource.programme.restricted && isInternal(user) && !listsShowCardsCV.displayRestrictedWithTags &&
                <div className="card__strip">{theme.localisation.restricted.upper}</div>
              }
            </Card>
          )
        } />
      )
    }
  }

  return renderFuncs[resource.type]()
}

const enhance = compose(
  withTheme,
  withUser,
  withVideoProviders
)

export default enhance(ListCards)
