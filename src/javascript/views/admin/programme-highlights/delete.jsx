import React from 'react'

import Button from 'javascript/components/button'
import ResourceStore from 'javascript/stores/programme-highlights'
import ResourceActions from 'javascript/actions/programme-highlights'
import withTheme from 'javascript/utils/theme/withTheme'

class ProgrammeHighlightsDelete extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }

  componentWillMount() {
    ResourceStore.on('change', this.props.closeEvent)
  }

  componentWillUnmount() {
    ResourceStore.removeListener('change', this.props.closeEvent)
  }

  deleteResource = () => {
    this.setState({
      loading: true
    })
    ResourceActions.deleteResource(this.props.highlight)
  }

  render(){
    const {highlight, closeEvent, theme} = this.props
    let buttonClasses = ['button', 'filled', 'reversed', this.state.loading && 'loading'].join(' button--')

    return (

      <form className="cms-form" onSubmit={ this.deleteResource }>
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete the {theme.localisation.programme.lower} <strong>{ highlight.programme.title }</strong> from your Highlights?</p>
          </div>
          <div class="cms-form__control cms-form__control--actions">
            <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
            <Button type="button" className={ buttonClasses } onClick={ this.deleteResource }>Delete</Button>
          </div>
        </div>
      </form>

    )
  }
}

export default withTheme(ProgrammeHighlightsDelete)