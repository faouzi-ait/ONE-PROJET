import React, {Component} from 'react'

// Actions
import MetaActions from 'javascript/actions/metadata'
import ResourceActions from 'javascript/actions/programmes'

// Stores
import MetaStore from 'javascript/stores/metadata'
import ResourceStore from 'javascript/stores/programmes'

// Components
import Button from 'javascript/components/button'
import FormControl from 'javascript/components/form-control'

export default class extends Component {
  state = {}

  componentWillMount(){
    ResourceStore.on('dataChange', this.setResourceToState)
    MetaStore.on('save', this.props.closeEvent)
  }

  componentWillUnmount(){
    ResourceStore.removeListener('dataChange', this.setResourceToState)
    MetaStore.removeListener('save', this.props.closeEvent)
  }

  setResourceToState = () => {
    const resource = ResourceStore.getDataResource()
    this.setState({
      resource,
      meta: resource['meta-datum'] ? resource['meta-datum'] : {}
    })
  }

  componentDidMount(){
    const {resource} = this.props

    ResourceActions.getDataResource(resource.id, {
      include: 'meta-datum',
      fields: {
        'programmes': 'title,meta-datum',
        'meta-datums': 'title,keywords,description'
      }
    })
  }

  submit = (e) => {
    const {meta = {}, resource} = this.state
    const update = {
      ...meta,
      programme: {
        id: resource.id
      }
    }

    e.preventDefault()

    if(resource['meta-datum']){
      MetaActions.updateResource(update)
      return false
    }

    MetaActions.createResource(update)
  }

  updateMeta = (key) => (e) => {
    const {meta} = this.state

    this.setState({
      meta: {
        ...meta,
        [key]: e.target.value
      }
    })
  }

  render(){
    const {meta = {}, resource = {}} = this.state

    return (
      <form className="cms-form" onSubmit={this.submit}>
        <FormControl
          type="text"
          label="Title"
          name="title"
          placeholder={resource.title}
          value={meta.title}
          onChange={this.updateMeta('title')} />

        <FormControl
          type="text"
          label="Keywords"
          value={meta.keywords}
          onChange={this.updateMeta('keywords')}
          name="keywords" />

        <FormControl
          type="text"
          label="Description"
          value={meta.description}
          onChange={this.updateMeta('description')}
          name="description" />

        <div className="cms-form__control cms-form__control--actions">
          <Button type="submit" className="button button--filled">Save</Button>
        </div>
      </form>
    )
  }
}