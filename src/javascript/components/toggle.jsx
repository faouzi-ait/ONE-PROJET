import React from 'react'
import HelperComponent from 'javascript/components/helper'

import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'
import withPrefix from 'javascript/components/hoc/with-prefix'
import 'stylesheets/core/components/toggle'
import 'stylesheets/admin/components/cms-toggle'

class Toggle extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = 'toggle'
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  render() {
    const { childButtonClasses, indeterminate, prefix } = this.props
    const toggleIsActive = this.state.classes.includes('toggle--active')
    const isToggleClasses = toggleIsActive || !this.props.children
    return (
      <Button
        type="button"
        onClick={ this.props.onClick }
        {...(isToggleClasses ? { className: this.state.classes} : { className: childButtonClasses })}
        classesToPrefix={['toggle']}
      >
        {toggleIsActive ? (
          <>
            { indeterminate ? (
              <Icon id="i-indeterminate" classes="toggle__icon" classesToPrefix={['toggle']} />
            ) : (
              <Icon id="i-tick" width="12" height="13" classes="toggle__icon" classesToPrefix={['toggle']} />
            )}
          </>
        ) : (
          <>
            {this.props.children}
          </>
        )}
      </Button>
    )
  }
}

export default withPrefix(Toggle)