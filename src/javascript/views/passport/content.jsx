import React, { useEffect, useState } from 'react'

import pluralize from 'pluralize'

import compose from 'javascript/utils/compose'
import nameSpaced from 'javascript/utils/name-spaced'

import passportClientVariables from 'javascript/views/passport/passport.variables'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'

// Components
import Banner from 'javascript/components/banner'
import Blocks from 'javascript/views/blocks'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import Meta from 'react-document-meta'
import ShouldRenderContentBlock from 'javascript/views/blocks/should-render-content-block'

// Hooks
import useReduxResource from 'javascript/utils/hooks/use-redux-resource'

// HOC
import withHooks from 'javascript/utils/hoc/with-hooks'
import withLoader from 'javascript/components/hoc/with-loader'
import LoadPageBannerImage from 'javascript/components/load-page-banner-image'
import withUser from 'javascript/components/hoc/with-user'
import withTheme from 'javascript/utils/theme/withTheme'

const PassportContent = (props) => {
  const {
    content,
    user,
    theme
  } = props

  const passportCV = useClientVariables(passportClientVariables)

  if (!Object.keys(content).length) {
    return null
  }

  const renderContent = () => (content['content-blocks'] || []).map((block) => (
    <ShouldRenderContentBlock
      block={block}
      renderBlock={() => (
        <section key={block.id} className={['content-block', block.type, block.background].join(' content-block--')}>
          <div className={'container'}>
            { Blocks(block) }
          </div>
        </section>
      )}
    />
  ))

  return (
    <Meta
      title={`${theme.localisation.client} :: ${pluralize(theme.localisation.passport.content.upper)}`}
      meta={{
        description: `View ${theme.localisation.passport.upper} ${pluralize(content['name'])}`
      }}
    >
      <LoadPageBannerImage slug={theme.localisation.passport.path} fallbackBannerImage={passportCV.defaultBannerImage}>
        {({ image }) => (
          <Banner
            classes={['short']}
            title={theme.localisation.passport.upper}
            image={image}
          />
        )}
      </LoadPageBannerImage>

      <Breadcrumbs paths={[
        { name: 'Passport', url: '/passport' },
        { name: `${content['name']}`, url: `/passport/` }
      ]} />

      <div className="container">
        <h1 style={{ marginTop: props.cms ? '55px' : '25px'}}>{content['name']}</h1>
        <hr style={{ marginBottom: '25px'}} />
      </div>
      { renderContent() }
    </Meta>
  )
}

const enhance = compose(
  withLoader,
  withUser,
  withTheme,
  withHooks(props => {
    const { marketId, contentId } = props.match.params
    const marketRelation = {
      'name': 'passport-market',
      'id': marketId
    }
    const contentsReduxResource = nameSpaced('passport', useReduxResource('passport-content', 'passport/dashboard-contents', marketRelation))
    const isContentsLoading = contentsReduxResource.queryState.isLoading
    const [content, setContent] = useState({})

    useEffect(() => {
      if (!marketId || !contentId) return
      contentsReduxResource.findAllFromOneRelation(marketRelation, {
        include: 'market',
        fields: {
          'passport-contents': 'content-blocks,name,market',
          'passport-markets': 'active',
        },
        'filter[active]': true
      })
      .then(response => {
        const contentUpdate = response.find((content) => content.id === contentId)
        setContent(contentUpdate.market.active ? contentUpdate : {})
      })
    }, [marketId, contentId])

    useEffect(() => {
      props.pageIsLoading([isContentsLoading])
    }, [isContentsLoading])

    return {
      ...props,
      marketId,
      content,
    }
  })
)

export default enhance(PassportContent)