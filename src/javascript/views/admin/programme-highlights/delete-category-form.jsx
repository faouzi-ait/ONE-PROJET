// React
import React from 'react'

import ResourceStore from 'javascript/stores/programme-highlight-categories'
import ResourceActions from 'javascript/actions/programme-highlight-categories'

import Button from 'javascript/components/button'

export default class ProgrammeHighlightCategoriesDelete extends React.Component {
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
    ResourceActions.deleteResource(this.props.category)
  }

  render(){
    const {category, closeEvent} = this.props
    let buttonClasses = ['button', 'filled', 'reversed', this.state.loading && 'loading'].join(' button--')

    return (

      <form className="cms-form" onSubmit={ this.deleteResource }>
        <div>
          <div className="cms-form__control">
            <p>Are you sure you want to delete <strong>"{ category.name }"</strong>?</p>
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