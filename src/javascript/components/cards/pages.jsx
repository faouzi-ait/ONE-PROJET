import React from 'react'

// Stores
import Store from 'javascript/stores/pages'
// Actions
import Actions from 'javascript/actions/pages'
// Components
import Card from 'javascript/components/card'
import NavLink from 'javascript/components/nav-link'

export default class extends React.Component {
  state = {}

  componentWillMount() {
    Store.on('dataChange', this.setResources)
  }

  componentWillUnmount() {
    Store.removeListener('dataChange', this.setResources)
  }

  componentDidMount() {
    Actions.getDataResources({
      filter: {
        ids: this.props.ids.join()
      },

      /* #region  ae | all3 | amc | cineflix | demo | discovery | endeavor | fremantle | drg | itv | keshet | rtv | storylab | wildbrain */
      fields: {
        pages: 'title,introduction,thumbnail,slug,published-at'
      },

      /* #region  itv */
      // NESTED REGION
      sort: '-published-at'
        /* #endregion */

      /* #endregion */
      /* #region  banijaygroup */
      include: 'collection',
      fields: {
        pages: 'title,introduction,thumbnail,slug,published-at,collection',
        collections: 'title'
      }
      /* #endregion */

    })
  }

  setResources = () => {
    this.setState({
      resources: Store.getDataResources(this.props.ids)
    })
  }

  render() {
    if (!this.state.resources) {
      return false
    }

    const { resources } = this.state
    let sortedResources = []
    this.props.ids.map(a => {
      const resource = resources.filter(b => b.id === a)
      if(resource.length > 0) {
        sortedResources.push(resource[0])
      }
    })

    /* #region  ae | all3 | amc | banijaygroup | cineflix | demo | discovery | endeavor | fremantle | keshet | rtv | storylab | wildbrain */
    return this.props.render(sortedResources.map(p => {
      return (
        <Card 
          title={p.title} 
          url={`/${p.slug}`} 
          image={{ src: p.thumbnail.url }} 
          description={p.introduction} 
          key={p.id} 
          date={p['published-at']} 
          /* #region storylab | wildbrain */
          size={'tall'}
          classes={['pages']}
          /* #endregion */
          /* #region  endeavor | fremantle */
          size={'medium'}
          /* #endregion */
          /* #region ae */
          size={'tall'}
          classes={['catalogue', 'tall']} 
          /* #endregion */
          />
      )
    }))
    /* #endregion */
    /* #region  itv */
    const pages = this.props.order === 'manual' ? this.props.ids.map(id => resources.find(v => v.id === id)) : sortedResources
    return this.props.render(pages.filter(p => p).map(p => (
      <Card title={p.title} url={`/${p.slug}`} image={{ src: p.thumbnail.url }} description={p.introduction} key={p.id} date={p['published-at']} />
    )))
    /* #endregion */
    /* #region  drg */
    return this.props.render(sortedResources.map((p, i) => {
      let intro = p.introduction ? p.introduction.substring(0, 172) : ''
      if (p.introduction && p.introduction.length > 172) {
        intro = intro.substring(0, Math.min(intro.length, intro.lastIndexOf(' '))) + '...'
      }
      return (
        <Card title={p.title} url={`/${p.slug}`} image={{ src: p.thumbnail.url }} intro={intro} key={i} date={p['published-at']} />
      )
    }))
    /* #endregion */
  }
}

