import React from 'react'

// Components
import Blocks from 'javascript/views/blocks/index'
import Cards from 'javascript/views/blocks/_related-pages-cards'
import CarouselBlock from 'javascript/views/blocks/_carousel'
import Components from 'javascript/components/index'
import { NavLink } from 'react-router-dom'
import Icon from 'javascript/components/icon'

import { BlockFunction } from 'javascript/views/blocks/types/BlockFunction'
import { PageImageType } from 'javascript/types/ModelTypes'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'

import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import contentBlocksClientVariables from 'javascript/views/blocks/variables'
import relatedPagesClientVariables from './variables'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import useTheme from 'javascript/utils/theme/useTheme'


const RelatedPagesBlock: BlockFunction<Props['block']> = (
  block,
  assets,
  props,
) => {
  return (
    <RelatedPages
      block={block}
      assets={assets}
      {...props}
    />
  )
}

export default RelatedPagesBlock

const renderCards = (block: Props['block'], assets: Props['assets']) => {
  const Component = Components[block.pageType.charAt(0).toUpperCase() + block.pageType.slice(1)]
  if (block.pageType === 'pages' || block.pageType === 'programmes') {
    return <Component ids={block.pages.map(p => p.resource.id)} render={CarouselBlock(block)} />
  } else {
    return <Cards block={block} assets={assets} render={CarouselBlock(block)} />
  }
}

const RelatedPages: BlockFunction<Props['block']> = ({
  assets,
  block,
  props
}) => {
  const { variables } = useTheme()
  const contentBlocksCV = useClientVariables(contentBlocksClientVariables)
  const relatedPagesCV = useClientVariables(relatedPagesClientVariables, {
    carouselItems : {
      default: block.numberOfItems || 4,
      'all3': block.pageType === 'programmes' ? 3 : 4,
      'banijaygroup | endeavor': 3,
      'keshet': block.bgImage && block.bgImage.id ? 3 : 4
    }
  })

  const renderButton = () => {
    const newsPath = block.category ? `/${variables.SystemPages.news.path}?category=${block.category}` : `/${variables.SystemPages.news.path}`
    const actionLink = block.pageType === 'news' ? newsPath : block.actionLink
    return (
      <NavLink to={actionLink} className={contentBlocksCV.headingButtonClasses}>
        <span>View all</span>
        <ClientSpecific client="ae">
          <Icon id="i-right-long-arrow" className="button__icon"/>
        </ClientSpecific>
      </NavLink>
    )
  }

  const extendedBlock = {
    ...block,
    programmeCarouselItems: relatedPagesCV.carouselItems,
    carouselMediumBreakpoint: relatedPagesCV.carouselMediumBreakpoint
  }

  return (
    <div className={!block.carousel ? 'container' : ''}>
      {block.title && (
        <div className={block.carousel ? 'container' : ''}>

          <h2 className="content-block__heading">
            <span>{block.title}</span>
            {relatedPagesCV.showButtonWithTitle && block.actionLink &&
              renderButton()
            }
          </h2>

          {relatedPagesCV.showIntro && block.intro &&
            <p className="content-block__intro">{block.intro}</p>
          }

        </div>
      )}

      {relatedPagesCV.showIntro && block.intro && !block.title &&
        <p className="content-block__intro">{block.intro}</p>
      }

      {(block.carousel) ? (
        renderCards(extendedBlock, assets)
      ) : (
          Blocks({
            ...block,
            type: block.pageType,
            numberOfItems: relatedPagesCV.carouselItems
          }, assets, props)
        )
      }

      {!relatedPagesCV.showButtonWithTitle && block.actionLink &&
        <div className="content-block__actions">
          {renderButton()}
        </div>
      }

    </div>
  )
}

interface Props {
  block: any
  assets: {
    'page-images': PageImageType[]
  }
  adminMode: boolean
  theme: CustomThemeType,
}
