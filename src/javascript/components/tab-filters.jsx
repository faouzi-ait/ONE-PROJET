import React from 'react'
import Checkbox from 'javascript/components/custom-checkbox'
import Icon from 'javascript/components/icon'

import compose from 'javascript/utils/compose'
import withPrefix from './hoc/with-prefix'

import 'stylesheets/core/components/checkbox-filters'
import 'stylesheets/admin/components/cms-checkbox-filters'

class CheckboxFilters extends React.Component {

  render() {
    const { prefix } = this.props
    const tabClasses = ['tabs__item', this.props.checked && '--active'].join(` ${prefix}tabs__item`)
    return (
      <div className={tabClasses}>
        <Checkbox
          label={ this.props.parent.name }
          id={ this.props.parent.name + this.props.parent.id }
          name={ this.props.parent.type + '-tabs-filters' }
          value={ this.props.parent.id }
          onChange={ this.props.onChange }
          checked={ this.props.checked }
          radio
        />
        <Icon id="i-drop-arrow" className="tabs__icon" />
      </div>
    )
  }
}

const enhance = compose(
  withPrefix
)

export default enhance(CheckboxFilters)