import React, { useEffect, useState } from 'react'
import moment from 'moment'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

// Components
import Banner from 'javascript/components/banner'
import Card from 'javascript/components/card'
import FormControl from 'javascript/components/form-control'
import Map from 'javascript/views/passport/map'
import Meta from 'react-document-meta'
import Select from 'react-select'

import passportClientVariables from 'javascript/views/passport/passport.variables'
import allClientVariables from 'javascript/views/passport/variables'

import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useTheme from 'javascript/utils/theme/useTheme'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPageHelper from 'javascript/components/hoc/with-page-helper'

const PassportDashboard = props => {
  const [currentMarket, setCurrentMarket] = useState({
    name: null,
    id: '',
  })
  const [intitalLoad, setIntitalLoad] = useState(true)
  const [availableMarkets, setAvailableMarkets] = useState([])

  const passportCV = useClientVariables(passportClientVariables)
  const { images } = useClientVariables(allClientVariables)

  useEffect(() => {
    if (!props.trips) return
    if (intitalLoad) {
      const today = moment()
      const usersMarkets = []
      let nextMarket = null
      props.trips.forEach(trip => {
        if (trip.market) {
          const marketDate = moment(trip.market['start-date'])
          if (!nextMarket && today.isBefore(marketDate)) {
            nextMarket = {
              ...trip.market,
              attendeeId: trip.id,
            }
          }
          usersMarkets.push({
            ...trip.market,
            attendeeId: trip.id,
            label: trip.market.name,
            value: trip.market.id,
          })
        }
      })
      if (nextMarket) {
        setCurrentMarket(nextMarket)
      }
      setAvailableMarkets(usersMarkets)
      setIntitalLoad(false)
    }
  }, [props.trips])


  useEffect(() => {
    if (currentMarket.id) {
      props.getMarketResources(currentMarket.id)
    }
  }, [currentMarket.id])

  const {localisation} = useTheme()

  const renderButtonCards = () => {
    if (currentMarket.name) {
      let buttonCards = [
        <Card title={localisation.passport.itinerary}
          key={'itinerary'}
          url={'#'}
          images={[images[0]]}
          classes={['poster']}
          onClick={() => {
            props.history.push(`/${localisation.passport.path}/${currentMarket.id}/${currentMarket.attendeeId}/itinerary`)
          }}
        />,
        <Card title={pluralize(localisation.passport.event.upper)}
          key={'events'}
          url={'#'}
          images={[images[1]]}
          classes={['poster']}
          onClick={() => {
            props.history.push(`/${localisation.passport.path}/${currentMarket.id}/events`)
          }}
        />
      ]
      let imgIndex = 2
      buttonCards = buttonCards.concat((props.contents || []).map((content) => {
        if (imgIndex >= images.length) imgIndex = -1
        imgIndex += 1
        return (
          <Card title={content.name}
            key={content.id}
            url={'#'}
            images={[images[imgIndex]]}
            classes={['poster']}
            onClick={() => {
              props.history.push(`/${localisation.passport.path}/${currentMarket.id}/${content.id}/content`)
            }}
          />
        )
      }))

      return (
        <div className="grid grid--four" >
          { buttonCards }
        </div>
      )
    }

    return (
      <div className="grid grid--justify">
        <p>You currently have no upcoming trips within Passport.</p>
      </div>
    )

  }

  const bannerCopy = currentMarket.name
    ? `Here you will find everything you need to know for ${currentMarket.name}`
    : null

  return (
    <Meta
      title={`${localisation.client} :: ${localisation.passport.upper}`}
      meta={{
        description: `Guide view for ${localisation.passport.upper}`,
      }}
    >
      <LoadPageBannerImage slug={localisation.passport.path} fallbackBannerImage={passportCV.defaultBannerImage}>
        {({ image }) => (
          <Banner
            classes={['short-zoomed']}
            title={localisation.passport.upper}
            image={image}
          />
        )}
      </LoadPageBannerImage>
      <main>
        <div className="container" style={{ marginTop: '20px' }}>
          <div className="grid grid--two grid--row-reverse">
            <div className="grid grid--end">
              <FormControl label="">
                <Select
                  value={currentMarket.id}
                  onChange={value => setCurrentMarket(value)}
                  clearable={false}
                  options={availableMarkets}
                  placeholder="Select an Event"
                />
              </FormControl>
            </div>
          </div>
          {renderButtonCards()}
        </div>
        <Map marketId={currentMarket ? currentMarket.id : null} />
      </main>
    </Meta>
  )
}

const enhance = compose(
  withPageHelper,
  withHooks(props => {
    const [marketRelation, setMarketRelation] = useState(null)
    const userRelation = {
      name: 'user',
      id: props.user.id,
    }
    const tripsReduxResource = useReduxResource('passport-trip', 'passport/dashboard-my-trips', userRelation) // no passport nameSpace - /users/:userId/trips?
    const isTripsLoading = tripsReduxResource.queryState.isLoading
    const contentsReduxResource = nameSpaced('passport', useReduxResource('passport-content', 'passport/dashboard-contents', marketRelation))
    const isContentsLoading = contentsReduxResource.queryState.isLoading
    const supportTripsReduxResource = nameSpaced('passport', useReduxResource('passport-trip-search-result', 'passport/dashboard-support-trips', userRelation))

    const isSupportTripsLoading = supportTripsReduxResource.queryState.isLoading

    useEffect(() => {
      tripsReduxResource.findAllFromOneRelation(userRelation, {
        include: 'market',
        fields: {
          'passport-trips': 'market',
          'passport-markets': 'name,start-date,active',
        },
      })
      supportTripsReduxResource.findAll({
        include: 'trip,trip.market',
        fields: {
          'passport-trip-search-results': 'trip',
          'passport-trips': 'first-name,last-name,title,market',
          'passport-markets': 'name,start-date,active',
        },
        'filter[support-user]': userRelation.id,
      })
    }, [props.user.id])

    useEffect(() => {
      props.pageIsLoading([
        isTripsLoading,
        isContentsLoading,
        isSupportTripsLoading,
      ])
    }, [isTripsLoading, isContentsLoading, isSupportTripsLoading])

    useEffect(() => {
      if (!marketRelation) return
      contentsReduxResource.findAllFromOneRelation(marketRelation, {
        fields: {
          'passport-contents': 'name',
        },
        'filter[active]': true,
      })
    }, [marketRelation])

    const getMarketResources = marketId => {
      setMarketRelation({
        name: 'passport-market',
        id: marketId,
      })
    }

    let trips = null
    const myTrips = tripsReduxResource.getReduxResources()
    const supportTrips = supportTripsReduxResource.getReduxResources()
    if (myTrips && supportTrips) {
      const allTrips = myTrips.concat(
        supportTrips.map(searchTrip => searchTrip.trip),
      )
      const marketIdCache = {}
      trips = allTrips.filter(trip => {
        if (marketIdCache[trip.market.id] || !trip.market.active) return false
        marketIdCache[trip.market.id] = true
        return true
      })
    }

    return {
      ...props,
      getMarketResources,
      trips,
      contents: contentsReduxResource.getReduxResources(),
    }
  }),
)

export default enhance(PassportDashboard)
