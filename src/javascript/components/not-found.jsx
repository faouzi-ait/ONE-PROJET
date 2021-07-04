import React from 'react'
import Meta from 'react-document-meta'
import NavLink from 'javascript/components/nav-link'
import withTheme from 'javascript/utils/theme/withTheme'

class NotFoundComponent extends React.Component {
  render() {
    return (
      <Meta
        title={`${this.props.theme.localisation.client} :: 404`}
        meta={{
          description: '404 Page Not Found'
        }}>
        <main>
          <div className="four-oh-four">
            <div className="container">
              <h1 className="heading--one">Oh no!</h1>
              <p>We can't find the page you are looking for</p>
              <NavLink to="/" className="button button--filled">Homepage</NavLink>
            </div>
          </div>
        </main>
      </Meta>
    )
  }
}

export default withTheme(NotFoundComponent)