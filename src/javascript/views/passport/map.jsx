
import React, { useEffect, useState } from 'react'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'
import config from 'javascript/config'

import 'stylesheets/core/components/passport/map.sass'

// Components
import GoogleMapReact from 'google-map-react'
import MapMarker from 'javascript/views/passport/map-marker'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'

const getMapBounds = (map, maps, locations) => {
  const bounds = new maps.LatLngBounds()
  locations.forEach((location) => {
    bounds.extend(new maps.LatLng(
      location.latitude,
      location.longitude,
    ))
  })
  return bounds
}

const bindResizeListener = (map, maps, bounds) => {
  maps.event.addDomListenerOnce(map, 'idle', () => {
    maps.event.addDomListener(window, 'resize', () => {
      map.fitBounds(bounds)
    })
  })
}

const apiIsLoaded = (map, maps, locations) => {
  const bounds = getMapBounds(map, maps, locations)
  map.fitBounds(bounds)
  bindResizeListener(map, maps, bounds)
};


const PassportMap = (props) => {
  const [map, setMap] = useState(null)
  const [maps, setMaps] = useState(null)
  const { locations } = props
  const markers = (locations || []).map((location) => {
    return <MapMarker
      key={location.id}
      location={location}
      lat={location.latitude}
      lng={location.longitude}
      text={location['location-type'][0].toUpperCase()}
      zIndex={2}
    />
  })

  useEffect(() => {
    if (map && maps && locations) {
      apiIsLoaded(map, maps, locations)
    }
  }, [map, maps, locations])

  if (!props.marketId ) return null

  return (
    <section className='container'>
      <div className="map">
        <GoogleMapReact
          bootstrapURLKeys={{ key: config.googleMapsApi }}
          defaultCenter={{
            lat: 43.550827,
            lng: 7.024216
          }}
          defaultZoom={12}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => {
            setMap(map)
            setMaps(maps)
          }}
        >
          {markers}
        </GoogleMapReact>
      </div>
    </section>
  )
}

const enhance = compose(
  withHooks(props => {
    const { marketId } = props
    const marketRelation = !marketId ? null : {
      'name': 'passport-market',
      'id': marketId
    }
    const locationsReduxResource = nameSpaced('passport', useReduxResource('passport-location', 'passport/dashboard-map', marketRelation))

    useEffect(() => {
      if (marketId) {
        locationsReduxResource.findAllFromOneRelation(marketRelation, {
          fields: {
            'passport-locations': 'address,latitude,location-type,longitude,name'
          },
          'filter[active]': true
        })
      }
    }, [marketId])

    return {
      ...props,
      locations: locationsReduxResource.getReduxResources()
    }
  })
)

export default enhance(PassportMap)
