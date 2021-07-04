import React from 'react'

import { MapsKey } from 'javascript/config/features'

import withTheme from 'javascript/utils/theme/withTheme'

import { BlockFunction } from 'javascript/views/blocks/types/BlockFunction'
import { PageImageType } from 'javascript/types/ModelTypes'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

import compose from 'javascript/utils/compose'
import locationsClientVariables from './variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import ClientChoice from 'javascript/utils/client-switch/components/client-choice'
import ClientProps from 'javascript/utils/client-switch/components/client-props'

// Components
import Card from 'javascript/components/card'
import Icon from 'javascript/components/icon'

const Locations: BlockFunction<Props['block']> = ({
  assets,
  block,
  theme
}) => {

  const locationsCV = useClientVariables(locationsClientVariables)

  return (
    <div>
      { block.title &&
        <h2 className="content-block__heading">{ block.title }</h2>
      }

      <div className={`grid grid--${locationsCV.grid}`}>
        { block.locations.map((location, key) => {
          const mapurl = `${location.addressOne}+${location.addressTwo}+${location.addressThree}+${location.addressFour}`.replace(/\s+/g, '+')
          const image = assets['page-images'] && assets['page-images'].find(d => location.imageIds && location.imageIds.includes(d.id))

          const address = <>
            { location.addressOne && <>{location.addressOne}<br/></>}
            { location.addressTwo && <>{location.addressTwo}<br/></>}
            { location.addressThree && <>{location.addressThree}<br/></>}
            { location.addressFour && location.addressFour }
          </>
          const phone = <a href={ `tel:${location.telephone}` }>{ location.telephone }</a>
          const email = <a href={ `mailto:${location.email}` } className="card__mailto">{ location.email }</a>

          return (
            <ClientProps
              clientProps={{
                image: {
                  'default': { src: image ? image.file.url : `https://maps.googleapis.com/maps/api/staticmap?center=${mapurl}&markers=${mapurl}&zoom=15&size=${locationsCV.mapSize}&maptype=roadmap&sensor=false&key=${MapsKey}` }
,                 'drg': { src: `https://maps.googleapis.com/maps/api/staticmap?center=${mapurl}&markers=icon:https://drg.rawnet.one/assets/images/location-pin.png|${mapurl}&zoom=15&size=${locationsCV.mapSize}&maptype=roadmap&sensor=false&key=${MapsKey}`}
                },
                description: {
                  default: location.subtitle,
                  'drg': null
                },
                size: {
                  default: 'medium',
                  'drg': null
                },
                classes: {
                  default: [],
                  'amc': ['hover'],
                  'banijaygroup | keshet | storylab | wildbrain': ['location']
                },
                childrenAfter: {
                  default: null,
                  'amc': true
                }
              }}
              renderProp={(clientProps) => (
                <div>
                  <Card
                    key={`location-${key}`}
                    title={location.name}
                    cardId={location.id}
                    {...clientProps}
                  >
                    <p className="card__copy">
                      <ClientChoice>
                        <ClientSpecific client="default">
                          {address}
                        </ClientSpecific>
                        <ClientSpecific client="ae">
                          <span className="card__icon-wrapper">
                            <Icon id="i-home-circle" className="card__icon" />
                            {address}
                          </span>
                        </ClientSpecific>
                      </ClientChoice>
                    </p>
                    <ClientChoice>
                      <ClientSpecific client="default">
                        <p className="card__copy">
                          { location.telephone &&
                              <>
                                <ClientChoice>
                                  <ClientSpecific client="default">
                                    {phone}
                                  </ClientSpecific>
                                  <ClientSpecific client="itv">
                                    <span className="card__phone">
                                      <Icon id="i-phone" />
                                      {phone}
                                    </span>
                                  </ClientSpecific>
                                </ClientChoice>
                                <br/>
                              </>
                          }
                          { location.email &&
                          <>
                            {email}
                          </>
                          }
                        </p>
                      </ClientSpecific>
                      <ClientSpecific client="ae">
                        <p className="card__copy">
                          <span className="card__icon-wrapper">
                            <Icon id="i-phone" className="card__icon" />
                            {phone}
                          </span>
                        </p>
                        <p className="card__copy">
                          <span className="card__icon-wrapper">
                            <Icon id="i-email" className="card__icon" />
                            {email}
                          </span>
                        </p>
                      </ClientSpecific>
                    </ClientChoice>
                  </Card>
                </div>
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

const LocationsBlock: BlockFunction<Props['block']> = (
  block,
  assets,
  props,
) => {
  return (
    <EnhancedLocationsBlock
      block={block}
      assets={assets}
      {...props}
    />
  )
}

export default LocationsBlock

const enhance = compose(
  withTheme,
)

const EnhancedLocationsBlock = enhance(Locations)

interface Props {
  block: any
  assets: {
    'page-images': PageImageType[]
  }
  theme: CustomThemeType,
  locationsCV: any
}