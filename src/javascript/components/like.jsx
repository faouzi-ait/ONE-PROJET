import React from 'react'
import enhanceWithClickOutside from 'react-click-outside'

import 'stylesheets/core/components/like'
import actions from 'javascript/actions/likes'
import Button from 'javascript/components/button'

class Like extends React.Component {

  constructor(props) {
    super(props)
    this.state = { isOpen: false }
  }

  handleClickOutside = () => {
    this.setState({
      isOpened: false
    })
  }
  toggle = () => {
    this.setState({
      isOpened: !this.state.isOpened
    })
  }
  updateLike = (action) => () => {
    const { resource } = this.props
    if (resource.like) {
      actions.updateResource({
        ...resource.like,
        action,
        parent: resource
      })
    } else {
      actions.createResource({
        action,
        parent: resource
      })
    }
  }
  render() {
    const { resource } = this.props
    const action = resource.like ? resource.like.action : 'its_ok'
    return (
      <div className="like">
        <Button className={`like__trigger like__trigger--${action}`} onClick={this.toggle}></Button>
        {this.state.isOpened &&
          <ul className="like__menu" onClick={this.handleClickOutside}>
            <li className="like__item">Interested in this {this.props.type}?</li>
            <li className="like__item">
              <Button className={`like__button like__button--love ${action === 'love_it' && 'like__button--active'}`} onClick={this.updateLike('love_it')}>Yes, love it!</Button>
            </li>
            <li className="like__item">
              <Button className={`like__button like__button--ok ${action === 'its_ok' && 'like__button--active'}`} onClick={this.updateLike('its_ok')}>It's OK</Button>
            </li>
            <li className="like__item">
              <Button className={`like__button like__button--hate ${action === 'not_interested' && 'like__button--active'}`} onClick={this.updateLike('not_interested')}>Not interested</Button>
            </li>
          </ul>
        }
      </div>
    )
  }
}

export default enhanceWithClickOutside(Like)