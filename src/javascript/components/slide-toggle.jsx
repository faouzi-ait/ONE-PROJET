import React from 'react'
import HelperComponent from 'javascript/components/helper'

import 'stylesheets/core/components/slide-toggle'

export default class SlideToggle extends HelperComponent {
  constructor(props) {
    super(props)
    this.resourceName = 'slide-toggle'
  }

  componentDidMount() {
    this.setClasses(this.props)
  }

  toggleHint = () => {
    const { showHint } = this.state
    this.setState({
      showHint: !showHint
    })
  }

  render() {
    const { on, off, identifier, hint, disabled } = this.props
    const { showHint } = this.state
    let toggleClasses = this.state.classes
    if (disabled && !toggleClasses.includes(`${this.resourceName}--disabled`)) {
      toggleClasses += ` ${this.resourceName}--disabled`
    }
    return (
      <>
        <div className={ toggleClasses }>
          {hint &&
            <button onClick={this.toggleHint} className="slide-toggle__hint">i</button>
          }
          { off &&
            <span className="slide-toggle__label">{ off }</span>
          }
          <input type="checkbox" className="slide-toggle__input" id={ identifier } { ...this.props }/>
          <label htmlFor={ identifier } className="slide-toggle__toggle"></label>
          { on &&
            <span className="slide-toggle__label">{ on }</span>
          }
        </div>
        {(hint && showHint) &&
          <p className="slide-toggle__hint-copy">{hint}</p>
        }
      </>
    )
  }

}