import React from 'react'

import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'
import StylePrefixConsumer, { getPrefix } from 'javascript/utils/style-prefix/style-prefix-consumer'


class FormHelper extends React.Component {

  componentWillMount() {
    this.store.on('error', this.retrieveErrors)
  }

  componentWillUnmount() {
    this.store.removeListener('error', this.retrieveErrors)
  }

  retrieveErrors = () => {
    this.setState({
      apiErrors: this.store.getErrors(),
      isLoading: false
    })
  }

  renderErrors = () => {
    if(this.state.apiErrors) {
      return (
        <StylePrefixConsumer>
          {(entrypoint) => {
            const prefix = getPrefix(entrypoint)
            return (
              <ul className={`${prefix}form__errors`}>
                { Object.keys(this.state.apiErrors).map((key, i) => {
                  const error = this.state.apiErrors[key]
                  return (
                    <li key={ i }>{ key.charAt(0).toUpperCase() + key.slice(1) } { error }</li>
                  )
                }) }
              </ul>
            )
          }}
        </StylePrefixConsumer>
      )
    }
  }

  createResource = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true })
    this.actions.createResource(this.state.resource)
  }

  updateResource = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true })
    this.actions.updateResource(this.state.resource)
  }

  deleteResource = (e) => {
    e.preventDefault()
    this.setState({ isLoading: true })
    this.actions.deleteResource(this.state.resource)
  }

  handleInputChange = (e) => {
    const update = this.state.resource
    update[e.target.name] = e.target.value
    this.setState({
      resource: update
    })
  }

  submitAction = (e) => {
    e.preventDefault()
    this.props.submitAction()
  }

  renderForm = () => {
    const { method } = this.props
    const buttonClasses = ['button', 'filled', this.state.isLoading && 'loading'].join(' button--')
    return (
      <StylePrefixConsumer>
        {(entrypoint) => {
          const prefix = getPrefix(entrypoint)
          return (
            <div>
              <FormControl type="text" name="name" label="Name" value={ this.state.resource.name } required onChange={ this.handleInputChange } />
              { this.renderErrors() }
              <div className={`${prefix}form__control ${prefix}form__control--actions`}>
                <Button type="submit" className={ buttonClasses }>Save { this.resourceName }</Button>
              </div>
            </div>
          )
        }}
      </StylePrefixConsumer>
    )
  }

  renderDeleteForm = () => {
    const { resource } = this.state
    const buttonClasses = ['button', 'filled', 'reversed', this.state.isLoading && 'loading'].join(' button--')
    return (
      <StylePrefixConsumer>
        {(entrypoint) => {
          const prefix = getPrefix(entrypoint)
          return (
            <div>
              <div className={`${prefix}form__control`}>
                <p>Are you sure you want to delete the { this.resourceName } <strong>{ resource.name }</strong>?</p>
              </div>
              <div class={`${prefix}form__control ${prefix}form__control--actions`}>
                <Button type="button" className="button button--reversed" onClick={ this.props.closeEvent }>Cancel</Button>
                <Button type="submit" className={ buttonClasses }>Delete</Button>
              </div>
            </div>
          )
        }}
      </StylePrefixConsumer>
    )
  }

  render() {
    const { method, submitAction } = this.props
    return (
      <StylePrefixConsumer>
        {(entrypoint) => {
          const prefix = getPrefix(entrypoint)
          return (
            <form className={`${prefix}form`} onSubmit={ submitAction ? this.submitAction :  this[method] }>
              <div>
                { method === 'deleteResource' ? (
                  this.renderDeleteForm()
                ) : (
                  this.renderForm()
                )}
              </div>
            </form>
          )
        }}
      </StylePrefixConsumer>
    )
  }

}

export default FormHelper