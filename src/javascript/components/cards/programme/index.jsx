import React from 'react'

import withTheme from 'javascript/utils/theme/withTheme'
import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import allClientVariables from './variables'
import programmeQuery from 'javascript/utils/queries/programmes'

// Stores
import Store from 'javascript/stores/programmes'

// Actions
import Actions from 'javascript/actions/programmes'

// Components
import Card from 'javascript/components/programme-card'


class ProgrammeCard extends React.Component {
  state = {}

  componentWillMount() {
    Store.on('dataChange', this.setResource)
  }

  componentWillUnmount() {
    Store.removeListener('dataChange', this.setResource)
  }

  componentDidMount() {
    const defaultQuery = programmeQuery(this.props.theme)
    Actions.getDataResource(this.props.id, defaultQuery)
  }

  setResource = () => {
    this.setState({
      resource: Store.getDataResource(this.props.id)
    })
  }

  render() {
    if (!this.state.resource) {
      return false
    }
    return (
      <Card programme={this.state.resource} />
    )
  }
}

const enhance = compose(
  withTheme,
  withClientVariables('clientVariables', allClientVariables)
)

export default enhance(ProgrammeCard)