import React, {useEffect, useState, useRef} from 'react'
import moment from 'moment'
import ReactToPrint from 'react-to-print'

import 'stylesheets/core/components/producer-hub/producer-hub'

import compose from 'javascript/utils/compose'
// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import nameSpaced from 'javascript/utils/name-spaced'
import { formatCurrency } from 'javascript/utils/generic-tools'
// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
import useResource from 'javascript/utils/hooks/use-resource'
//Components
import Banner, { getBannerImageUrls } from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import Disclaimer from 'javascript/views/producer-hub/series/disclaimer'
import FormControl from 'javascript/components/form-control'
import Loader from 'javascript/components/reporting/loader'
import Meta from 'react-document-meta'
import PrintPage from 'javascript/views/producer-hub/series/print-page'
import SeriesTable from 'javascript/views/producer-hub/series/series-table'
import SmallScreenMessage from 'javascript/components/small-screen-message'

const ProducerHubSeries = (props) => {
  const {
    allVisibleRows,
    endDate,
    loadingLicences,
    producerId,
    producerName,
    seriesName,
    seriesRef,
    setEndDate,
    setStartDate,
    setTotalRows,
    startDate,
    totalRows,
    pageResources
  } = props

  const [pagePrinting, setPagePrinting] = useState(false)

  const printPageRef = useRef()

  const toggleEpisodeVisiblity = (totalRowId) => (e) => {
    setTotalRows(totalRows.map((totalRow) => {
      if(totalRow.id === totalRowId) {
        if (totalRow.episodesVisible) { // closing - setScroll to saved position
          document.documentElement.scrollTop = document.body.scrollTop = totalRow.scrollPos
        } else { // opening - save scrollPosition for when closing
          totalRow.scrollPos = window.pageYOffset
        }
        totalRow.episodesVisible = !totalRow.episodesVisible
      }
      return totalRow
    }))
  }

  const printButtonClasses = pagePrinting ? 'button button--filled button--loading' : 'button button--filled'
  return (
    <Meta
      title={`${props.theme.localisation.client} :: ${props.theme.variables.SystemPages.producerHub.upper} - ${seriesName || props.theme.localisation.series.upper}`}
    >
      <main className="producer-hub">
        <div className="fade-on-load">
          <Banner
            title={props.theme.variables.SystemPages.producerHub.upper}
            classes={['short']}
            image={getBannerImageUrls(pageResources)} />
          <Breadcrumbs paths={[
            { url: `/${props.theme.variables.SystemPages.producerHub.path}?pc=${producerId}`, name: props.theme.variables.SystemPages.producerHub.upper },
            { name: seriesName || props.theme.localisation.series.upper }
          ]} />

          <Disclaimer />

          <div className="container" style={{paddingTop: '15px'}}>
            <div className="grid grid--two grid--justify">
              <FormControl type="date"
                label="Start Date"
                selected={startDate}
                onChange={date => setStartDate(date || null)}
                dateFormat={props.theme.features.ShortDateFormat}
                showYearDropdown
              />
              <FormControl type="date"
                label="End Date"
                selected={endDate}
                onChange={date => setEndDate(date || null)}
                dateFormat={props.theme.features.ShortDateFormat}
                showYearDropdown
              />
            </div>
            { allVisibleRows.length > 0 && (
              <div className="producer-hub__print-button-wrapper">
                <div className="producer-hub__print-button">
                  <ReactToPrint
                    trigger={() => (
                      <button type="button" className={printButtonClasses}>
                        Print Report
                      </button>
                    )}
                    onAfterPrint={() => setPagePrinting(false)}
                    onBeforeGetContent={() => setPagePrinting(true)}
                    content={() => printPageRef.current}
                  />
                  <div style={{ display: 'none' }}>
                    <PrintPage {...props} ref={printPageRef} />
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid--justify">
              <h3>
                {producerName}
                {producerName.length && seriesName.length ? <span style={{padding: '0px 20px'}}>: :</span> : null}
                {seriesName}
              </h3>
            </div>
          </div>

          <div className="section" style={{ padding: '0px 20px', maxWidth: '100vw', overflowX: 'auto'}}>
            {loadingLicences ? (
                <Loader />
              ) : (
                <SeriesTable
                  totalRows={totalRows}
                  toggleEpisodeVisiblity={toggleEpisodeVisiblity}
                />
              )
            }
          </div>
        </div>
      </main>
      <SmallScreenMessage />
    </Meta>
  )
}

const enhance = compose(
  withHooks((props) => {
    const { seriesRef, producerId } = props.match.params
    const [licences, setLicences] = useState([])
    const [loadingLicences, setLoadingLicences] = useState(true)
    const [totalRows, setTotalRows] = useState([])
    const [allVisibleRows, setAllVisibleRows] = useState([])
    const [startDate, setStartDate] = useState(moment().subtract(1, 'years'))
    const [endDate, setEndDate] = useState(moment())
    const [producerName, setProducerName] = useState('')
    const [seriesName, setSeriesName] = useState('')
    const [pageResources, setPageResources] = useState([])

    const pageReduxResource = useReduxResource('pages', 'producer-hub/pages')

    const producerRelationship = {
      id: producerId,
      name: 'producer'
    }

    useEffect(() => {
      getProducerResource()
      getSeriesName()
    }, [])

    const licencesAmountResource = nameSpaced('producer_hub', useReduxResource('licence-amounts', 'producer-hub/licence-amounts', producerRelationship))
    const licencesResource = nameSpaced('producer_hub', useReduxResource('licences', 'producer-hub/licences', producerRelationship))

    useEffect(() => {
      if (producerId && seriesRef) {
        setLoadingLicences(true)
        licencesAmountResource.findAllFromOneRelation(producerRelationship, {
          fields: {
            'licence-amounts': 'amount'
          },
          filter: {
            'series-ref': seriesRef,
            'date-signed-from': moment(startDate).format('YYYY-MM-DD'),
            'date-signed-to': moment(endDate).format('YYYY-MM-DD'),
          }
        })
        .then((licenceData) => {
          setLicences(licenceData)
        })        
      }
    }, [startDate, endDate])

    useEffect(() => {
      const update = []
      licences.map((l, i) => {
        licencesResource.findAllFromOneRelation(producerRelationship, {
          fields: {
            'licences': 'customer-name,date-signed,end-date,licence-ref,media,series-title,slot-time,start-date,territories,total-price-sterling'
          },
          filter: {
            'licence-ref': l.id,
            'series-ref': seriesRef,
            'date-signed-from': moment(startDate).format('YYYY-MM-DD'),
            'date-signed-to': moment(endDate).format('YYYY-MM-DD'),
          }
        })
        .then((licenceData) => {
          update[i] = hideEpisodes(licenceData)[0]
          setAllVisibleRows(hideEpisodes(licenceData, false))
          setTotalRows(update)
          setLoadingLicences(false)
        })
      })

    }, [licences])

    const hideEpisodes = (licenceData, hidden = true) => {
      const episodesVisible = !hidden
      const nestedLicenceData = []
      let licenseRef = licenceData[0]['licence-ref']
      let subTotal = licences.filter(l => parseInt(l.id) === licenseRef)?.[0]?.amount

      nestedLicenceData.push({
        id: licenseRef,
        episodeRows: licenceData,
        episodesVisible,
        subTotal,
      })

      return nestedLicenceData
    }

    const productionCompanyResource = useResource('production-companies')
    const getProducerResource = () => {
      productionCompanyResource.findOne(producerId, {
        fields: {
          'production-companies': 'name'
        }
      })
      .then((response) => {
        if (Object.keys(response).length) {
          setProducerName(response.name)
        }
      })
    }

    const seriesNameResource = nameSpaced('producer_hub', useResource('licences'))
    const getSeriesName = () => {
      seriesNameResource.findAllFromOneRelation(producerRelationship, {
        fields: {
          'licences': 'series-title'
        },
        filter: {
          'series-ref': seriesRef,
        }
      })
      .then((response) => {
        setSeriesName(response.length ? response[0]['series-title'] : '')
      })
    }

    useEffect(() => {
      pageReduxResource.findAll({
        fields: {
          'pages': 'banner-urls',
        },
        'filter[slug]': props.theme.variables.SystemPages.producerHub.path
      })
      .then((response) => {
        setPageResources(response.length ? response[0] : [])
      })
    }, [])

    return {
      ...props,
      allVisibleRows,
      endDate,
      loadingLicences,
      producerId,
      producerName,
      seriesName,
      seriesRef,
      setEndDate,
      setStartDate,
      setTotalRows,
      startDate,
      totalRows,
      pageResources
    }
  })
)

export default enhance(ProducerHubSeries)