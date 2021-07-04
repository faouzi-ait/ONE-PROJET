import React from 'react'
import PropTypes from 'prop-types'

import NotFoundComponent from 'javascript/components/not-found'

function PageLoader({ errored, loaded, children }) {
  if (errored) {
    return <NotFoundComponent />
  }

  if (!loaded) {
    return (
      <main>
        <div className="container">
          <div className="loader" data-testid="loader"/>
        </div>
      </main>
    )
  }
  return children || null
}

export default PageLoader
