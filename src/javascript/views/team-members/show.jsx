import React from 'react'

// Styles
import 'stylesheets/core/components/team-member'

// Components
import Icon from 'javascript/components/icon'

const Copy = ({ children, ...props }) => children && <p className="team-member__copy" {...props}>{children}</p>

export default ({ resource, closeEvent }) => (
  <section className="team-member">
    <button className="modal__close" type="button" onClick={closeEvent}>
      <Icon id="i-close" />
      Close
    </button>

    <header className="team-member__header">
      <div className="team-member__aside">
        {resource.image && resource.image.url && (
          <img src={resource.image.url.replace('.net/', '.net/520x440/')} className="team-member__image" />
        )}
        {resource['phone'] &&
          <Copy>
            <Icon width="20" height="22" id="i-phone" classes="team-member__icon" />
            {resource['phone']}
          </Copy>
        }
        {resource['email'] &&
          <Copy>
            <Icon width="22" height="17" id="i-email" classes="team-member__icon" />
            {resource['email']}
          </Copy>
        }
      </div>
      <h1 className="team-member__title">{resource['first-name']} {resource['last-name']}</h1>
      <h2 className="team-member__sub">{resource['job-title']}</h2>
      {resource['team-department'] &&
        <Copy>{resource['team-department'].name}</Copy>
      }
      {resource['team-region'] &&
        <Copy>{resource['team-region'].name}</Copy>
      }
    </header>

    <div class="team-member__content">
      {resource['bio'] &&
        <Copy>{resource['bio']}</Copy>
      }
    </div>
  </section>
)