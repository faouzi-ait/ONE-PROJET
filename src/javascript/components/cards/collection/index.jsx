import React from 'react'
import NavLink from 'javascript/components/nav-link'

// Stores
import Store from 'javascript/stores/pages'

// Actions
import Actions from 'javascript/actions/pages'

import allClientVariables from './variables'
// Components
import Card from 'javascript/components/card'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import getGridClass from 'javascript/utils/helper-functions/get-grid-class'

class CollectionCard extends React.Component {
  state = {}

  componentWillMount() {
    Store.on('dataChange', this.setResources)
  }

  componentWillUnmount() {
    Store.removeListener('dataChange', this.setResources)
  }

  componentDidMount() {
    Actions.getDataResources({
      page: {
        size: this.props.size
      },
      filter: {
        collection_ids: this.props.id
      },
      include: 'collection',
      fields: {
        pages: 'title,introduction,thumbnail,collection,published-at,slug',
        collections: 'title',
      },
      ...this.props.collectionCardCV.sortFilter(this.props.order)
    })
  }

  setResources = () => {
    const resources = Store.getDataResources(false)
    this.setState({
      resources: resources.filter(page => page.collection && page.collection.id === this.props.id)
    })
  }

  render() {
    if (!this.state.resources) {
      return false
    }
    const {
      date,
      intro,
      description,
      cta,
    } = this.props.collectionCardCV

    const { resources } = this.state
    return (
      <div className={`grid grid--${getGridClass(this.props.size)}`}>
        {resources.map((p, i) => {
          const isNews = p.collection && p.collection.title.toLowerCase().includes('news')
          if (intro){
            let introText = p.introduction ? p.introduction.substring(0, 172) : ''
            if (p.introduction && p.introduction.length > 172) {
              introText = introText.substring(0, Math.min(intro.length, introText.lastIndexOf(' '))) + '...'
            }
          }
          return (
            <Card
              key={i}
              title={p.title}
              description={description && p.introduction}
              image={{ src: p.thumbnail.url }}
              url={`/${p.slug}`}
              date={date && p['published-at']}
              intro={intro}>
              {isNews && cta &&
                <NavLink to={p.slug} className="button">Read story</NavLink>
              }
            </Card>
          )
        })}
      </div>
    )
  }
}

const enhance = compose(
  withClientVariables('collectionCardCV', allClientVariables)
)

export default enhance(CollectionCard)
