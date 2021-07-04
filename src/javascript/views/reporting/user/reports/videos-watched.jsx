import React, { useEffect, useState } from 'react'
import pluralize from 'pluralize'
import compose from 'javascript/utils/compose'
import withHooks from 'javascript/utils/hoc/with-hooks'
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useCsvExport from 'javascript/utils/hooks/use-csv-export'

import ReportSection from 'javascript/components/reporting/section'
import { ReportControls } from 'javascript/components/reporting/controls'
import TitleHeader from 'javascript/components/reporting/title-header'
import NoResults from 'javascript/components/reporting/no-results'
import Loader from 'javascript/components/reporting/loader'
import withQueryControls from 'javascript/components/hoc/reporting/with-query-controls'
import ClientProps from 'javascript/utils/client-switch/components/client-props'

import moment from 'moment'
import Card from 'javascript/components/card'
const VideosWatched = (props) => {
  const { resources, queryControls } = props

  const handleExport = (type) => {
    props.exportApi(type)
  }

  return (
    <ReportSection bg={props.bg}>
      <TitleHeader>Video Interactions</TitleHeader>
      <div class="chart">
        <ReportControls>
          {queryControls.dateFrom}
          {queryControls.dateTo}
          {queryControls.limit}
          {queryControls.platform}
          <button disabled={!resources.length} className="button button--filled" onClick={()=>handleExport('csv')}>Export as CSV</button>
        </ReportControls>
        {props.loading ? (
          <Loader />
        ): (
          <>
            {resources.length ?
              <div className="grid grid--four">
                {resources.map((record) => {
                  let seconds = moment.duration(record.timeViewed).minutes() + ' minutes'
                  if (record.timeViewed < 2000) {
                    seconds = moment.duration(record.timeViewed).humanize()
                  } else if (record.timeViewed < 60000) {
                    seconds = moment.duration(record.timeViewed).seconds() + ' seconds'
                  }


                  return (
                    <ClientProps
                      clientProps={{
                        childrenAfter: {
                          default: false,
                          'amc': true
                        },
                        cardClasses: {
                          default: [],
                          'cineflix | drg': ['list']
                        }
                      }}
                      renderProp={(clientProps) => (
                        <Card
                          key={record.id}
                          title={record['video-name']}
                          childrenAfter={clientProps.childrenAfter}
                          classes={clientProps.cardClasses}
                          image={{ src: record.poster.small.url, alt: record.name }}>
                          <p className="card__title card__title--small">{record['programme-name'] || record['parent-name']}</p>
                          {record['parent-type'] === 'Series' &&
                            <p className="card__copy">{record['parent-name']}</p>
                          }
                          <p className="card__date"><strong>Last Viewed</strong> {moment(record.lastView).fromNow()} for {seconds}</p>
                        </Card>
                      )}
                    />
                )
                })}
              </div>
              : <NoResults />
            }
          </>
        )}
      </div>
    </ReportSection>
  )
}

export default compose(
  withQueryControls(['dateFrom', 'dateTo', 'limit', 'platform']),
  withHooks((props) => {
    const relation = {
      'name': 'videos-watched',
      'id': props.user.id
    }

    const reduxResource = useReduxResource('reports-user', 'reports/users', relation)
    const [csvExport] = useState(useCsvExport())
    let loading = true

    const exportApi = (format) => {
      const {query} = props
      delete query['page[limit]']
      csvExport.create(`reports/users/${relation.id}/${pluralize(relation.name)}`, query, format, relation.name)
    }

    const searchApi = (sort = '', reverse) => {
      if (sort.length) {
        props.query.sort = reverse ? `-${sort}` : sort
      }
      reduxResource.findOneAndAllRelations(relation, props.query)
    }

    useEffect(searchApi, [
      props.query['filter[date-from]'],
      props.query['filter[date-to]'],
      props.query['filter[platform]'],
      props.query['page[limit]'],
      props.user.id,
    ])

    if(reduxResource.queryState.succeeded){
      loading = false
    }

    return {
      exportApi,
      searchApi,
      loading,
      resources: reduxResource.queryState.data || []
    }
  })
)(VideosWatched)