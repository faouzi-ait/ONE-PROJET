import React from 'react'
import Meta from 'react-document-meta'
import useTheme from 'javascript/utils/theme/useTheme'

const BearWith = () => {
  const  { localisation } = useTheme()
  return (
    <Meta
      title={`${localisation.client} :: Maintenance`}
      meta={{
        description: 'Undergoing critical maintenance.'
      }}>
      <main>
        <div className="bear-with">
          <div className="container">
            <h1 className="heading--one">Bear with us!</h1>
            <p>Sorry, we're currently down for scheduled maintenance. We will be back up and running shortly.</p>
          </div>
        </div>
      </main>
    </Meta>
  )
}

export default BearWith
