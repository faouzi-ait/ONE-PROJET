// React
import React from 'react'

// Components
import Button from 'javascript/components/button'
import Div from 'javascript/components/div'
import Form from 'javascript/components/form'
import Icon from 'javascript/components/icon'

// Store
import UserStore from 'javascript/stores/users'
// Actions
import UserActions from 'javascript/actions/users'

export default class UsersDeleteFrom extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
  }
  componentWillMount() {
    UserStore.on('delete', this.finishedDeleting)
  }

  componentWillUnmount() {
    UserStore.removeListener('delete', this.finishedDeleting)
  }

  finishedDeleting = () => {
    if (this.props.finishedDeleting) {
      this.props.finishedDeleting()
    }
  }

  deleteResource = (resource) => {
    this.setState({ loading: true })
    UserActions.deleteResource(resource)
  }


  renderDeleteForm = () => {
    const { deleteResource, closeEvent } = this.props
    let buttonClasses = this.state.loading ? 'button button--filled button--reversed button--loading' : 'button button--filled button--reversed'
    if(deleteResource) {
      return (
        <div>
          <Div className="form__control" classesToPrefix={['form']}>
            <p>Are you sure you want to delete the user <strong>{ deleteResource['first-name'] + ' ' + deleteResource['last-name'] }</strong>?</p>
          </Div>
          <Div class="form__control form__control--actions" classesToPrefix={['form']}>
            <Button type="button" className="button button--reversed" onClick={ closeEvent }>Cancel</Button>
            <Button type="button" className={ buttonClasses } onClick={() => { this.deleteResource(deleteResource) } }>Delete</Button>
          </Div>
        </div>
      )
    }
  }

  render() {
    return (
      <Form className="form" onSubmit={ this.deleteResource }>
        { this.renderDeleteForm() }
      </Form>
    )
  }
}