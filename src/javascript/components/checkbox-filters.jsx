import React from 'react'
import Button from 'javascript/components/button'
import Checkbox from 'javascript/components/custom-checkbox'
import Icon from 'javascript/components/icon'
import ClientProps from 'javascript/utils/client-switch/components/client-props'

import compose from 'javascript/utils/compose'
import withPrefix from './hoc/with-prefix'

import 'stylesheets/core/components/checkbox-filters'
import 'stylesheets/admin/components/cms-checkbox-filters'

class CheckboxFilters extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isOpen: !this.props.multi || this.props.openByDefault
    }
  }

  render() {
    const { prefix } = this.props
    const toggleClasses = [`${prefix}checkbox-filters__toggle`, this.state.isOpen && '--is-active'].join(` ${prefix}checkbox-filters__toggle`)
    const contentClasses = [`${prefix}checkbox-filters__content`, this.props.checkParent && '--is-disabled'].join(` ${prefix}checkbox-filters__content`)
    return (
      <ClientProps
        clientProps={{
          showSubGenres: {
            'default': true,
            'all3': false
          },
        }}
        renderProp={(clientProps) => (
          <div className={clientProps.showSubGenres ? `${prefix}checkbox-filters` : ''}>
            <div className={clientProps.showSubGenres ? `${prefix}checkbox-filters__header` : ''}>
              <Checkbox
                label={ this.props.parent.name }
                id={ this.props.parent.name + this.props.parent.id }
                value={ this.props.parent.id }
                onChange={ this.props.onChange }
                checked={ this.props.checkParent }
              />
              { clientProps.showSubGenres && this.props.children.length > 0 && this.props.multi &&
                <Button type="button" className={ toggleClasses } onClick={ () => this.setState(({ isOpen }) => ({ isOpen: !isOpen })) }>
                  <Icon id="i-drop-arrow"/>
                  <span>{ this.state.isOpen ? "Hide" : "Show"} { this.props.toggleText }</span>
                </Button>
              }
            </div>
            { clientProps.showSubGenres && this.props.children.length > 0 && this.state.isOpen &&
                <div className={`${prefix}checkbox-filters__content`}>
                  { this.props.children.map((genre) => {
                    return <Checkbox key={ genre.id } id={ genre.name + genre.id } data-parent={ this.props.parent.id } label={ genre.name } value={ genre.id } onChange={ this.props.onChange } checked={ this.props.checkParent || this.props.checkChildren.includes(genre.id) } />
                  })}
                </div>
            }
          </div>
        )}
      />
    )
  }
}

const enhance = compose(
  withPrefix
)

export default enhance(CheckboxFilters)