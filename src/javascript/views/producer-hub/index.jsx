import React, {useEffect, useState} from 'react'
import { NavLink } from 'react-router-dom'
import deepmerge from 'deepmerge-concat'

import { formatCurrency } from 'javascript/utils/generic-tools'
import { isAdmin, hasPermission } from 'javascript/services/user-permissions'
import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'
// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'
// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withPageHelper from 'javascript/components/hoc/with-page-helper'
//Components
import AdminToolbar from 'javascript/components/admin-toolbar'
import Banner, { getBannerImageUrls } from 'javascript/components/banner'
import Blocks from 'javascript/views/blocks'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import ExpandedColumn from 'javascript/views/producer-hub/expanded-column'
import Loader from 'javascript/components/reporting/loader'
import Meta from 'react-document-meta'
import NoResults from 'javascript/components/reporting/no-results'
import ProductionCompaniesSearch from 'javascript/containers/search/production-companies'
import ShouldRenderContentBlock from 'javascript/views/blocks/should-render-content-block'
import SmallScreenMessage from 'javascript/components/small-screen-message'


const ProducerHubIndex = (props) => {

  const {
    loadingProgrammeAmounts,
    pageResources,
    producerId,
    programmeAmounts,
    selectedProducer,
    setProgrammeAmounts,
    setProducerLoading,
    setSelectedProducer,
    theme,
    user,
  } = props

  const seriesLink = (title, seriesRef) => {
    const path = `/${theme.variables.SystemPages.producerHub.path}/${producerId}/${theme.localisation.series.lower}/${seriesRef}`
    return (
      <NavLink to={path} >
        {title}
      </NavLink>
    )
  }

  const toggleSeriesVisiblity = (programmeAmtId) => (e) => {
    setProgrammeAmounts(programmeAmounts.map((pAmt) => {
      if (pAmt.id !== programmeAmtId) return pAmt
      return {
        ...pAmt,
        seriesVisible: !pAmt.seriesVisible
      }
    }))
  }

  const firstColumnWidth = '60%';
  return (
    <Meta
      title={`${theme.localisation.client} :: ${theme.variables.SystemPages.producerHub.upper}`}
    >
      <main>
        <div className="fade-on-load">
          <Banner
            title={theme.variables.SystemPages.producerHub.upper}
            classes={['short']}
            image={getBannerImageUrls(pageResources)} />
          <Breadcrumbs paths={[{ name: theme.variables.SystemPages.producerHub.upper }]} />

          <section className="section">
            <ProductionCompaniesSearch
              onLoadStatusChange={setProducerLoading}
              onProducerSelected={setSelectedProducer}
            />
            {selectedProducer && !loadingProgrammeAmounts && !programmeAmounts.length && <p class="chart__message">No data to display</p>}
          </section>

          {selectedProducer &&
            <div className="container">
              {loadingProgrammeAmounts ? (
                  <Loader />
                ) : (
                  <div>
                    {!programmeAmounts.length ? null : (
                      <table className="table table--report">
                        <thead>
                          <tr>
                            <th>{theme.localisation.programme.upper}</th>
                            <th>Lifetime Gross Sales</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                        {programmeAmounts.map(pAmt => {
                          const programmeAmtRow = (
                            <tr key={pAmt.id} >
                              <td style={{ width: firstColumnWidth }}>
                                { pAmt.ref === null ? pAmt.title : seriesLink(pAmt.title, pAmt.ref) }
                              </td>
                              <td>{formatCurrency(pAmt.amount)}</td>
                              <td>
                                { pAmt.ref ? null : (
                                  <button type="button" className="button button--filled" onClick={toggleSeriesVisiblity(pAmt.id)}>
                                    { pAmt.seriesVisible ? 'Hide Series' : 'Expand Series'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                          const seriesAmountRows = pAmt.ref !== null || !pAmt.seriesVisible ? [] : pAmt['series-amounts'].map(sAmt => (
                            <tr key={sAmt.id} >
                              <td style={{ width: firstColumnWidth }}>
                                <ExpandedColumn theme={theme}>
                                  {seriesLink(sAmt.title, sAmt.id)}
                                </ExpandedColumn>
                              </td>
                              <td>{formatCurrency(sAmt.amount)}</td>
                              <td></td>
                            </tr>
                          ))
                          return [
                            programmeAmtRow,
                            ...seriesAmountRows
                          ]
                        })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )
              }
            </div>
          }

          <div className="container" style={{marginTop: '50px'}}>
            {(pageResources['content-blocks'] || []).map((block) => (
              <ShouldRenderContentBlock
                block={block}
                renderBlock={() => {
                  const bgImage = null
                  return (
                    <section key={block.id} className={`content-block content-block--${block.type} content-block--${block.background}`} style={block.background === 'image' && bgImage ? {
                      backgroundImage: `url(${bgImage.file.url.replace('.net/', '.net/1600x600/')})`
                    } : null}>
                      <div className={(block.type !== 'html-markup' && block.type !== 'banner-carousel' && block.type !== 'promo-carousel' && (block.type !== 'related-pages')) ? 'container' : 'content-block__inner'}>
                        {Blocks(block, {
                          'page-images': []
                        }, { user })}
                      </div>
                    </section>
                  )
                }}
              />
            ))}
          </div>
        </div>
        <AdminToolbar type={'page'} id={pageResources.id} user={user} />
      </main>
      <SmallScreenMessage />
    </Meta>
  )
}

const enhance = compose(
  withPageHelper,
  withHooks(props => {
    const [pageResources, setPageResources] = useState([])
    const [selectedProducer, setSelectedProducer] = useState(null)
    const [producerLoading, setProducerLoading] = useState(true)
    const [pageResourcesLoading, setPageResourcesLoading] = useState(true)
    const [loadingProgrammeAmounts, setLoadingProgrammeAmounts] = useState(false)
    const [programmeAmounts, setProgrammeAmounts] = useState([])

    const pageReduxResource = useReduxResource('pages', 'producer-hub/pages')

    useEffect(() => {
      pageReduxResource.findAll({
        fields: {
          'pages': 'content-blocks,banner-urls',
        },
        'filter[slug]': props.theme.variables.SystemPages.producerHub.path
      })
      .then((response) => {
        setPageResources(response.length ? response[0] : [])
        setPageResourcesLoading(false)
      })
    }, [])

    useEffect(() => {
      props.pageIsLoading([producerLoading, pageResourcesLoading])
    }, [producerLoading, pageResourcesLoading])

    const producerRelationship = {
      id: selectedProducer && selectedProducer.id ? selectedProducer.id : null,
      name: 'producer',
    }

    const programmeAmountResource = nameSpaced('producer_hub', useReduxResource('programme-amounts', 'producer-hub/programme-amount', producerRelationship))

    const makeAllSeriesVisible = (data, visible = false) => data.map((pAmt) => ({
      ...pAmt,
      seriesVisible: false,
    }))

    useEffect(() => {
      if (producerRelationship.id) {
        setLoadingProgrammeAmounts(true)
        const cachedProgrammeAmountResources = programmeAmountResource.getReduxResources()
        if (cachedProgrammeAmountResources) {
          setProgrammeAmounts(makeAllSeriesVisible(cachedProgrammeAmountResources, false))
          setLoadingProgrammeAmounts(false)
        }
        programmeAmountResource.findAllFromOneRelation(producerRelationship, {
          include: 'series-amounts',
          fields: {
            'programme-amounts': 'title,amount,ref,series-amounts',
            'series-amounts': 'title,amount'
          },
        })
        .then((response) => {
          if (cachedProgrammeAmountResources) {
            setProgrammeAmounts((cachedProgrammeAmts) => {
              return response.map((series) => {
                const cachedSery = cachedProgrammeAmts.find((cachedSeries) => cachedSeries.id === series.id)
                series.seriesVisible = cachedSery ? cachedSery.seriesVisible : false
                return series
              })
            })
          } else {
            setProgrammeAmounts(makeAllSeriesVisible(response, false))
          }
          setLoadingProgrammeAmounts(false)
        })
      } else {
        setProgrammeAmounts([])
      }
    }, [producerRelationship.id])

    return {
      ...props,
      loadingProgrammeAmounts,
      pageResources,
      setProducerLoading,
      setSelectedProducer,
      programmeAmounts,
      selectedProducer,
      setProgrammeAmounts,
      producerId: producerRelationship.id,
    }
  })
)

export default enhance(ProducerHubIndex)