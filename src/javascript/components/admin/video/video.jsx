// React
import React from 'react'
import HelperComponent from 'javascript/components/helper'
import pluralize from 'pluralize'
import NavLink from 'javascript/components/nav-link'
import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withVideoProviders from 'javascript/components/hoc/with-video-providers'
import withPrefix from 'javascript/components/hoc/with-prefix'

class VideoResource extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = `${props.prefix}table__row`
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  programme = () => {
    return { id: this.props.resource[ 'programme-id' ], name: this.props.resource[ 'programme-name' ] }
  }

  series = () => {
    return { id: this.props.resource[ 'series-id' ], name: this.props.resource[ 'series-name' ] }
  }

  episode = () => {
    return { id: this.props.resource[ 'episode-id' ], name: this.props.resource[ 'episode-name' ] }
  }

  renderParentNames = () => { // i.e. programme / series / episode
    const { theme } = this.props
    const videosPath = theme.localisation.video.path
    const programmePath = `/admin/${theme.localisation.programme.path}/${this.programme().id}`
    const seriesPath = `${theme.localisation.series.path}/${this.series().id}`
    const episodePath = `episodes/${this.episode().id}`
    const parentTypes = [
      {
        ...this.programme(),
        path: `${programmePath}/${videosPath}`
      },
      {
        ...this.series(),
        path: `${programmePath}/${seriesPath}/${videosPath}`
      },
      {
        ...this.episode(),
        path: `${programmePath}/${seriesPath}/${episodePath}/${videosPath}`
      }
    ].filter((parent) => parent.name)
    const lastIndex = parentTypes.length - 1
    return parentTypes.map((parent, i) => {
      if (i === lastIndex) {
        return (
          <NavLink to={parent.path} key={i}>
            {parent.name}
          </NavLink>
        )
      }
      return (
        <div key={i} >
          {parent.name}
        </div>
      )
    })
  }

  render() {
    return (
      <tr className={`with-action ${this.state.classes}`} {...this.props}>
        <td style={{'maxWidth': '220px'}}>
          {this.props.name}
        </td>
        <td>
          {this.renderParentNames()}
        </td>
        <td>
          {this.props.restricted &&
            <span class="count count--warning">Restricted</span>
          }
          {this.props.resource['public-video'] &&
            <span class="count count--success">Public</span>
          }
        </td>

        { this.props.videoProviders.wistia &&
          <td>
            {this.props.wistiaId}
          </td>
        }

        <td>
          {this.props.children}
        </td>

      </tr>
    )
  }
}

const enhance = compose(
  withTheme,
  withVideoProviders,
  withPrefix
)
export default enhance(VideoResource)

