import React, { useEffect } from 'react'
import { NavLink, withRouter } from 'react-router-dom'
// Components
import { BlockFunction } from 'javascript/views/blocks/types/BlockFunction'
import Carousel from 'javascript/components/carousel'
import { OnMouseOverWatcher } from 'javascript/components/video-card/useOnMouseOverWatcher'
import Programmes, { ProgrammesComponentProps} from 'javascript/components/cards/programmes'
import { PromoCarouselBlock } from 'javascript/views/admin/pages/content-blocks/forms/promo-carousel'
import Tabs from 'javascript/components/tabs'
import VideoCard from 'javascript/components/video-card'
import Icon from 'javascript/components/icon'
// HOC
import allClientVariables from './variables'
import cardClientVariables from 'javascript/components/card/variables'
import compose from 'javascript/utils/compose'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import withTheme from 'javascript/utils/theme/withTheme'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
// Images
// @ts-ignore
import logo from 'images/theme/logo-footer.svg'
//Types
import { UserType, ProgrammeType } from 'javascript/types/ModelTypes'
import useEnumApiLogic from 'javascript/utils/hooks/use-enum-api-logic'
import { findAllByModel } from 'javascript/utils/apiMethods'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

const titleSlide = tab => (
  <div className="carousel__cta" key="title-slide">
    <h3 className="carousel__heading">{tab.title}</h3>
    {tab.buttonText && tab.buttonLink && (
      <div className="content-block__actions">
        <NavLink
          className="button button--ghost-white button--small"
          to={tab.buttonLink}
        >
          {tab.buttonText}
        </NavLink>
      </div>
    )}
  </div>
)

interface Props {
  user?: UserType
  addToList?: ProgrammesComponentProps['addToList']
  actionLink?: string
}

const PromoCarousel: BlockFunction<PromoCarouselBlock, Props> = (
  block,
  assets,
  props = {},
) => {
  return <EnhancedPromoCarouselView {...props} block={block} />
}

