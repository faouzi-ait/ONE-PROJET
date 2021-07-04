import React from 'react'

import compose from 'javascript/utils/compose'
import withPageHelper from 'javascript/components/hoc/with-page-helper'

// Stores
import PageStore from 'javascript/stores/pages'

// Actions
import PageActions from 'javascript/actions/pages'

// Services
import { isAdmin } from 'javascript/services/user-permissions'

// Components
import ContentBlocks from 'javascript/views/admin/pages/content-blocks'

class EditContentBlocks extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      resource: null,
      pages: null,
    }
  }

  componentWillMount() {
    PageStore.unsetResources()
    PageStore.on('change', this.getResource)
    PageStore.on('refreshStore', this.refreshStore)
  }

  componentWillUnmount() {
    PageStore.removeListener('change', this.getResource)
    PageStore.removeListener('refreshStore', this.refreshStore)
  }

  componentDidMount() {
    PageActions.getResources({
      fields: {
        pages: 'title,introduction,thumbnail'
      },
      page: { size: 200 }
    })
    this.refreshStore()
  }

  refreshStore = () => {
    PageActions.getResource(this.props.match.params.id, {
      include: 'page-images',
      fields: {
        pages: 'content-blocks,page-images,title,slug,page-type',
        'page-images': 'file'
      }
    })
  }

  getResource = () => {
    const resource = PageStore.getResource()
    this.setState({
      resource: resource,
      pages: PageStore.getResources(),
    }, () => {
      if (this.state.resource && this.state.pages) {
        this.props.pageIsLoading(false)
        this.props.modalState.hideModal()
      }
    })
  }

  updateResource = (updatedResource) => {
    PageActions.updateResource(updatedResource)
  }

  render() {
    const isCataloguePage = this.state.resource?.['page-type'] === 'catalogue'
    return (
      <main>
        <ContentBlocks {...this.state}
          blockLocation={'page'}
          updateResource={this.updateResource}
          includeContentPlaceholder={isCataloguePage}
        />
      </main>
    )
  }
}

const enhance = compose(
  withPageHelper,
)

export default enhance(EditContentBlocks)