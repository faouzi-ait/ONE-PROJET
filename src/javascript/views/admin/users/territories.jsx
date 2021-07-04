import React from 'react'

// Stores
import TerritoryStore from 'javascript/stores/territory'

// Actions
import TerritoryActions from 'javascript/actions/territory'

// Components
import CustomCheckbox from 'javascript/components/custom-checkbox'

export default class extends React.Component {
  state = {
    territories: []
  }

  setTerritories = () => {
    const territories = TerritoryStore.getResources()
    this.setState({
      territories: territories.map( territory => ({
        ...territory,
        selected: territory['users'].find(user => user.id === this.props.user.id)
      }))
    })
  }

  getTerritories() {
    TerritoryActions.getResources({
      include: 'users',
      fields: {
        territories: 'name,users',
        users: 'id'
      },
      sort: 'name',
      filter: this.state.search ? {
        search: this.state.search
      } : {}
    })
  }

  componentWillMount() {
    TerritoryStore.on('change', this.setTerritories)
  }

  componentDidMount() {
    this.getTerritories()
  }

  componentWillUnmount() {
    TerritoryStore.removeListener('change', this.setTerritories)
  }

  toggleTerritory = (territory) => () => {
    let users = territory['users']
    if(territory.selected){
      users.splice(users.findIndex(user => user.id === this.props.user.id), 1)
    } else {
      users.push(this.props.user)
    }

    TerritoryActions.updateResource({
      ...this.props.user,
      'id': territory.id,
      'users': users
    })
  }

  timer = false
  updateSearch = ({target}) => {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.setState({
        search: target.value
      }, this.getTerritories)
    }, 300)
  }

  render() {
    return (
      <form className="cms-form" onSubmit={this.savePermissions}>
        <div className="territories-list">
          <div className="container">
            <div className="cms-form__control">
              <input type="text" placeholder="Search for Territories" onChange={this.updateSearch} className="cms-form__input" />
            </div>
          </div>
          <ul className={"territories-list__list"}>
            {this.state.territories.map(territory => {
                return <li className="territories-list__item" key={territory.id}>
                  <CustomCheckbox
                    labeless={true}
                    checked={territory.selected}
                    id={territory.type + territory.id}
                    onChange={this.toggleTerritory(territory)} />
                  <span>{territory.name}</span>
                </li>
              }
            )}
          </ul>
        </div>
      </form>
    )
  }
}