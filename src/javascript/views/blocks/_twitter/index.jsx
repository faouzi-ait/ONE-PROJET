import React from 'react'
import moment from 'moment'

// HOC
import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import twitterClientVariables from './variables'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

// State
import TweetActions from 'javascript/actions/tweets'
import TweetsStore from 'javascript/stores/tweets'

import 'stylesheets/core/components/tweet'


class Block extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      account: props.block.account,
      resources: []
    }
  }

  componentWillMount() {
    TweetsStore.on('change', this.getResources)
  }
  componentWillUnmount() {
    TweetsStore.removeListener('change', this.getResources)
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      account: nextProps.block.account
    }, this.requestResources)
  }

  componentDidMount() {
    this.requestResources()
  }

  requestResources = () => {
    TweetActions.getResources({
      filter: {
        'count': 3,
        'twitter-id': this.state.account
      },
      fields: {
        'tweets': 'created-at,full-text,user'
      },
    })
  }

  getResources = () => {
    this.setState({
      resources: TweetsStore.getResources()
    })
  }

  render() {
    const { block, theme, twitterCV } = this.props
    return (
      <div>
        { block.title &&
          <h2 class="content-block__heading">{ block.title }
            { twitterCV.viewAllButton && this.state.account &&
              <a href={ `http://twitter.com/${this.state.account}` } target="_blank" className="button button--small button--delta">View all</a>
            }
          </h2>
        }
        <div className="grid grid--three fade-on-load">
          { this.state.resources.map((resource) => {
            const avatar = <img className="tweet__avatar" src={ resource.user && resource.user['profile_image_url']} alt={resource.user && resource.user.name} />
            const title = <>
            <h3>
              <span className="tweet__title">{resource.user && resource.user.name}</span>
              <span className="tweet__handle">@{resource.user && resource.user.screen_name}</span>
            </h3></>
            return (
              <div key={ resource.id } className="tweet">
                 <ClientChoice>
                    <ClientSpecific client="default">
                    <div className="tweet__header">
                      {avatar}
                      {title}
                    </div>
                    </ClientSpecific>
                    <ClientSpecific client="cineflix">
                      <>
                        {avatar}
                        <div className="tweet__header">
                          {title}
                        </div>
                      </>
                    </ClientSpecific>
                </ClientChoice>
                <p className="tweet__copy">{resource['full-text']}</p>
                <div className="tweet__date">{ moment(resource['created-at']).format(theme.features.formats.longDate) }</div>
              </div>
            )
          })
        }
        </div>
      </div>
    )
  }
}

const TwitterBlock = (
  block,
  assets,
  props,
) => {
  return (
    <EnhancedTwitterBlock
      block={block}
      assets={assets}
      {...props}
    />
  )
}

export default TwitterBlock

const enhance = compose(
  withTheme,
  withClientVariables('twitterCV', twitterClientVariables),
)

const EnhancedTwitterBlock = enhance(Block)