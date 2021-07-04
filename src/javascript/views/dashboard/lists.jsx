import React from 'react'
import { withRouter } from 'react-router-dom'
import moment from 'moment'

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'

// Actions
import ListsActions from 'javascript/actions/lists'

// Stores
import ListsStore from 'javascript/stores/lists'

// Components
import Tabs from 'javascript/components/tabs'
import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'
import PageLoader from 'javascript/components/page-loader'

class DashboardListsIndex extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      resources: null,
      tabPosition: 0,
      loaded: false
    }
    this.query = {
      include: 'list-programmes,list-programmes.programme',
      fields: {
        'lists': 'name,list-programmes,shared,updated-at',
        'list-programmes': 'programme',
      },
      page: {
        size: '4'
      },
      sort: '-updated-at'
    }
    this.myListsQuery = Object.assign({}, this.query, {
      filter: {
        'global': false,
        'my-lists': true
      }
    })
    this.sharedListsQuery = Object.assign({}, this.query, {
      filter: {
        'global': false,
        'shared-with-me': true
      }
    })
  }

  componentWillMount() {
    ListsStore.on('nestedChange', this.getNestedResource)
  }

  componentWillUnmount() {
    ListsStore.removeListener('nestedChange', this.getNestedResource)
  }

  componentDidMount() {
    ListsActions.getNestedResources([this.myListsQuery, this.sharedListsQuery])
  }

  getNestedResource = () => {
    const resources = ListsStore.getResources()
    const loaded = resources ? true : false
    this.setState({
      resources,
      loaded
    })
  }

  viewLists = () => {
    this.props.history.push(`/${this.props.theme.variables.SystemPages.account.path}/${this.props.theme.variables.SystemPages.list.path}/my-${this.props.theme.variables.SystemPages.list.path}`)
  }

  tabChanged = (tabSelected) => {
    this.setState({
      tabPosition: tabSelected
    })
  }

  renderLists() {
    if (!this.state.loaded) return
    let listCards = (this.state.resources[this.state.tabPosition] || []).map(list => {
      let images = []
      list['list-programmes'].forEach(lp => {
        if (images.length < 4 && lp.programme.thumbnail && lp.programme.thumbnail.small.url) {
          images.push(lp.programme.thumbnail.small.url)
        }
      })
      if (images.length > 1 && images.length < 3) images = images.slice(0, 1)
      const lastUpdated = moment(list['updated-at']).format('DD MMM YYYY');
      return (
        <Card key={list.id} title={list.name} url={`/${this.props.theme.variables.SystemPages.account.path}/${this.props.theme.variables.SystemPages.list.path}/my-${this.props.theme.variables.SystemPages.list.path}/${list.id}`} images={images}>
          <p className="card__count">
            <Icon id="i-folder" />
            <span>{list['list-programmes'].length}</span>
          </p>
          {lastUpdated}
        </Card>
      )
    })
    if (!listCards.length) {
      const noListsMsg = this.state.tabPosition ? 'You have no Lists shared with you' : 'You have no saved Lists'
      return (
        <div className="grid">
          { noListsMsg }
        </div>
      )
    }
    return (
      <div className="grid grid--four">
        {listCards}
      </div>
    )
  }

  render() {
    return (
      <section className="section section--shade">
        <div className="container">
          <h2 class="content-block__heading">Lists</h2>
          <Tabs onChange={ (e) => this.tabChanged(e.value) } >
            <div title="Your Lists"></div>
            <div title="Shared Lists"></div>
          </Tabs>
          <PageLoader {...this.state}>
            { this.renderLists() }
          </PageLoader>
          <div className="actions__inner">
            <button onClick={this.viewLists} className="button button--filled">
              View all
            </button>
          </div>
        </div>
      </section>
    )
  }
}

const enhance = compose(
  withRouter,
  withTheme
)

export default enhance(DashboardListsIndex)