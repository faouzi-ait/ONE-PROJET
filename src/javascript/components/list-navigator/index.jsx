import React from 'react'

import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import Toggle from 'javascript/components/toggle'
import Select from 'react-select'
import 'stylesheets/core/components/list-navigator'
import 'stylesheets/core/components/tabs'

export class ListNavigator extends React.Component {
  render() {
    return (
       <div className="list-navigator">
         { this.props.children }
       </div>
    )
  }
}

export class ListNavigatorColumn extends React.Component {
  render() {
    const { title, items, onClick, selected, onSearch, onTab, placeholder, value, action, display, loading, hideSearch, onFilter, filterLabel, filterOptions, selectedFilter, showToggle, multiSelected, tabs } = this.props
    const nameIdentifier = this.props.nameIdentifier || 'name'
    const name2Identifier = this.props.name2Identifier
    const classes = ['list-navigator__column', ...this.props.modifiers].join(' list-navigator__column--')
    const showSearch = onSearch && !hideSearch
    let isSelected = false
    const showFilter = onFilter && !hideSearch
    return (
      <div className={ classes }>
        <h3 className="list-navigator__title">{ title }</h3>
        { showSearch && tabs &&
          <div className="list-navigator__tabs tabs">
            { tabs.map((item, key) => {
              return (
                <Button key={key} type="button" className={ ['tabs__item', item == this.props.activeTab && 'active'].join(' tabs__item--') } onClick={ onTab }>{ item.charAt(0).toUpperCase() + item.slice(1) }</Button>
              )
            })}
          </div>
        }
        { showSearch &&
          <div className="list-navigator__search">
            <input type="text" placeholder={ placeholder || 'Search...'} value={ value } onChange={ onSearch } className="list-navigator__search-input form__input" />
          </div>
        }
        { showFilter &&
          <div className="list-navigator__search">
            <Select options={ filterOptions } labelKey="name" valueKey="id" onChange={ onFilter } value={ selectedFilter && selectedFilter.id } placeholder={ filterLabel } />
          </div>
        }
        <div className="list-navigator__scroller">
          { items && items.constructor === Array && items.length && display && !loading ? (
              <ul className="list-navigator__list">
                { items.map((item, i) => {
                  let classes = 'list-navigator__item'
                  if ((selected && item.id == selected.id) || (multiSelected && multiSelected.filter(selected => selected.id === item.id).length > 0)) {
                    isSelected = true
                    classes += ' list-navigator__item--is-active'
                  }
                  else {
                    isSelected = false
                  }
                  if (showToggle) {
                    classes += ' list-navigator__item--centered'
                  }
                  return (
                    <li key={ i } className={ classes } onClick={() => { onClick(item) }}>
                      { showToggle &&
                        <Toggle key={ i } classes={ isSelected && ['active'] } />
                      }
                      { `${item[nameIdentifier]}` }
                      { name2Identifier &&
                          <span>&nbsp;{item[name2Identifier]}</span>
                      }
                      <div style={{ minWidth: '8px' }}>
                        <Icon id="i-right-arrow" classes="list-navigator__icon" />
                      </div>

                    </li>
                  )
                })}
              </ul>
            ) : null
          }
          { this.props.children && !loading &&
            <ul className="list-navigator__list">
              { this.props.children }
            </ul>
          }
          { loading &&
            <div className="loader"></div>
          }
        </div>
        { action && !loading &&
          <div className="list-navigator__actions">
            <Button className="list-navigator__action button button--reversed" onClick={ action.onClick }>{ action.name }</Button>
          </div>
        }
      </div>
    )
  }
}