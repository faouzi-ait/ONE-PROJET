import React, { useEffect, useMemo, useState, useRef } from 'react'
import pluralize from 'pluralize'
import { RouteComponentProps, withRouter } from 'react-router';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import { capitalize } from 'javascript/utils/generic-tools'
import { isAdmin } from 'javascript/services/user-permissions'
import { reorder } from 'javascript/components/reorderable-list'
import allClientVariables from 'javascript/views/admin/pages/content-blocks/variables'
import compose from 'javascript/utils/compose'
import StylePrefixProvider from 'javascript/utils/style-prefix/style-prefix-provider'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import useSystemPages from 'javascript/utils/hooks/use-system-pages'
import useContentBlockTypes from 'javascript/views/admin/pages/content-blocks/use-content-block-types'
import useUsedImageIdState from 'javascript/views/admin/pages/content-blocks/use-used-image-id-state'
import withModalRenderer, { WithModalType } from 'javascript/components/hoc/with-modal-renderer'
import withTheme, { WithThemeType } from 'javascript/utils/theme/withTheme'
import withUser, { WithUserType } from 'javascript/components/hoc/with-user'

// Components
import Blocks from 'javascript/views/blocks'
import Button from 'javascript/components/button'
import Checkbox from 'javascript/components/custom-checkbox'
import ContentBlockMenuIcons from 'javascript/views/admin/pages/content-blocks/menu-icons'
import Icon from 'javascript/components/icon'
import Modal from 'javascript/components/modal'
import PageHeader from 'javascript/components/admin/layout/page-header'
import SlideToggle from 'javascript/components/slide-toggle'

// Content-Blocks
import AccordionBlockForm from 'javascript/views/admin/pages/content-blocks/forms/accordion'
import AccountManagerBlockForm from 'javascript/views/admin/pages/content-blocks/forms/account-manager'
import BannerCarouselBlockForm from 'javascript/views/admin/pages/content-blocks/forms/banner-carousel'
import BannerScrollerBlockForm from 'javascript/views/admin/pages/content-blocks/forms/banner-scroller'
import CastCrewBlockForm from 'javascript/views/admin/pages/content-blocks/forms/cast-and-crew'
import ContactPersonBlockForm from 'javascript/views/admin/pages/content-blocks/forms/contact-person'
import ContinueWatchingBlockForm from 'javascript/views/admin/pages/content-blocks/forms/continue-watching'
import FeaturedContentGridBlockForm from 'javascript/views/admin/pages/content-blocks/forms/featured-content-grid'
import GalleryBlockForm from 'javascript/views/admin/pages/content-blocks/forms/gallery'
import GenreTagsBlockForm from 'javascript/views/admin/pages/content-blocks/forms/genre-tags'
import HTMLMarkupBlockForm from 'javascript/views/admin/pages/content-blocks/forms/html-markup'
import ImageBlockForm from 'javascript/views/admin/pages/content-blocks/forms/image'
import IntroBlockForm from 'javascript/views/admin/pages/content-blocks/forms/intro'
import LocationsBlockForm from 'javascript/views/admin/pages/content-blocks/forms/locations'
import LogosBlockForm from 'javascript/views/admin/pages/content-blocks/forms/logos'
import MostPopularBlockForm from 'javascript/views/admin/pages/content-blocks/forms/most-popular'
import PeopleBlockForm from 'javascript/views/admin/pages/content-blocks/forms/people'
import PressBlockForm from 'javascript/views/admin/pages/content-blocks/forms/press'
import ProductionCompaniesBlockForm from 'javascript/views/admin/pages/content-blocks/forms/production-companies'
import ProgrammeGrid from 'javascript/views/admin/pages/content-blocks/forms/programme-grid'
import Promo from 'javascript/views/admin/pages/content-blocks/forms/promo'
import PromoCarouselBlockForm from 'javascript/views/admin/pages/content-blocks/forms/promo-carousel'
import QuoteBlockForm from 'javascript/views/admin/pages/content-blocks/forms/quote'
import RecommendedProgrammesBlockForm from 'javascript/views/admin/pages/content-blocks/forms/recommended-programmes'
import RecommendedListBlockForm from 'javascript/views/admin/pages/content-blocks/forms/recommended-list'
import RecommendedGenresBlockForm from 'javascript/views/admin/pages/content-blocks/forms/recommended-genres'
import RelatedPagesBlockForm from 'javascript/views/admin/pages/content-blocks/forms/related-pages'
import ServicesBlockForm from 'javascript/views/admin/pages/content-blocks/forms/services'
import ShorthandBlockForm from 'javascript/views/admin/pages/content-blocks/forms/shorthand'
import StatsBlockForm from 'javascript/views/admin/pages/content-blocks/forms/stats'
import TeamMembersBlockForm from 'javascript/views/admin/pages/content-blocks/forms/team-members'
import TextAndItemsBlockForm from 'javascript/views/admin/pages/content-blocks/forms/text-and-items'
import TextBlockForm from 'javascript/views/admin/pages/content-blocks/forms/text'
import TwitterBlockForm from 'javascript/views/admin/pages/content-blocks/forms/twitter'
import VideoBlockForm from 'javascript/views/admin/pages/content-blocks/forms/video'

