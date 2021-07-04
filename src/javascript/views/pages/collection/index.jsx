import React from 'react'
import { withRouter } from 'react-router-dom'

// Actions
import PageActions from 'javascript/actions/pages'
import CollectionActions from 'javascript/actions/collections'

// Store
import PageStore from 'javascript/stores/pages'
import CollectionStore from 'javascript/stores/collections'

// Components
import Banner, { getBannerImageUrls } from 'javascript/components/banner'
import Breadcrumbs from 'javascript/components/breadcrumbs'
import Blocks from 'javascript/views/blocks'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import Sharer from 'javascript/components/sharer'
import Card from 'javascript/components/card'
import Paginator from 'javascript/components/paginator'
import Select from 'react-select'
import Meta from 'react-document-meta'
import AdminToolbar from 'javascript/components/admin-toolbar'
import Modal from 'javascript/components/modal'
import ListModal from 'javascript/components/list-modal'
import PageHelper from 'javascript/views/page-helper'
import ShouldRenderContentBlock from 'javascript/views/blocks/should-render-content-block'

import { isAdmin, hasPermission } from 'javascript/services/user-permissions'

import compose from 'javascript/utils/compose'
import withClientVariables from 'javascript/utils/client-switch/with-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'

import allClientVariables from './variables'
import collectionCardsClientVariables from 'javascript/views/pages/collection/cards.variables'
import contentBlockClientVariables from 'javascript/views/admin/pages/content-blocks/variables'

const ensureContentBlocksHavePlaceholder = (blocks = []) => {
  const contentBlocks = [...blocks]
  if (!contentBlocks.find((block) => block.type === 'content-placeholder')) {
    contentBlocks.unshift({ type: 'content-placeholder' })
  }
  return contentBlocks
}

