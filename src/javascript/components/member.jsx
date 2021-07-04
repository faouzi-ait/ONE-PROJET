import React from 'react'

import 'stylesheets/core/components/member'

export default class Member extends React.Component {
  render() {
    const { image, title, copy, ...props } = this.props
    return (
      <article className="member" {...props}>
        <div className="member__image">
          <img src={image} />
        </div>
        <h1 className="member__title">{title}</h1>
        <p className="member__copy">{copy}</p>
      </article>
    )
  }
}