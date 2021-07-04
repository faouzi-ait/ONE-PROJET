import React, { useEffect, useState } from 'react'
import moment from 'moment'
import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

import 'stylesheets/core/components/passport/event.sass'

// Components
import Banner from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import Meta from 'react-document-meta'

// Hooks
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import passportClientVariables from 'javascript/views/passport/passport.variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useTheme from 'javascript/utils/theme/useTheme'
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'
import withTheme from 'javascript/utils/theme/withTheme'


const PassportEventItem = (props) => {
  const { event } = props
  const { features } = useTheme()
  return (
    <div className="event">
      <div className="event__title">{event['name']}</div>
      <div className="event__location">{event['location'].name}</div>
      <div className="event__date">{moment(event['start-date']).format(features.formats.dateTime)}</div>
      <div className="event__date">{moment(event['end-date']).format(features.formats.dateTime)}</div>
      <div className="event__description">{event['description']}</div>
    </div>
  )
}

const PassportEvents = (props) => {

  const passportCV = useClientVariables(passportClientVariables)

  const renderEvents = () => {
    if (!props.events || !props.events.length) {
      return (
        <div className="grid grid--justify">
          <p>
            There are currently no events scheduled.
          </p>
        </div>
      )
    }
    return (props.events).map((event) => (
      <PassportEventItem event={event} />
    ))
  }

  return (
    <Meta
      title={`${props.theme.localisation.client} :: ${pluralize(props.theme.localisation.passport.event.upper)}`}
      meta={{
        description: `View ${props.theme.localisation.passport.upper} ${pluralize(props.theme.localisation.passport.event.upper)}`
      }}
    >
      <LoadPageBannerImage slug={props.theme.localisation.passport.path} fallbackBannerImage={passportCV.defaultBannerImage}>
        {({ image }) => (
          <Banner
            classes={['short']}
            title={props.theme.localisation.passport.upper}
            image={image}
          />
        )}
      </LoadPageBannerImage>

      <Breadcrumbs paths={[
        { name: 'Passport', url: '/passport' },
        { name: `${pluralize(props.theme.localisation.passport.event.upper)}`, url: `/passport/` }
      ]} />

      <div className="container">
        <h1 style={{ marginTop: props.cms ? '55px' : '25px'}}>{pluralize(props.theme.localisation.passport.event.upper)}</h1>
        <hr style={{ marginBottom: '25px'}} />
        { renderEvents() }
      </div>
    </Meta>
  )
}

const enhance = compose(
  withLoader,
  withTheme,
  withHooks(props => {
    const { marketId } = props.match.params
    const marketRelation = {
      'name': 'passport-market',
      'id': marketId
    }
    const eventsReduxResource = nameSpaced('passport', useReduxResource('passport-market-event', 'passport/dashboard-events', marketRelation))
    const isEventsLoading = eventsReduxResource.queryState.isLoading

    const [events, setEvents] = useState([])

    useEffect(() => {
      if (!marketId) return
      eventsReduxResource.findAllFromOneRelation(marketRelation, {
        include: 'location,market',
        fields: {
          'passport-market-events': 'description,end-date,name,start-date,location,market',
          'passport-locations': 'name',
          'passport-markets': 'active',
        },
        'filter[active]':true
      })
      .then((response) => {
        setEvents(response.filter((event) => event.market.active))
      })
    }, [marketId])

    useEffect(() => {
      props.pageIsLoading([isEventsLoading])
    }, [isEventsLoading])

    return {
      ...props,
      marketId,
      events,
    }
  })
)

export default enhance(PassportEvents)