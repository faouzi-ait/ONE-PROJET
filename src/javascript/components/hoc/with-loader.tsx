import React from 'react'

import NotFoundComponent from 'javascript/components/not-found'

export type PageReceivedErrorType = (error: any) => void
export type PageIsLoadingType = (loadResults: boolean | any[]) => boolean
export type WithLoaderType = {
  pageReceivedError: PageReceivedErrorType,
  pageIsLoading: PageIsLoadingType,
}

const withLoader = (WrappedComponent) => {
  class WithLoader extends React.Component<any, {
    errored: boolean
    isLoading: boolean
  }> {
    isMounted: boolean

    constructor(props) {
      super(props)
      this.state = {
        errored: false,
        isLoading: true,
      }
      this.isMounted = false
    }

    componentDidMount() {
      this.isMounted = true
    }

    componentWillUnmount() {
      this.isMounted = false
    }


    pageReceivedError = (error) => {
      if (!this.isMounted) return
      if (error) {
        console.error('withLoader: pageRecievedError', error)
      }
      this.setState({
        errored: true
      })
    }

    pageIsLoading = (loadResults = null) => {
      if (!this.isMounted) return
      if (loadResults === null) {
        return this.state.isLoading
      }
      if (!Array.isArray(loadResults)) {
        loadResults = [loadResults]
      }
      const finishedLoading = loadResults.reduce((acc, result) => {
        if (acc) {
          acc = !Boolean(result)
        }
        return acc
      }, true)
      if (this.state.isLoading === finishedLoading) {
        this.setState({
          isLoading: !finishedLoading
        })
      }
      return finishedLoading
    }

    renderWrappedComponent = (pageState) => (
      <WrappedComponent {...this.props}
        pageState={pageState}
        pageReceivedError={this.pageReceivedError}
        pageIsLoading={this.pageIsLoading}
      />
    )

    render() {
      const pageState = {
        errored: this.state.errored,
        isLoading: this.state.isLoading
      }

      if (this.state.errored) {
        return (
          <NotFoundComponent />
        )
      }

      const display = pageState.isLoading ? { display: 'none' } : {}

      return (
        <>
          { pageState.isLoading && (
              <main>
                <div className="container">
                  <div className="loader" data-testid="loader" />
                </div>
              </main>
            )
          }
          <div className='main' style={display} >
            <WrappedComponent {...this.props}
              pageState={pageState}
              pageReceivedError={this.pageReceivedError}
              pageIsLoading={this.pageIsLoading}
            />
          </div>
        </>
      )
    }
  }
  //@ts-ignore
  WithLoader.displayName = `WithLoader(${getDisplayName(WrappedComponent)})`
  return WithLoader
}

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withLoader
