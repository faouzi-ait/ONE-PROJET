import React from 'react'
import styled from 'styled-components'
import { RouteComponentProps, withRouter } from 'react-router'

import { notifyBugsnag } from 'javascript/utils/helper-functions/notify-bugsnag'
import Button from 'javascript/components/button'
import compose from 'javascript/utils/compose'
import withPrefix from 'javascript/components/hoc/with-prefix'


interface Props extends RouteComponentProps<{}, any, { forceErrorReset: boolean } > {
  user?: any
  prefix: string
  reset: {
    text: string
    route: string
  }
}

interface State {
  hasErrored: boolean
  resetting: boolean
}

class ErrorBoundary extends React.Component<Props, State> {
  state = {
    hasErrored: false,
    resetting: false
  }

  componentDidCatch(e) {
    if (e.name === 'ChunkLoadError' || e.message.includes('chunk 0 failed')) {
      notifyBugsnag(new Error('ChunkLoadError - HANDLED WITH PAGE REFRESH - WIP'), this.props.user)
      return window.location.reload()
    }
    if (!this.state.hasErrored) {
      this.setState({
        hasErrored: true,
      })
      notifyBugsnag(e, this.props.user)
    }
    const brandLogo = document.getElementsByClassName(`${this.props.prefix}brand`)[0]
    brandLogo?.addEventListener('click', this.redirect)
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasErrored && (prevProps.location.pathname !== this.props.location.pathname
      || this.props.location.state?.forceErrorReset)) {
      this.resetError()
    }
  }

  resetError = () => {
    this.setState({
      hasErrored: false
    })
    const brandLogo = document.getElementsByClassName(`${this.props.prefix}brand`)[0]
    brandLogo.removeEventListener('click', this.redirect)
  }

  redirect = () => {
    this.props.history.push({ pathname: this.props.reset.route, state: { forceErrorReset: true }})
  }

  render() {
    if (this.state.hasErrored) {
      return (
        <main>
          <div className="four-oh-four">
            <div className="container">
              <h1 className="heading--one">Oh no!</h1>
              <p>An unknown error has occurred</p>
              <p className="small">Our development team has been informed of the issue and are working to resolve it as soon as possible</p>
              <Button type="button" className="button button--filled" onClick={this.redirect} >
                {this.props.reset.text}
              </Button>
            </div>
          </div>
          <HiddenErrorMessage>componentDidCatch_error_boundary</HiddenErrorMessage>
        </main>
      )
    }
    return <>{this.props.children}</>
  }
}

const enhance = compose(
  withRouter,
  withPrefix
)

export default enhance(ErrorBoundary)

// Used by 24x7 site monitoring - to verify that page load has not errored
const HiddenErrorMessage = styled.div`
  position: absolute;
  width: 0px;
  height: 0px;
  background-color: transparent;
  color: transparent;
`