import 'stylesheets/core/generic/button'
import { CatalogueType, PageType, ProgrammeType, PassportContentType } from 'javascript/types/ModelTypes'



interface AllowedContentBlockType {
  form: any
  icon: {
    id: string
    height?: string
    viewBox: string
    width?: string
  }
  label?: string
  isBlockAllowed?: ({ theme: ThemeType, user: UserType }) => boolean
}

export interface AllowedContentBlocksType {
  [type: string] : AllowedContentBlockType
}

const availableContentBlocks: AllowedContentBlocksType = {
  'text': {
    form: TextBlockForm,
    icon: {
      id: 'i-cb-text',
      viewBox: '0 0 31 21',
    }
  },
  'text-and-items': {
    form: TextAndItemsBlockForm,
    icon: {
      id: 'i-cb-text-and-items',
      viewBox: '0 0 50.1 29',
    },
    label: 'Text and Items',
  },
  'quote': {
    form: QuoteBlockForm,
    icon: {
      id: 'i-cb-quote',
      viewBox: '0 0 31 29',
    }
  },
  'accordion': {
    form: AccordionBlockForm,
    icon: {
      id: 'i-cb-accordion',
      viewBox: '0 0 37 29',
    }
  },
  'intro': {
    form: IntroBlockForm,
    icon: {
      id: 'i-cb-intro',
      viewBox: '0 0 30 21',
    }
  },
  'services': {
    form: ServicesBlockForm,
    icon: {
      id: 'i-cb-services',
      width: '60px',
      viewBox: '0 0 56 18',
    }
  },
  'stats': {
    form: StatsBlockForm,
    icon: {
      id: 'i-cb-stats',
      width: '51px',
      viewBox: '0 0 51 18',
    }
  },
  'video': {
    form: VideoBlockForm,
    icon: {
      id: 'i-cb-video',
      viewBox: '0 0 36 26',
    }
  },
  'image': {
    form: ImageBlockForm,
    icon: {
      id: 'i-cb-image',
      viewBox: '0 0 36 25',
    }
  },
  'gallery': {
    form: GalleryBlockForm,
    icon: {
      id: 'i-cb-gallery',
      viewBox: '0 0 40 26',
    }
  },
  'genre-tags': {
    form: GenreTagsBlockForm,
    icon: {
      id: 'i-cb-genre-tags',
      viewBox: '0 0 51 28',
    }
  },
  'logos': {
    form: LogosBlockForm,
    icon: {
      id: 'i-cb-logos',
      viewBox: '0 0 34 34',
    },
  },
  'people': {
    form: PeopleBlockForm,
    icon: {
      id: 'i-cb-people',
      viewBox: '0 0 62 30',
    },
  },
  'cast-and-crew': {
    form: CastCrewBlockForm,
    icon: {
      id: 'i-cb-cast-and-crew',
      viewBox: '0 0 62 26',
    },
    label: 'Cast and Crew',
  },
  'locations': {
    form: LocationsBlockForm,
    icon: {
      id: 'i-cb-locations',
      viewBox: '0 0 60 25',
    },
  },
  'production-companies': {
    form: ProductionCompaniesBlockForm,
    icon: {
      id: 'i-cb-production-companies',
      viewBox: '0 0 52 28',

    },
    isBlockAllowed: (props) => props.theme.features.customAttributes.models.includes('ProductionCompany')
  },
  'contact-person': {
    form: ContactPersonBlockForm,
    icon: {
      id: 'i-cb-contact',
      viewBox: '0 0 48 26',
    },
  },
  'related-pages': {
    form: RelatedPagesBlockForm,
    icon: {
      id: 'i-cb-related',
      height: '25px',
      viewBox: '0 0 24 29',
    },
  },
  'promo-carousel': {
    form: PromoCarouselBlockForm,
    icon: {
      id: 'i-cb-promo-carousel',
      viewBox: '0 0 50 25',
    },
  },
  'banner-carousel': {
    form: BannerCarouselBlockForm,
    icon: {
      id: 'i-cb-carousel',
      viewBox: '0 0 52 28',
    },
  },
  'programme-grid': {
    form: ProgrammeGrid,
    icon: {
      id: 'i-cb-programme-grid',
      viewBox: '0 0 52 32',
    },
  },
  'recommended-programmes': {
    form: RecommendedProgrammesBlockForm,
    icon: {
      id: 'i-cb-recommended-programmes',
      viewBox: '0 0 60 26',
    },
  },
  'recommended-list': {
    form: RecommendedListBlockForm,
    icon: {
      id: 'i-cb-recommended-programmes',
      viewBox: '0 0 60 26',
    },
  },
  'account-manager': {
    form: AccountManagerBlockForm,
    icon: {
      id: 'i-cb-account-manager',
      viewBox: '0 0 61 21',
    },
  },
  'continue-watching': {
    form: ContinueWatchingBlockForm,
    icon: {
      id: 'i-cb-continue-watching',
      viewBox: '0 0 58 20',
    },
  },
  'recommended-genres': {
    form: RecommendedGenresBlockForm,
    icon: {
      id: 'i-cb-recommended-genres',
      viewBox: '0 0 58 20',
    },
  },
  'most-popular': {
    form: MostPopularBlockForm,
    icon: {
      id: 'i-cb-most-popular',
      viewBox: '0 0 60 26',
    },
  },
  'promo': {
    form: Promo,
    icon: {
      id: 'i-cb-promo',
      viewBox: '0 0 40 26',
    },
  },
  'press': {
    form: PressBlockForm,
    icon: {
      id: 'i-cb-press',
      viewBox: '0 0 60 22',
    },
  },
  'banner-scroller': {
    form: BannerScrollerBlockForm,
    icon: {
      id: 'i-cb-banner-scroller',
      viewBox: '0 0 52 32',
    },
  },
  'featured-content-grid': {
    form: FeaturedContentGridBlockForm,
    icon: {
      id: 'i-cb-content-grid',
      viewBox: '0 0 40 31',
    },
  },
  'shorthand': {
    form: ShorthandBlockForm,
    icon: {
      id: 'i-cb-text',
      viewBox: '0 0 18 18',
    }
  },
  'twitter': {
    form: TwitterBlockForm,
    icon: {
      id: 'i-cb-twitter',
      viewBox: '0 0 34 26',
    },
  },
  'team-members': {
    form: TeamMembersBlockForm,
    icon: {
      id: 'i-cb-team-member',
      viewBox: '0 0 62 30',
    },
    isBlockAllowed: (props) => props.theme.features.teamMembers
  },
  'html-markup': {
    form: HTMLMarkupBlockForm,
    icon: {
      id: 'i-cb-html',
      viewBox: '0 0 33 24',
    },
    isBlockAllowed: (props) => isAdmin(props.user)
  },
}

