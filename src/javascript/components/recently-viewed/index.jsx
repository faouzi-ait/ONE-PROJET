import React from 'react'
import pluralize from 'pluralize'

import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import allClientVariables from './variables'
import cardClientVariables from 'javascript/components/cards/programmes/variables'
import { isCms } from 'javascript/utils/generic-tools'

// Actions
import ProgrammesActions from 'javascript/actions/programmes'

// Stores
import ProgrammesStores from 'javascript/stores/programmes'

// Components
import ProgrammeCard from 'javascript/components/programme-card'
/* #region  demo */
import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'
/* #endregion */

import Carousel from 'javascript/components/carousel'
import Programme from 'javascript/components/programme'


class RecentlyViewed extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      resources: [],
      programme: props.programme || null
    }
  }

  componentWillMount() {
    ProgrammesStores.on('change', this.setResources)
  }

  componentWillUnmount() {
    ProgrammesStores.removeListener('change', this.setResources)
  }

  componentDidMount() {
    const {theme, clientVariables} = this.props
    const fields = {
      programmes: [
        'title,thumbnail,short-description',
        theme.features.programmeOverview.logoTitle && 'logo',
        clientVariables.showGenres && 'genres',
        clientVariables.durationTag && 'custom-attributes',
        theme.features.customCatalogues.enabled && 'catalogues'
      ].filter(Boolean).join(',')
    }
    const include = [
      clientVariables.showGenres && 'genres',
      clientVariables.durationTag && 'custom-attributes,custom-attributes.custom-attribute-type',
      theme.features.customCatalogues.enabled && 'catalogues' && 'catalogues'
    ].filter(Boolean).join(',')
    if(clientVariables.showGenres){
      fields['genres'] = 'name,parent-id'
    }
    if(clientVariables.durationTag){
      fields['custom-attributes'] = 'custom-attribute-type,value,position'
    }
    if(theme.features.customCatalogues.enabled) {
      fields['catalogues'] = 'name'
    }
    ProgrammesActions.getResources({
      include,
      filter: {
        recently_viewed: true,
        not_ids: this.state.programme
      },
      page: {
        size: this.props.clientVariables.totalCarouselSlides,
      },
      fields
    })
  }

  setResources = () => {
    this.setState({
      resources: ProgrammesStores.getResources()
    })
  }

  renderResource = (p) => {
    const { theme, clientVariables, addToList } = this.props

    if(clientVariables.programmeComponent){
      return <ClientProps
        clientProps={{
          image: {
            'default': p.thumbnail.small.url,
            'banijaygroup | endeavor': p.thumbnail.opt.url
          },
          titleClasses: {
            default: (theme.features.cards && p.title.length > theme.features.cards.ellipsisLength) ? 'programme__title programme__title--ellipsis' : 'programme__title',
            'banijaygroup | cineflix | fremantle': 'programme__title'
          }
        }}
        renderProp={(clientProps) => (
          <Programme
            key={p.id}
            poster={clientProps.image}
            href={`/${theme.variables.SystemPages.catalogue.path}/${p.id}`}>
            { (theme.features.programmeOverview.logoTitle && p.logo.url && clientVariables.showLogos) ? (
                <img src={p.logo.url.replace('.net/', `.net/140xnull/`)} alt={`${p.title} logo`} className="programme__logo" />
              ) : (
                <h1 class={clientProps.titleClasses}>{p.title}</h1>
              )
            }
          </Programme>
      )}
      />
    } else {
      return <ProgrammeCard programme={p} addToList={addToList} />
    }
  }

  render() {

    if (this.state.resources.length === 0) {
      return null
    }
    const { theme, clientVariables } = this.props
    return (
      <ClientProps
        clientProps={{
          title: {
            default: `Your Recently Viewed ${pluralize(theme.localisation.programme.upper)}`,
            'ae': `Recently Viewed ${pluralize(theme.localisation.programme.upper)}`,
            'drg | endeavor': `Your recently viewed ${pluralize(theme.localisation.programme.lower)}`,
            'fremantle': `Recently viewed`,
          },
        }}
        renderProp={(clientProps) => (
          <section className={clientVariables.sectionClasses}>
            <div className="container">
              <h1 class="section__header">{clientProps.title}</h1>
            </div>

            <div className="recently-viewed">
              <Carousel
                classes={['recent']}
                options={clientVariables.carouselOptionsDefault}
                responsive={[{
                  breakpoint: 1024,
                  options: clientVariables.carouselOptionsLarge
                }, {
                  breakpoint: 768,
                  options: clientVariables.carouselOptionsMedium
                }, {
                  breakpoint: 568,
                  options: clientVariables.carouselOptionsSmall
                }]}
              >
                {this.state.resources.map(this.renderResource)}
              </Carousel>
            </div>

          </section>
        )}
      />
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables),
  withClientVariables('cardCV', cardClientVariables)
)

export default enhance(RecentlyViewed)