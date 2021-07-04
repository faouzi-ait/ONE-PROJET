// React
import React from 'react'

// Store
import ListsStore from 'javascript/stores/lists'

// Actions
import ResourceActions from 'javascript/actions/lists'

// Components
import FormControl from 'javascript/components/form-control'
import CustomCheckbox from 'javascript/components/custom-checkbox'

// Services
import { isAdmin } from 'javascript/services/user-permissions'

import withTheme from 'javascript/utils/theme/withTheme'

class ListsEditForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ...props.list,
      user: props.user,
      loading: false,
      editListValidate: false
    }
  }

  componentWillMount(){
    ListsStore.on('change', this.props.closeEvent)
  }

  componentWillUnmount(){
    ListsStore.removeListener('change', this.props.closeEvent)
  }

  updateResource = ({target}) => {
    this.setState(() => ({
      [target.name]: target.value
    }))
  }

  updaetCheckbox = ({target}) => {
    this.setState(() => ({
      [target.name]: !this.state[target.name]
    }))
  }

  onSubmit = (e) => {
    const { id, name, global, internal } = this.state
    e.preventDefault()
    this.setState({
      loading: name.length > 0,
      editListValidate: name.length <= 0
    })
    {name.length > 0 &&
      ResourceActions.updateResource({
        id, name, global, internal
      })
    }
  }

  render() {
    const { theme, list } = this.props
    const classes = ['button', 'filled', this.state.loading && 'loading'].join(' button--')
    return (
      <form class="form form--skinny" onSubmit={ this.onSubmit }>
        <FormControl label={ `${theme.localisation.list.upper} Name` }>
          <input type="text" value={this.state.name} name="name" className="form__input" onChange={this.updateResource} />
        </FormControl>

        { isAdmin(this.state.user) &&
          <FormControl>
            <CustomCheckbox toggle={false} id="global" checked={this.state.global} name="global" label={ `${theme.localisation.list.upper} is Global` } onChange={this.updaetCheckbox} />
          </FormControl>
        }

        {this.state.global &&
          <FormControl>
            <CustomCheckbox toggle={false} id="internal" checked={this.state.internal} name="internal" label={ `Internal users only` } onChange={this.updaetCheckbox} />
          </FormControl>
        }

        <div class="form__control form__control--actions">
          <button type="submit" className={ classes }>Update {theme.localisation.list.upper}</button>
        </div>

        {this.state.editListValidate && (
          <span className="form__error" >Please enter a name</span>
        )}
      </form>
    )
  }
}

export default withTheme(ListsEditForm)