export const formatType = (type) => type.split('-').map(capitalize).join(' ')

interface MatchParams {
  id: string
  programme: string
  contentId: string
  marketId?: string
  catalogueId?: string
}

type ResourceType = PageType | ProgrammeType | PassportContentType  | CatalogueType & { title: string }
export type ContentBlockLocationType = 'page' | 'programme' | 'passport' | 'news' | 'collection' | 'customCatalogue'

interface Props extends RouteComponentProps<MatchParams>, WithThemeType, WithModalType, WithUserType {
  blockLocation: ContentBlockLocationType
  isPageHeader: boolean
  pages?: any
  resource: ResourceType
  updateResource: (resource: ResourceType) => void
  includeContentPlaceholder: boolean
}

const ContentBlocks: React.FC<Props> = ({
  blockLocation,
  isPageHeader = true,
  match,
  modalState,
  history,
  pages = null,
  resource,
  theme,
  updateResource,
  user,
  includeContentPlaceholder = false
}) => {

  const usedImageIdState = useUsedImageIdState()
  const { systemPages } = useSystemPages()
  const [contentBlocks, setContentBlocks] = useState([])
  const [reordering, setReordering] = useState(false)
  const [iconBeingDragged, setIconBeingDragged] = useState(false)
  const [contentBeingDragged, setContentBeingDragged] = useState(false)
  const contentBlocksCV = useClientVariables(allClientVariables)
  const { apiConfiguredBlocks } = useContentBlockTypes(blockLocation)

  const allowedContentBlocks = useMemo(() => {
    const blocks = Object.keys(availableContentBlocks).reduce((acc, curr) => {
      if (apiConfiguredBlocks.includes(curr)) {
        return {...acc, [curr]: availableContentBlocks[curr]}
      }
      return acc
    }, {})
    return Object.keys(blocks).reduce((acc, type) => {
      const block = blocks[type]
      const blockAllowed = !(block.isBlockAllowed && !block.isBlockAllowed({ theme, user }))
      if (blockAllowed) {
        acc[type] = block
      }
      return acc
    }, {})

  }, [apiConfiguredBlocks, blockLocation])

  useEffect(() => {
    if (resource) {
      const { contentBlocks, alreadyExists } = ensureContentPlaceholderExists()
      if (alreadyExists) {
        usedImageIdState.setUsedImageIds({
          type: blockLocation,
          resourceId: resource.id,
          contentBlocks
        })
        setContentBlocks(
          contentBlocks.map((block) => ({
            ...block,
            expandedView: false
          }))
        )
      }
    }
  }, [resource])

  const ensureContentPlaceholderExists = () => {
    let alreadyExists = true
    const blocks = resource['content-blocks'] || []
    if (includeContentPlaceholder && !blocks.find((block) => block.type === 'content-placeholder')) {
      alreadyExists = false
      saveBlock({
        type: 'content-placeholder',
        placeholderType: ['pages', 'catalogues'].includes(resource.type) ? 'catalogue' : 'collection'
      }, null, 0)
    }
    return {
      contentBlocks: blocks,
      alreadyExists
    }
  }

  const saveBlock = (block, index, insertIndex) => {
    const resourceUpdate = { ...resource }
    delete resourceUpdate['page-images']
    const blocks = [...contentBlocks]
    if (typeof insertIndex === 'number') {
      blocks.splice(insertIndex, 0, block)
    } else {
      if (index > -1) {
        blocks.splice(index, 1, block)
      } else {
        blocks.push(block)
      }
    }
    const contentBlocksUpdate = blocks.map((block, id) => {
      const update = {
        ...block,
        id
      }
      delete update.expandedView
      return update
    })

    updateResource({
      ...resourceUpdate,
      'content-blocks': contentBlocksUpdate
    })

    usedImageIdState.setUsedImageIds({
      type: blockLocation,
      resourceId: resource.id,
      contentBlocks: contentBlocksUpdate
    })
  }

  const newContentBlock = (type, insertIndex) => {
    const Component = allowedContentBlocks[type].form
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          modifiers={['large']}
          closeEvent={hideModal}
          title={`New ${formatType(type)} Block`}
          titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}>
          <div className="cms-modal__content">
            <Component type={blockLocation}
              onSubmit={(block, index) => {
                saveBlock({ ...block, published: false}, index, insertIndex)
              }}
              {...specificBlockLocationProps()}
            />
          </div>
        </Modal>
      )
    })
  }

  const specificBlockLocationProps = () => {
    switch (blockLocation) {
      case 'passport': {
        return {
          id: match.params.contentId,
          noImages: true,
        }
      }
      case 'programme': {
        return {
          id: match.params.programme,
        }
      }
      case 'collection':
      case 'news': {
        return {
          id: resource.id,
        }
      }
      case 'customCatalogue': {
        return {
          id: match.params.catalogueId,
        }
      }
      default: { //'page'
        return {
          id: match.params.id,
          pages,
        }
      }
    }
  }

  const editBlock = (block, index) => {
    const Component = allowedContentBlocks[block.type].form
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal
          modifiers={['large']}
          closeEvent={hideModal}
          title={`Edit ${formatType(block.type)} Block`}>
          <div className="cms-modal__content">
            <Component type={blockLocation} index={index}
              block={block}
              onSubmit={saveBlock}
              {...specificBlockLocationProps()}
            />
          </div>
        </Modal>
      )
    })
  }

  const confirmBlockDeletion = (block, index) => {
    modalState.showModal(({ hideModal }) => {
      return (
        <Modal closeEvent={hideModal} title="Warning" modifiers={['warning']} titleIcon={{ id: 'i-admin-warn', width: 31, height: 27 }} >
          <div className="cms-modal__content">
            <div className="cms-form__control u-align-center">
              <p>Are you sure you wish to delete this {block.type.replace('-', ' ')} block?</p>
            </div>
            <div className="cms-form__control cms-form__control--actions">
              <Button type="button" className="button button--reversed" onClick={hideModal}>Cancel</Button>
              <Button type="button" className="button button--filled button--reversed" onClick={() => { deleteBlock(index) }}>Yes, Delete!</Button>
            </div>
          </div>
        </Modal>
      )
    })
  }

  const deleteBlock = (index) => {
    const blocks = [...contentBlocks]
    blocks.splice(index, 1)
    setContentBlocks(blocks)
    updateResource({
      ...resource,
      'content-blocks': blocks
    })
  }

  const publishBlock = (index, isPublished) => {
    const blocks = [...contentBlocks]
    blocks[index].published = isPublished
    setContentBlocks(blocks)
    updateResource({
      ...resource,
      'content-blocks': blocks
    })
  }

  const renderPageHeaderActions = () => {
    const resourceTitle = resource && (resource['title'] || resource['name'])
    return (
      <PageHeader title={`Manage Content for ${resourceTitle || '...'}`} />
    )
  }

  const renderPageContentActions = () => {
    return (
      <div className="container" style={{ paddingTop: '45px'}}>
        <div className="cms-form__title grid grid--two">
          <h3>{
            //@ts-ignore
            resource.title || 'Content Blocks'
          }</h3>
        </div>
      </div>
    )
  }

  const renderBlock = (block, index, reordering = false) => {
    if (!resource || block.pageType !== resource['content-blocks'][index]?.pageType) {
      return null //do not render - contentBlocks is stale data (useEffect still running)
    }

    const bgImage = block.bgImage && resource['page-images'] ? resource['page-images'].find(i => i.id === block.bgImage.id) : null
    const titleText = block.title ? ` - ( ${block.title} )` : ''
    const blockClasses = block.expandedView ? 'mock-page__block mock-page__block--expanded' : 'mock-page__block'
    return (
      <div
        className={blockClasses}
        key={block.id}
      >
        <div className={contentBlocksCV.mockPageWrapperClass}>
            <div className="mock-page__actions">
              <span className="mock-page__label">{`${capitalize(block.type.replace(/-/g, ' '))}${reordering ? titleText : ''}`}</span>
              {((block.type !== 'html-markup' || isAdmin(user)) && (block.type !== 'content-placeholder')) &&
                <>
                  { theme.features.contentBlocks.draftBlocks && (
                    <>
                      <Checkbox radio
                        key={`${block.id}_draft`}
                        label={'Draft'}
                        value={'draft'}
                        id={`${block.id}_draft`}
                        onChange={() => publishBlock(index, false)}
                        checked={block.hasOwnProperty('published') ? !block.published : false}
                      />
                      <Checkbox radio
                        key={`${block.id}_publish`}
                        label={'Published'}
                        id={`${block.id}_publish`}
                        value={'publish'}
                        onChange={() => publishBlock(index, true)}
                        checked={block.hasOwnProperty('published') ? block.published : true}
                      />
                    </>
                  )}
                  <Button className="button button--smallest button--filled" onClick={() => { editBlock(block, index) }}>Edit</Button>
                  <Button className="button button--smallest button--error" onClick={() => { confirmBlockDeletion(block, index) }}>Delete</Button>
                </>
              }
            </div>
          {(!reordering || block.expandedView) &&
            <StylePrefixProvider entryPoint={'application'} >
              { block.loggedInUserRequired && (
                <div className="mock-page__warning">** This block will display for logged in users only **</div>
              )}
              <section className={contentBlocksCV.sectionClasses(block)} style={block.background === 'image' && bgImage ? {
                backgroundImage: `url(${bgImage.file.url.replace('.net/', `.net/${contentBlocksCV.backgroundSize}/`)})`
              } : null}>
                <div className={(block.type !== 'html-markup' && block.type !== 'banner-carousel' && block.type !== 'promo-carousel' && (block.type !== 'related-pages') && (block.type !== 'banner-scroller')) ? 'container' : 'content-block__inner'}>
                  {Blocks(block, {
                      'page-images': resource['page-images'],
                    }, {
                      dragged: reordering,
                      adminMode: true
                    },
                  )}
                </div>
              </section>
            </StylePrefixProvider>
          }
        </div>
      </div>
    )
  }

  const onDragEnd = (result) => {
    // dropped outside the list
    setIconBeingDragged(false)
    setContentBeingDragged(false)
    if (!result.destination) {
      return
    }
    if (result.source.droppableId === 'droppable-content-icons') {
      return newContentBlock(result.draggableId, result.destination.index)
    }
    const updatedBlocks = reorder(
      contentBlocks,
      result.source.index,
      result.destination.index,
    )
    setContentBlocks(updatedBlocks)
    updateResource({
      ...resource,
      'content-blocks': updatedBlocks
    })
  }

  const pageClasses = reordering ? 'mock-page mock-page--dragging custom' : 'mock-page custom'
  let returnPath = '/admin'
  let returnName =  '...'


  switch (blockLocation) {
    case 'page':
    case 'collection': {
      returnPath = '/admin/pages'
      returnName = 'Pages'
      //@ts-ignore
      const sPg = systemPages.hasOwnCmsPath(resource?.slug)
      if (sPg) {
        returnPath = `/admin/${sPg.localisation.path}`
        returnName = sPg.localisation.upper
      }
      break
    }
    case 'passport': {
      returnPath = `/admin/${theme.localisation.passport.market.path}/${match.params.marketId}`
      returnName = theme.localisation.passport.market.upper
      break
    }
    case 'programme': {
      returnPath = `/admin/${theme.localisation.programme.path}`
      returnName = pluralize(theme.localisation.programme.upper)
      break
    }
    case 'news': {
      returnPath = `/admin/${theme.localisation.news.path}`
      returnName = theme.localisation.news.upper
      break
    }
    case 'customCatalogue': {
      returnPath = `/admin/${theme.localisation.catalogue.path}`
      returnName = pluralize(theme.localisation.catalogue.upper)
      break
    }
  }

  const menuPanel = useRef()
  const fixMenuIcons = () => {
    // switching between absolute and fixed here as `react-beautiful-dnd` does not handle Droppable with fixed (breaks autoscroll)
    // but want fixed for scrolling purposes, i.e. no jitter
    let isScrolling = false
    let timer
    return (e) => {
      if (!isScrolling) {
        isScrolling = true
        if (menuPanel.current) {
          //@ts-ignore
          menuPanel.current.style.top = '60px'
          //@ts-ignore
          menuPanel.current.style.position = 'fixed'
        }
      }
      clearTimeout(timer)
      timer = setTimeout(() => {
        isScrolling = false
        if (menuPanel.current) {
          //@ts-ignore
          menuPanel.current.style.top = `${window.scrollY + 60}px`
          //@ts-ignore
          menuPanel.current.style.position = 'absolute'
        }
      }, 300)
    }
  }
  window.addEventListener('scroll', fixMenuIcons())

  const [viewTimer, setViewTimer] = useState<any>()

  return (
    <>
      { isPageHeader ? renderPageHeaderActions() : renderPageContentActions() }
      <div className="container">
        <SlideToggle identifier="reordering" off="Reorder" onChange={e => {
          setReordering(e.target.checked)
        }} checked={reordering} />
      </div>
      <div className={pageClasses}>
        <DragDropContext onDragEnd={onDragEnd} onDragStart={(e) => {
          if (e.source.droppableId === 'droppable-content-icons') {
            setIconBeingDragged(e.draggableId)
          } else {
            setContentBeingDragged(true)
          }
        }}>
          <div className="content-blocks-sub-nav" ref={menuPanel}>
            <div className="sub-navigation__item" >
                <Icon id="i-left-arrow" classes="sub-navigation__arrow"/>
                <span
                  className="sub-navigation__link sub-navigation__link--with-icon"
                  onClick={() => history.push(returnPath)}
                >
                  { `Back to ${returnName}` }
                </span>
            </div>
            <Droppable droppableId="droppable-content-icons" isDropDisabled={true} >
              {(provided, snapshot) => (
                <ContentBlockMenuIcons
                  provided={provided}
                  snapshot={snapshot}
                  iconBeingDragged={iconBeingDragged}
                  allowedContentBlocks={allowedContentBlocks}
                />
              )}
            </Droppable>
          </div>
          <Droppable droppableId="droppable-content-blocks">
            {(provided, snapshot) => {
              return (
              <div className={iconBeingDragged && 'content-blocks-sub-nav__content-blocks-autoscrolling'}
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  ...provided.droppableProps.style,
                  ...(reordering && { backgroundColor: 'black'}),
                }}
              >
                {contentBlocks.length === 0 ? (
                  <div className="content-block__empty-dropzone">
                    Drag and drop new content blocks here.
                  </div>
                ) : (
                  <>
                    {contentBlocks.map((block, index) => {
                      return (
                        <>
                          <Draggable key={block.id} draggableId={block.id.toString()} index={index} isDragDisabled={!reordering} >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                }}
                              >
                                {renderBlock(block, index, reordering)}
                              </div>
                            )}
                          </Draggable>
                          {reordering && !contentBeingDragged &&
                            <div className="mock-page__expand">
                              {!block.expandedView &&
                                <Button className="button button--icon button--smallest" onClick={() => {
                                  setContentBlocks((contentBlocks) =>
                                    contentBlocks.map((contentBlock) => {
                                      if (contentBlock.id === block.id) {
                                        return {
                                          ...contentBlock,
                                          expandedView: !contentBlock.expandedView
                                        }
                                      }
                                      return contentBlock
                                    })
                                  )
                                  clearTimeout(viewTimer)
                                  setViewTimer(setTimeout(() => {
                                    setContentBlocks((contentBlocks) => contentBlocks.map((block) => ({
                                      ...block,
                                      expandedView: false
                                    })))
                                  }, 1500))
                                }}>
                                  <Icon id="i-view-eye" />
                                </Button>
                              }
                            </div>
                          }
                        </>
                      )
                    })}
                  </>
                )}

                {provided.placeholder}
              </div>
            )}}
          </Droppable>
        </DragDropContext>
      </div>
    </>
  )
}

const enhance = compose(
  withRouter,
  withTheme,
  withUser,
  withModalRenderer,
)

export default enhance(ContentBlocks)