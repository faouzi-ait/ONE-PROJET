import React from 'react'

import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'

import 'stylesheets/core/components/production-company'
import BannerPlaceholder from 'images/theme/banner-default.jpg'

import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'

const renderItems = (resource, onPlayVideo, buttonText) => {
  return (
    <div className="container">
      <div className="grid grid--three">

        <Card 
          title={resource.name} 
          description={resource.intro} 
          image={{src:resource.logo.url}} 
          className="card production-company__card" 
          size="productionCompany">

          {resource.video && (
            <p className="card__copy">
              <button className="text-button" onClick={onPlayVideo(resource.video)}>
                <Icon width="32" height="32" viewBox="0 0 32 32" classes="button__icon button__icon--filled" id="i-play" />
                Watch a promo
              </button>
            </p>
          )}
          {resource['external-url'] && (
            <ClientChoice>
              <ClientSpecific client="default">
                <a href={resource['external-url']} target="_blank" className="button">
                  {buttonText}
                </a>
              </ClientSpecific>
              <ClientSpecific client="itv">
                <a href={resource['external-url']} target="_blank" className="text-button">
                  <Icon width="32" height="32" viewBox="0 0 32 32" classes="button__icon button__icon--filled" id="i-globe" />
                  Visit Website
                </a>
              </ClientSpecific>
            </ClientChoice>
          )}
        </Card>
      </div>
    </div>
  )
}

export default ({resource, onPlayVideo, buttonText}) => (

  <ClientChoice>
    <ClientSpecific client="default">
      <div class="production-company">
        <img src={resource['background-image'].url || BannerPlaceholder} class="production-company__image" />
        {renderItems(resource, onPlayVideo, buttonText)}
      </div>
    </ClientSpecific>
    <ClientSpecific client="itv">
      <div class="production-company" style={{
        background: `url(${resource['background-image'].url && resource['background-image'].url.replace('.net/', '.net/1600x800/') || BannerPlaceholder})`,
        backgroundSize: 'cover'
      }}>
        {renderItems(resource, onPlayVideo, buttonText)}
      </div>
    </ClientSpecific>
  </ClientChoice>
)