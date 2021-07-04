// React
import React from 'react'

import withPrefix from 'javascript/components/hoc/with-prefix'
// Components
import Button from 'javascript/components/button'
import Icon from 'javascript/components/icon'

class Modal extends React.Component {
  constructor(props) {
    super(props)
    this.renderTitleIcon = this.renderTitleIcon.bind(this)
    this.state = {
      scrollPos: 0
    }
  }

  componentDidMount() {
    this.setState({
      scrollPos: document.documentElement ? document.documentElement.scrollTop : document.body.scrollTop
    }, () => {
      document.body.style.height = `${window.innerHeight}px`
      document.body.children[0].style['margin-top'] = `-${this.state.scrollPos}px`
      document.documentElement.classList.add('no-scroll')
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  }

  componentWillUnmount() {
    document.body.style.height = 'auto'
    document.body.children[0].style['margin-top'] = '0'
    document.documentElement.classList.remove('no-scroll')
    document.documentElement.scrollTop = this.state.scrollPos
    document.body.scrollTop = this.state.scrollPos
  }

  renderTitleIcon() {
    const { titleIcon } = this.props
    if (titleIcon) {
      return (
        <Icon {...titleIcon} classes="modal__title-icon" classesToPrefix={['modal']} />
      )
    }
  }

  renderContent = () => {
    const { prefix, closeEvent, customContent = false, closeButton = true } = this.props
    return [
      this.props.title && (
        <div className={`${prefix}modal__header`} key={1}>
          <h3 className={`${prefix}heading--two ${prefix}modal__title`}>
            { this.renderTitleIcon() }
            { this.props.title }
          </h3>
        </div>
      ),
      (!customContent && closeButton) && (
        <Button test-id="close_modal_button"
          className="modal__close"
          type="button"
          onClick={ closeEvent } key={2}
          classesToPrefix={['modal']}
        >
          <Icon id="i-close" />
          Close
        </Button>
      ),
      this.props.children
    ]
  }

  closeModal(e) {
    if (e.target.className.indexOf && e.target.className.indexOf('react-datepicker') !== -1) {
      return e.stopPropagation()
    }
    if (!this.refs.modalInner.contains(e.target)) {
      this.props.closeEvent()
    }
  }

  render() {
    const { prefix, modifiers = [], isHiding = false, customContent = false, wrapperStyling = {}} = this.props
    const modal = (
      <div
        className={ [`${prefix}modal`, isHiding ? 'is-hiding' : '', ...modifiers].filter(Boolean).join(` ${prefix}modal--`) }
        onMouseDown={(e)=>this.closeModal(e)}
        data-testid="modal"
      >
        { customContent ? <div ref="modalInner">{this.renderContent()}</div> : (
          <div
            ref="modalInner"
            className={ !customContent && `${prefix}modal__wrapper` }
            style={wrapperStyling}
          >
            {this.renderContent()}
          </div>
        )}
      </div>
    )
    return modal
  }
}

export default withPrefix(Modal)