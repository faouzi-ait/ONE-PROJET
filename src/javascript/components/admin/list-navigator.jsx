import React from 'react'
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import Toggle from 'javascript/components/toggle'
import Select from 'react-select'
import 'stylesheets/admin/components/cms-list-navigator'
import usePrefix from 'javascript/utils/hooks/use-prefix'

export const ListNavigator = (props) => {
  return (
      <div className="cms-list-navigator">
        { props.children }
      </div>
  )
}

export const ListNavigatorColumn = (props) => {
  const {
    title, items, onClick, selected, onSearch, onTab, placeholder,
    value, action, display, loading, hideSearch, onFilter, filterLabel,
    filterOptions, selectedFilter, showToggle, multiSelected, tabs,
    name2Identifier, showCompany
  } = props

  const { prefix } = usePrefix()
  const nameIdentifier = props.nameIdentifier || 'name'
  const showSearch = onSearch && !hideSearch
  let isSelected = false
  const showFilter = onFilter && !hideSearch

  const classes = ['cms-list-navigator__column', ...props.modifiers].join(' cms-list-navigator__column--')
  let tabClasses = 'cms-list-navigator__tabs cms-tabs'
  let buttonClasses = 'cms-tabs__item'
  return (
    <div className={ classes }>
      <h3 className="cms-list-navigator__title">{ title }</h3>
      { showSearch && tabs &&
        <div className={tabClasses}>
          { tabs.map((item, key) => {
            return (
              <Button key={key} type="button" className={[buttonClasses, item == props.activeTab && 'active'].join(` ${buttonClasses}--`) } onClick={ onTab }>
                { item.charAt(0).toUpperCase() + item.slice(1) }
              </Button>
            )
          })}
        </div>
      }
      { showSearch &&
        <div className="cms-list-navigator__search">
          <input type="text"
            placeholder={ placeholder || 'Search...'}
            value={ value } onChange={ onSearch }
            className={`cms-list-navigator__search-input ${prefix}form__input`}
          />
        </div>
      }
      { showFilter &&
        <div className="cms-list-navigator__search">
          <Select options={ filterOptions } labelKey="name"
            valueKey="id" onChange={ onFilter }
            value={ selectedFilter && selectedFilter.id } placeholder={ filterLabel }
          />
        </div>
      }
      <div className="cms-list-navigator__scroller">
        { items && items.constructor === Array && display && !loading &&
          <ul className="cms-list-navigator__list">
            { items.map((item, i) => {
              let classes = 'cms-list-navigator__item'
              if ((selected && item.id == selected.id) ||
                  (multiSelected && multiSelected.filter(selected => selected.id === item.id).length > 0)) {
                isSelected = true
                classes += ' cms-list-navigator__item--is-active'
              }
              else {
                isSelected = false
              }
              if (showToggle) {
                classes += ' cms-ist-navigator__item--centered'
              }
              return (
                <li key={ i } className={ classes } onClick={() => { onClick(item) }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    { showToggle &&
                      <Toggle key={ i } classes={ isSelected && ['active'] } />
                    }
                    <span>
                      <span>{ item[nameIdentifier] }</span>
                      { name2Identifier &&
                        <span>&nbsp;{item[name2Identifier]}</span>
                      }
                      { showCompany && item.company &&
                        <span> - {item?.company?.name}</span>
                      }
                    </span>
                  </div>
                  <div style={{ minWidth: '8px' }}>
                    <Icon width="8" height="13" id="i-right-arrow" classes="cms-list-navigator__icon" />
                  </div>
                </li>
              )
            })}
          </ul>
        }
        { props.children && !loading &&
          <ul className="cms-list-navigator__list">
            { props.children }
          </ul>
        }
        { loading &&
          <div className="loader"></div>
        }
      </div>
      { action && !loading &&
        <div className="cms-list-navigator__actions">
          <Button className="cms-list-navigator__action button button--reversed" onClick={ action.onClick }>
            { action.name }
          </Button>
        </div>
      }
    </div>
  )
}