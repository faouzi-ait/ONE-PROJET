import React from 'react'
import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'

import 'stylesheets/core/components/notification'

import Toggle from 'javascript/components/toggle'

class Notification extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      count: this.props.count
    }
  }

  componentWillMount() {
    this.updateVisibility(true)
    setTimeout(() => {
      this.updateVisibility(false)
    }, 7000)
  }

  componentWillUnmount() {
    this.updateVisibility(false)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.count !== this.state.count) {
      this.updateVisibility(true)
      setTimeout(() => {
        this.updateVisibility(false)
      }, 7000)
    }
  }

  updateVisibility = (visible) => {
    this.setState({
      visible
    })
  }

  render() {
    if(!this.state.visible){
      return false
    }

    return (
      <div className={['notification', this.props.complete && 'complete', ...this.props.classes || ''].join(` notification--`)}>
        <div className="container">
          <div className="notification__inner">
            {!this.props.display &&
              <Toggle classes={[ this.props.loading && 'loading', this.props.complete && 'active']} />
            }
            <p className="notification__copy">{this.props.children}</p>
          </div>
        </div>
      </div>
    )
  }
}

export default Notification

export const notificationStyles = makeLiteStyles(
  styles => css`
    .notification {
      color: ${styles.typography.bodyColor};
      background-color: ${styles.colors.brand};
    }
  `,
)
