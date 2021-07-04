import React from 'react'
import pluralize from 'pluralize'

import ListsActions from 'javascript/actions/lists'

import withTheme from 'javascript/utils/theme/withTheme'

class DeleteListForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resources: props.resources.filter((resource) => {
        return resource.selected
      }),
      loading: false
    }
  }

  deleteResource = () => {
    this.setState({
      loading: true
    })

    this.state.resources.map((resource) => {
      ListsActions.deleteResource(resource)
    })
  }

  render() {
    const classes = ['button', 'filled', 'reversed', this.state.loading && 'loading'].join(' button--')
    const { theme } = this.props
    return (
      <form className="form" onSubmit={ this.deleteResource }>
        <div>
          <div className="form__control">
            <p>Are you sure you want to delete { this.state.resources.length === 1 ? `this ${theme.localisation.list.lower}` : `these ${pluralize(theme.localisation.list.lower)}` }?</p>
          </div>
          <div class="form__control form__control--actions">
            <button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</button>
            <button type="button" className={ classes } onClick={ this.deleteResource }>Delete</button>
          </div>
        </div>
      </form>
    )
  }
}

export default withTheme(DeleteListForm)