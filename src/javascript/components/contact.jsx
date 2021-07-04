import React from 'react'

import 'stylesheets/core/components/contact'

import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import Icon from 'javascript/components/icon'

const Contact = ({image, name, jobTitle, phone, email}) => (
  <div className="contact">
    <div>
      {image && (
        <img className="contact__image" src={image.file.url} />
      )}
    </div>

    <div className="contact__info">
      <h3 className="contact__name">{name}</h3>
      {jobTitle && <p className="contact__jobtitle">{jobTitle}</p>}
    </div>

    <div className="contact__phone">
      <ClientSpecific client="ae | itv">
        <Icon classes="contact__icon" id="i-phone" />
      </ClientSpecific>
      <a className="text-button" href={ `tel:${phone}` }>{ phone }</a>
    </div>

    <div className="contact__email">
      <ClientSpecific client="ae | itv">
        <Icon classes="contact__icon" id="i-email" />
      </ClientSpecific>
      <a className="text-button" href={ `mailto:${email}` }>{ email }</a>
    </div>
  </div>
)

export default Contact