const PromoCarouselView = ({ block, history, theme, ...props }) => {
  const promoCarouselCV = useClientVariables(allClientVariables)
  const cardCV = useClientVariables(cardClientVariables)

  const tabs: PromoCarouselBlock['tabs'] = block.tabs
  const programmeIds = Array.from(
    tabs.reduce((set, tab) => {
      if (tab.programmes && tab.type === 'video-carousel') {
        tab.programmes.forEach(p => set.add(p.id))
      }
      return set
    }, new Set<number>()),
  )

  const programmesForVideoCarousel = useEnumApiLogic()

  const renderButton = (tab) => (
    <NavLink className={promoCarouselCV.viewAllButtonClasses} to={tab.buttonLink}>
      <span>{tab.buttonText}</span>
      <ClientSpecific client="ae">
        <Icon id="i-right-long-arrow" className="button__icon"/>
      </ClientSpecific>
    </NavLink>
  )

  useEffect(() => {
    if (programmeIds.length === 0) {
      return
    }
    programmesForVideoCarousel.reportStarted()
    findAllByModel('programmes', {
      filter: {
        ids: programmeIds.join(),
      },
      fields: ['title', 'thumbnail'],
    })
      .then(programmesForVideoCarousel.reportFulfilled)
      .catch(programmesForVideoCarousel.reportError)
  }, [])

  return (
    <div>
      {block.title && (
        <div className="container">
          <h2 className="content-block__heading">{block.title}</h2>
        </div>
      )}

      <Tabs>
        {tabs.map((tab, i) => (
          <div className="content-block__main" title={tab.title} key={i}>
            {(promoCarouselCV.showButtonWithTabTitle && tabs.length === 1) && (
              <div className="container">
                <h2 className="content-block__heading">
                  <span>{tab.title}</span>
                  {tab.buttonText && tab.buttonLink && (
                    renderButton(tab)
                  )}
                </h2>
              </div>
            )}
            {(tab.type !== 'video-carousel' || !theme.features.videos.promoCarousel) && (
              <ClientProps
                clientProps={{
                  isProgrammeComponent: {
                    'default': false,
                    'all3': true
                  },
                  showTitleInCarousel: {
                    default: false,
                    'drg': true
                  }
                }}
                renderProp={(clientProps) => (
                  <Programmes
                    ids={tab.programmes.map(p => p.id)}
                    user={props.user}
                    addToList={props.addToList}
                    programmeComponent={clientProps.isProgrammeComponent}
                    fullWidth={promoCarouselCV.sizeOption && block.numberOfItems === 1}
                    render={children => {

                      if(clientProps.showTitleInCarousel){
                        const slides = children
                        slides.unshift(titleSlide(tab))
                      }

                      return (
                        <Carousel {...makeCarouselProps(block, promoCarouselCV)}>
                          {children}
                        </Carousel>
                      )
                    }}
                  />
                )}
              />
            )}
            {tab.type === 'video-carousel' && theme.features.videos.promoCarousel && (
              <OnMouseOverWatcher mouseOutDelay={150} mouseOverDelay={500}>
                {({
                  isThisIndexHovering,
                  makeOnMouseMoveFromIndex,
                  areAnyHovering,
                  makeOnMouseOut,
                  makeOnMouseOver,
                  makeShouldTrackMouseMoves,
                }) => (
                  <Carousel {...makeCarouselProps(block, promoCarouselCV)} allowOverflow>
                    {tab.programmes.map(staleProgramme => {
                      const programme =
                        programmesForVideoCarousel.state.data?.find(
                          p => p.id === staleProgramme.id,
                        ) as ProgrammeType || staleProgramme
                      const video = (staleProgramme.video || {} || {}).video
                      return (
                        <VideoCard
                          shouldTrackMouseMoves={makeShouldTrackMouseMoves(
                            programme.id,
                          )}
                          onMouseOver={makeOnMouseOver(programme.id)}
                          onMouseOut={makeOnMouseOut(programme.id)}
                          makeOnMouseMoveFromElement={makeOnMouseMoveFromIndex(
                            programme.id,
                          )}
                          isHovering={isThisIndexHovering(programme.id)}
                          areAnyHovering={areAnyHovering}
                          key={programme.id}
                          onClick={() => history.push(`/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(programme, theme)}`)}
                          image={(programme.thumbnail?.url || '').replace('.net/', `.net/${cardCV.mediumImageX}x${cardCV.mediumImageY}/`)}
                          video={!video?.['wistia-id'] && video}
                          programme={programme}
                        ></VideoCard>
                      )
                    })}
                  </Carousel>
                )}
              </OnMouseOverWatcher>
            )}

            {(!promoCarouselCV.showButtonWithTabTitle || (promoCarouselCV.showButtonWithTabTitle && tabs.length > 1)) && tab.buttonText && tab.buttonLink &&
              <div className="container">
                <div className={promoCarouselCV.actionClasses}>
                  {renderButton(tab)}
                </div>
              </div>
            }
          </div>
        ))}
      </Tabs>
    </div>
  )
}

const enhance = compose(
  withRouter,
  withTheme
)
const EnhancedPromoCarouselView = enhance(PromoCarouselView)

const makeCarouselProps = (block: PromoCarouselBlock, promoCarouselCV: any) => ({
  responsive: [
    {
      breakpoint: promoCarouselCV.carouselBreakpointLarge,
      options: promoCarouselCV.carouselOptionsLarge
    },
    {
      breakpoint: promoCarouselCV.carouselBreakpointMedium,
      options: promoCarouselCV.carouselOptionsMedium(promoCarouselCV.sizeOption ? block.numberOfItems : null)
    },
    {
      breakpoint: promoCarouselCV.carouselBreakpointSmall,
      options: promoCarouselCV.carouselOptionsSmall
    },
  ],
  options: {
    ...promoCarouselCV.carouselOptionsDefault(promoCarouselCV.sizeOption ? block.numberOfItems : null),
    dots: block.dots,
    arrows: block.arrows,
    scrollBar: block.scrollBar,
    pager: block.pager,
  },
  classes: [`${block.numberOfItems}-items`]
})

export default PromoCarousel
