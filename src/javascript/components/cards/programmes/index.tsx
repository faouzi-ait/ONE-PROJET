import React, { ReactNode } from 'react'
import pluralize from 'pluralize'

// Stores
import Store from 'javascript/stores/programmes'

// Actions
import Actions from 'javascript/actions/programmes'

// Components
import Button from 'javascript/components/button'
import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'
import Programme from 'javascript/components/programme'
import { ProgrammeType, UserType } from 'javascript/types/ModelTypes';
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import { getBannerImageUrls } from 'javascript/components/banner'
import uuid from 'uuid/v4'

import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import allClientVariables from './variables'
import programmeQuery from 'javascript/utils/queries/programmes'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

export interface ProgrammesComponentProps {
  ids: ProgrammeType['id'][]
  user: UserType
  addToList: (programme: ProgrammeType[]) => () => void;
  render: (children: ReactNode[]) => any
  seriesCount?: unknown
  programmeComponent?: boolean
  theme: ThemeType
  clientVariables: any
  fullWidth: boolean
}

interface State {
  resources?: ProgrammeType[]
}

class CardsProgrammes extends React.Component<ProgrammesComponentProps, State> {
  state: State = {}

  componentWillMount() {
    Store.on('dataChange', this.setResources)
  }

  componentWillUnmount() {
    Store.removeListener('dataChange', this.setResources)
  }

  componentDidMount() {
    const {theme, clientVariables} = this.props
    const defaultQuery = programmeQuery(theme, clientVariables)

    defaultQuery.fields.programmes = [
      `${defaultQuery.fields.programmes}`,
      'number-of-series',
      this.props.fullWidth && 'banner-urls',
      clientVariables.seriesCounter && 'active-series-counter',
    ].filter(Boolean).join(',')

    Actions.getDataResources({
      ...defaultQuery,
      filter: {
        ids: this.props.ids.join()
      },
    })
  }

  setResources = () => {
    this.setState({
      resources: Store.getDataResources(this.props.ids)
    })
  }

  renderProgramme = (p, key) => {
    const { theme, clientVariables } = this.props
    let intro = p.introduction ? p.introduction.substring(0, clientVariables.introLength) : ''
    if (p.introduction && p.introduction.length > clientVariables.introLength) {
      intro = intro.substring(0, Math.min(intro.length, intro.lastIndexOf(' '))) + '...'
    }
    const uniqueKey = `${p.id}_${key}` // Can have same Programme more than once
    const genres = clientVariables.genres(p.genres)
    const catalogues = p.catalogues || []

    let image = { src: p.thumbnail && p.thumbnail.url }

    //If the programme is full width
    if(this.props.fullWidth){
      image = getBannerImageUrls(p)
    }

    let episodeTag = {}
    if (theme.features.programmeOverview?.episodeTag) {
      const episodeCount = p['number-of-episodes']
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
      {p['custom-attributes']?.map((i, index) => {
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

    return this.props.programmeComponent ? (
      <Programme
        poster={p.thumbnail?.small?.url}
        key={p.id}
        href={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(p, theme)}`}>
        {theme.features.programmeOverview?.logoTitle && p.logo.url ?
          <img src={p.logo.url} alt={`${p.title} logo`} className="programme__logo" />
          :
          <h1 className={(theme.features.cards && p.title.length > theme.features.cards.ellipsisLength) ? 'programme__title programme__title--ellipsis' : 'programme__title'}>{p.title}</h1>
        }
      </Programme>
    ) : (
      <ClientProps
        clientProps={{
          title: {
            'default': theme.features.cards.titleLimit && p.title.length > theme.features.cards.titleLimit ? `${p.title.substring(0, theme.features.cards && theme.features.cards.titleLimit)}...` : p.title,
            'amc | all3': p.title,
            'cineflix': null
          },
          description: {
            default: p['short-description'],
            'amc': intro,
            'ae': this.props.fullWidth ? p['short-description'] : null,
            'cineflix': null
          },
          classes: {
            'default': [],
            'amc': ['hover'],
            'all3': ['catalogue', p['programme-type']?.name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase()],
            'ae | banijaygroup | cineflix | fremantle | itv': ['catalogue'],
          },
          intro: {
            default: null,
            'drg | endeavor | fremantle': intro,
            'cineflix': p['short-description'] || intro
          },
          introTitle: {
            default: null,
            'cineflix': p.title
          },
          subTitle: {
            default: null,
            'all3': p['programme-type']?.name,
            'amc' : this.props.seriesCount && p['number-of-series'] > 0 && (p['number-of-series'] === 1 ? `${p['number-of-series']} season` : `${p['number-of-series']} seasons`)
          },
          tags: {
            default: [episodeTag, ...genres, ...durationTags],
            'all3': [p['programme-type']?.name !== 'Format' && episodeTag, ...genres, durationTags],
            'ae': [...catalogues, ...durationTags],
          }
        }}
        renderProp={(clientProps) => (
          <Card
            key={uniqueKey}
            cardId={uniqueKey}
            url={`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(p, theme)}`}
            image={image}
            logo={(theme.features.programmeOverview?.logoTitle) ? p.logo : {}}
            size={clientVariables.programmeCardSize}
            {...clientProps}
          >
            {clientVariables.seriesCounter && p['active-series-counter'] > 0 && (
              <p className="card__copy">{p['active-series-counter']} {p['active-series-counter'] === 1 ? theme.localisation.series.upper : pluralize(theme.localisation.series.upper)}</p>
            )}

            {this.props.user &&
              <div className="card__actions">
                <Button onClick={this.props.addToList([p])} className={clientVariables.addListClasses} title={`Add to ${theme.localisation.list.lower}`}>
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
                </Button>
              </div>
            }

            {p['new-release'] &&
              <span className="tag tag--new">New</span>
            }
          </Card>
        )}
      />
    )
  }

  render() {
    if (!this.state.resources) {
      return null
    }
    const { resources } = this.state
    const programmes = this.props.ids.map(id => resources.find(r => r.id === id)).filter(x => x)

    return this.props.render(programmes.map(this.renderProgramme))
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables)
)

export default enhance(CardsProgrammes)