class CollectionView extends PageHelper {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      pages: [],
      query: {},
      contentBlocks: ensureContentBlocksHavePlaceholder(props.resource['content-blocks']),
      modal: () => {},
    }
  }

  componentWillMount() {
    PageStore.on('change', this.getPages)
  }

  componentWillUnmount() {
    PageStore.removeListener('change', this.getPages)
  }

  componentDidMount() {
    window.scrollTo(0, 0)
    this.getResourcePages()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.resource.slug !== prevProps.resource.slug) {
      this.getResourcePages()
    }
    if (this.props.resource && !Object.keys(this.state.query).length) {
      this.setState({
        query: Object.assign({
          'page[number]': 1,
          'page[size]': 50,
          'sort': this.getSortOrder(this.props.resource['default-order'])
        }, this.props.location.query),
        currentSortOrder: this.props.resource['default-order']
      }, this.getResourcePages)
    }
    if (this.props.resource !== prevProps.resource) {
      this.setState({
        contentBlocks: ensureContentBlocksHavePlaceholder(this.props.resource['content-blocks'])
      })
    }
  }

  addToList = (resources) => () => {
    this.setState({
      modal: () => (
        <Modal
          delay={500}
          ref="modal"
          customContent={true}
          closeEvent={this.unsetModal}
          modifiers={['custom-content']}
        >
          <ListModal resourcesToAddToList={resources} closeEvent={this.unsetModal} user={this.props.user} />
        </Modal>
    )})
    return false
  }

  getSortOrder = (defaultOrder) => {
    const { theme, collectionCV } = this.props
    const sortOption = collectionCV.defaultOrder.find((option) => defaultOrder === option.value)
    return sortOption?.sort
  }

  getResourcePages = () => {
    const query = Object.assign({
      fields: {
        pages: 'title,thumbnail,introduction,slug,published-at,show-in-collection'
      },
      filter: {
        collection_ids: this.props.resource.id
      }
    }, this.state.query)
    PageActions.getResources(query)
  }

  getPages = () => {
    const pages = PageStore.getResources().filter(pg => pg['show-in-collection'])
    this.setState({
      pages,
      loading: false
    })
  }

  filter = (newQuery, pageChange) => {
    this.setState((prevState) => {
      const query = {
        ...prevState.query,
        ...newQuery
      }
      if (!pageChange) {
        query['page[number]'] = 1
      }
      Object.keys(query).map((key) => {
        if (query[key].length < 1) {
          delete query[key]
        }
      })
      return { query }
    }, () => {
      this.getResourcePages()
    })
  }

  renderPlaceholderContent = (isFirstContentBlock) => {
    const { resource, theme, collectionCV, cardsCV } = this.props
    const { pages } = this.state

    let pagesResource = collectionCV.featuredCard ? pages.slice(1, pages.length) : pages
    return (
      <>
        {resource.sortable &&
          <div className={collectionCV.pageControlsSectionClasses}>
            <div className="container">
              <div className={collectionCV.pageControlClasses}>
                <div className="page-controls__right">
                  <div className="page-controls__control">
                    <span>Sort by:</span>
                    <Select
                      searchable={false}
                      options={collectionCV.defaultOrder}
                      value={this.state.currentSortOrder}
                      clearable={false}
                      onChange={(sortOption) => {
                        this.setState({
                          currentSortOrder: sortOption.value
                        })
                        this.filter({ sort: sortOption.sort  })
                      }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        {collectionCV.featuredCard && pages.length && (this.state.query['page[number]'] == 1) && (
          <section className={collectionCV.sectionClasses}>
            <div className="container">
              <Card
                title={pages[0].title}
                description={pages[0].introduction}
                date={pages[0]['published-at']}
                url={`${resource.slug}/${pages[0].slug}`}
                size="large"
                image={{ src: pages[0].thumbnail.url, alt: pages[0].title }}
                classes={['featured']}
              />
            </div>
          </section>
        )}
        <section className={collectionCV.sectionClasses}>
          <div className="container">
            <div className={collectionCV.gridClasses}>
            {pagesResource?.map((page, i) => (
              page.thumbnail ? (
                <ClientProps
                  clientProps={{
                    description: {
                      'default': page.introduction,
                      'ae': resource.title
                    },
                  }}
                  renderProp={(clientProps) => (
                    <Card
                      key={i}
                      title={page.title}
                      size={cardsCV.size}
                      date={page['published-at']}
                      url={`${resource.slug}/${page.slug}`}
                      image={{ src: page.thumbnail.url, alt: page.title }}
                      classes={cardsCV.classes}
                      {...clientProps}
                    />
                  )}
                />
              ) : ( null )
            ))}

            </div>
          </div>
        </section>
      </>
    )
  }

  render() {
    const { resource, theme, collectionCV, contentBlocksCV, user } = this.props
    const meta = resource['meta-datum'] || {}

    if (this.state.loading) {
      return (
        <main>
          <div className="container">
            <div className="loader"></div>
          </div>
        </main>
      )
    }
    return (
      <Meta
        title={meta.title || resource.title}
        meta={{
          description: meta.description || '',
          keywords: meta.keywords || '',
          property: {
            'og:title': theme.localisation.client,
            'og:image': `${window.location.origin}/assets/images/programme-placeholder-retina.jpg`
          }
        }}
      >
        <main className={collectionCV.pageClasses(resource?.title.replace(/[^A-Z0-9]+/ig, "_").toLowerCase())}>
          <div className="fade-on-load">
            <Banner
              title={resource.title}
              classes={collectionCV.bannerClasses}
              image={getBannerImageUrls(resource)}
              copy={collectionCV.showIntroInBanner && resource.introduction}
              textColor={resource['banner-text-color'] || null} />
            <Breadcrumbs
              paths={[{
                name: resource.title,
                url: resource.slug
              }]}
              classes={collectionCV.breadcrumbClasses} />

            { collectionCV.showIntroInPage && resource.introduction &&
              <section className="section">
                <div className="container section__header">
                  <p className="section__copy">{ resource.introduction }</p>
                </div>
              </section>
            }
            {this.state.contentBlocks.map((block, index) => {
              if (block.type === 'content-placeholder') {
                return this.renderPlaceholderContent(index === 0)
              }
              return (
                <ShouldRenderContentBlock
                  block={block}
                  renderBlock={() => (
                    <section key={block.id} className={[block.type !== 'banner-carousel' && 'content-block', block.type, block.background].join(' content-block--')}>
                      <div className={!contentBlocksCV.blocksWithoutContainers.includes(block.type) ? 'container': 'content-block__inner'}>
                        {Blocks(block, { 'page-images': resource['page-images'] }, {
                        user: this.props.user,
                        addToList: this.addToList,
                      })}
                      </div>
                    </section>
                  )}
                />
              )
            })}
            {resource.shareable &&
              <Sharer title={resource.title} />
            }
          </div>
          <AdminToolbar type={'collection'} id={resource.id} user={this.props.user} />
          {this.state.modal()}
        </main>
      </Meta>
    )
  }
}

const enhance = compose(
  withRouter,
  withTheme,
  withClientVariables('cardsCV', collectionCardsClientVariables),
  withClientVariables('contentBlocksCV' ,contentBlockClientVariables),
  withClientVariables('collectionCV', allClientVariables),
)

export default enhance(CollectionView)