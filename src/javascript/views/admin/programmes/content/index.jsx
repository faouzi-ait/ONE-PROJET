import React from 'react'

import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import withUser from 'javascript/components/hoc/with-user'
import withPageHelper from 'javascript/components/hoc/with-page-helper'

import allClientVariables from 'javascript/views/admin/programmes/content/variables'

// Stores
import ProgrammesStore from 'javascript/stores/programmes'

// Actions
import ProgrammesActions from 'javascript/actions/programmes'

// Components
import ContentBlocks from 'javascript/views/admin/pages/content-blocks'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'

class ProgrammeContentBlocks extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      resource: null,
      pages: null,
    }
  }

  componentWillMount() {
    ProgrammesStore.on('change', this.setResource)
    ProgrammesStore.on('save', this.getResource)
  }

  componentWillUnmount() {
    ProgrammesStore.removeListener('change', this.setResource)
    ProgrammesStore.removeListener('save', this.getResource)
  }

  componentDidMount() {
    this.getResource()
  }

  getResource = () => {

    ProgrammesActions.getResource(this.props.match.params.programme, {
      include: 'page-images,custom-attributes.custom-attribute-type',
      fields: {
        'programmes': 'title,content-blocks,page-images,custom-attributes',
        'page-images': 'file',
        'custom-attributes': 'value,custom-attribute-type,position'
      }
    })
  }

  setResource = () => {
    const resource = ProgrammesStore.getResource()
    this.setState({
      resource,
    }, () => {
      this.props.pageIsLoading(false)
      this.props.modalState.hideModal()
    })
  }

  updateResource = (resource) => {
    const attributes = this.props.programmeContentBlocksCV.saveAttributes(this.state)
    ProgrammesActions.updateResource(resource, attributes)
  }

  render() {
    return (
      <main>
        <ContentBlocks {...this.state}
          blockLocation={'programme'}
          updateResource={this.updateResource}
        />
      </main>
    )
  }
}

const enhance = compose(
  withPageHelper,
  withClientVariables('programmeContentBlocksCV', allClientVariables)
)

export default enhance(ProgrammeContentBlocks)