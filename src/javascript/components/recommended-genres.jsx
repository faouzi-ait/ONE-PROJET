import React from 'react'
import pluralize from 'pluralize'

// Components
import Card from 'javascript/components/card'
import withTheme from 'javascript/utils/theme/withTheme'

class RecommendedGenres extends React.Component {

  constructor(props) {
    super(props)
  }

  renderGenres = () => {
    const { theme } = this.props
    if (!this.props.topGenres) return
    const genreCards = this.props.topGenres.map((genre) => {
      const url = `/${theme.variables.SystemPages.catalogue.path}?filter[genre]=${genre.id}`
      return (
        <Card key={genre.id} title={genre.name} size={'medium'} image={{ src: genre.image.url }} url={url} />
      )
    })
    if (!genreCards.length) {
      return (
        <div className="grid">
          {`There are no ${pluralize(theme.localisation.genre.lower)} to display`}
        </div>
      )
    }
    return (
      <div className="grid grid--three">
        {genreCards}
      </div>
    )
  }

  render() {
    const { theme, title } = this.props
    return (
      <>
        <h2 class="content-block__heading">{title}</h2>
        {this.renderGenres()}
      </>
    )
  }

}

export default withTheme(RecommendedGenres)
