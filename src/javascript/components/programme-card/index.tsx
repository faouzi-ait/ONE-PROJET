import React from 'react'
import pluralize from 'pluralize'
import uuid from 'uuid/v4'

import { isCms } from 'javascript/utils/generic-tools'
import compose from 'javascript/utils/compose'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

import clientSpecificVariables from './variables'

// Components
import Button from 'javascript/components/button'
import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'

import { ProgrammeType } from 'javascript/types/ModelTypes'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'

interface Props {
  addToList?: (programme: ProgrammeType[]) => (e: any) => void
  programme: ProgrammeType
  theme: ThemeType
}

const ProgrammeCard: React.FC<Props> = ({
  addToList,
  programme,
  theme,
  children
}) => {

  const clientVariables = useClientVariables(clientSpecificVariables)
  const genres = programme.genres && programme.genres.filter(g => !g['parent-id']) || []
  const catalogues = programme.catalogues || []

  let episodeTag = {}
  if (theme.features.programmeOverview?.episodeTag) {
    const episodeCount = programme['number-of-episodes']
    if (episodeCount > 0) {
      episodeTag = {
        name: `${episodeCount} ${episodeCount === 1 ? theme.localisation.episodes.shorthand : pluralize(theme.localisation.episodes.shorthand)}`,
        id: uuid(),
        alt: true
      }
    }
  }
  let durationTags = []
  if(clientVariables.durationTag) {
    {programme['custom-attributes']?.map((i, index) => {
      if (i['custom-attribute-type']?.name.toLowerCase() === 'duration') {
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
          'default': theme.features.cards.titleLimit && programme.title.length > theme.features.cards.titleLimit ? `${programme.title.substring(0, theme.features.cards && theme.features.cards.titleLimit)}...` : programme.title,
          'ae | banijaygroup | fremantle': programme.title,
          'cineflix': ''
        },
        intro: {
          'cineflix': programme['short-description']
        },
        description: {
          'default': programme['short-description'],
          'banijaygroup': programme['introduction'],
          'ae | cineflix | fremantle': null
        },
        classes: {
          'default': [],
          'all3': ['catalogue', programme['programme-type']?.name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()],
          'amc': ['hover'],
          'ae | banijaygroup | fremantle': ['catalogue'],
          'itv': ['catalogue', 'large']
        },
        size: {
          default: null,
          'ae | itv': 'medium',
          'banijaygroup': 'tall'
        },
        subTitle: {
          'all3': programme['programme-type']?.name
        },
        introTitle: {
          'cineflix': programme.title
        },
        tags: {
          default: [episodeTag, ...genres, ...durationTags],
          'all3': [programme['programme-type']?.name !== 'Format' && episodeTag, ...genres, durationTags],
          'ae': [...catalogues, ...durationTags],
        }
      }}
      renderProp={(clientProps) => (
        <Card key={programme.id}
          image={{ src: programme.thumbnail.url, alt: programme.title }}
          url={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(programme, theme)}`}
          title={programme.title}
          {...clientProps}>

          {clientVariables.brandLogo && programme['custom-attributes'] && programme['custom-attributes'].map((i, index) => {
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
          {clientVariables.seriesCounter && programme['active-series-counter'] > 0 && (
            <p className="card__copy">{programme['active-series-counter']} {programme['active-series-counter'] === 1 ? theme.localisation.series.upper : pluralize(theme.localisation.series.upper)}</p>
          )}
          {!isCms() && addToList && (
            <div className="card__actions">
              <Button onClick={addToList([programme])} className={clientVariables.addToListButtonClasses}>
                <span className={clientVariables.addToListSpanClasses}>
                  <Icon id={clientVariables.addToListIcon} />
                </span>
              </Button>
            </div>
          )}
          {children}
        </Card>
      )}
    />
  )
}


const enhance = compose(
  withTheme,
)

export default enhance(ProgrammeCard)
