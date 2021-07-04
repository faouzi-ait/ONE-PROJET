import React, {Component} from 'react'

// Actions
import MetaActions from 'javascript/actions/metadata'
import PagesResourceActions from 'javascript/actions/pages'
import CollectionsResourceActions from 'javascript/actions/collections'

// Stores
import MetaStore from 'javascript/stores/metadata'
import PagesResourceStore from 'javascript/stores/pages'
import CollectionsResourceStore from 'javascript/stores/collections'

// Components
import MetaDataForm from 'javascript/components/admin/metadata-form'

export default class extends Component {
  constructor(props) {
    super(props)
    this.type = props.resource.type
    this.state = {}
  }

  componentWillMount(){
    PagesResourceStore.on('dataChange', this.setResourceToState)
    CollectionsResourceStore.on('dataChange', this.setResourceToState)
    MetaStore.on('save', this.props.closeEvent)
  }

  componentWillUnmount(){
    PagesResourceStore.removeListener('dataChange', this.setResourceToState)
    CollectionsResourceStore.removeListener('dataChange', this.setResourceToState)
    MetaStore.removeListener('save', this.props.closeEvent)
  }

  setResourceToState = () => {
    const store = this.type === 'pages' ? PagesResourceStore : CollectionsResourceStore
    const resource = store.getDataResource()
    this.setState({
      resource,
      meta: resource['meta-datum'] ? resource['meta-datum'] : {}
    })
  }

  componentDidMount(){
    const {resource} = this.props
    const actions = this.type === 'pages' ? PagesResourceActions : CollectionsResourceActions

    actions.getDataResource(resource.id, {
      include: 'meta-datum',
      fields: {
        'pages': 'title,meta-datum',
        'meta-datums': 'title,keywords,description'
      }
    })
  }

  submit = (meta) => {
    const { resource } = this.state
    const update = { ...meta }
    update[this.type.slice(0, -1)] = {
      id: resource.id
    }

    if (resource['meta-datum']) {
      MetaActions.updateResource(update)
      return false
    }

    MetaActions.createResource(update)
  }

  render() {
    const {meta = {}, resource = {}} = this.state

    return (
      <MetaDataForm
        intitialTitle={resource.title}
        resource={meta}
        onSubmit={this.submit}
      />
    )
  }
}