/* eslint-disable no-dupe-keys, react/jsx-no-duplicate-props */
import React, { useEffect, useMemo, useState } from 'react'

import { imageDimensions } from 'javascript/utils/generic-tools'
import allClientVariables from 'javascript/views/blocks/_banner-carousel/variables'
// Components
import Carousel from 'javascript/components/carousel'
import Banner, { getBannerImageUrls } from 'javascript/components/banner'
import Icon from 'javascript/components/icon'
import { BannerCarouselBlock } from 'javascript/views/admin/pages/content-blocks/forms/banner-carousel'
import { BlockFunction } from 'javascript/views/blocks/types/BlockFunction'
import NavLink from 'javascript/components/nav-link'
// State
import ProgrammesStore from 'javascript/stores/programmes'
import ProgrammeActions from 'javascript/actions/programmes'
// Types
import { ProgrammeType, PageImageType } from 'javascript/types/ModelTypes'
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
// HOC
import compose from 'javascript/utils/compose'
import withTheme from 'javascript/utils/theme/withTheme'
import useClientVariables from 'javascript/utils/client-switch/use-client-variables'
import ClientSpecific from 'javascript/utils/client-switch/components/client-choice/client-specific'
import ClientProps from 'javascript/utils/client-switch/components/client-props'
import getProgrammePath from 'javascript/utils/helper-functions/get-programme-path'

const BlockBannerCarousel: BlockFunction<Props['block']> = (
  block,
  assets,
  props,
) => {
  return (
    <EnhancedBannerCarouselComponent
      block={block}
      assets={assets}
      adminMode={props.adminMode}
    />
  )
}

export default BlockBannerCarousel


const getProgrammeIds = (block: Props['block']) =>
  block.slides.filter(s => s.type === 'programme').map(s => s.programme.id)

const BannerCarouselComponent: React.FC<Props> = ({
  assets,
  block,
  adminMode,
  theme,
}) => {
  const bannerCarouselCV = useClientVariables(allClientVariables)
  const programmeIds = useMemo(() => getProgrammeIds(block), [block])
  const { resources } = useDataFetching(bannerCarouselCV, { programmeIds, theme })
  const [active, setActive] = useState<number>(0)

  const renderGenres = (programme) => {
    return programme?.genres?.filter(g => !g['parent-id'])
      .map(g => g.name.replace(/[^A-Z0-9]+/ig, "_")) || null
  }

  const renderDuration = (programme) => {
    return programme?.['custom-attributes']?.filter(i => i['custom-attribute-type'].name.toLowerCase() === 'duration')
      .map(i => i.value) || null
  }

  const renderCatalogues = (programme) => {
    return programme?.catalogues?.map(g => g.name.replace(/[^A-Z0-9]+/ig, "_")) || null
  }

  const renderTags = (programme) => {
    let tags = []
    bannerCarouselCV.tagsOrder.map((tagName) => {
      const update = contentMap[tagName](programme)
      if(update) {
        tags.push(...update)
      }
    })
    tags.filter(a => {return a?.length > 0 })
    return tags
  }

  const contentMap = {
    'genres': (programme) => renderGenres(programme),
    'duration': (programme) => renderDuration(programme),
    'catalogues': (programme) => renderCatalogues(programme)
  }


  return (
    <Carousel
      options={bannerCarouselCV.carouselOptionsDefault(block.items || 1)}
      responsive={[
        {
          breakpoint: 1450,
          options: bannerCarouselCV.carouselOptionsLarge,
        },
        {
          breakpoint: 1024,
          options: bannerCarouselCV.carouselOptionsMedium(block.items || 1),
        },
        {
          breakpoint: 768,
          options: bannerCarouselCV.carouselOptionsSmall
        },
      ]}
      classes={['no-spacing', 'fixed-dots', `${block.items}-items`]}
      onChange={setActive}
      auto={!adminMode && (block.items === 1 && theme.features.videos.videoBanners ? !block.slides.some(slide=> slide.video?.video) : true) && block.rotationTime}
    >
      {block.slides
        .filter(slide => {
          if (slide.type !== 'programme') {
            return true
          }
          return resources.find(r => r.id === slide.programme.id)
        })
        .map((slide, index) => {
          const programme = slide.programme
          ? resources.find(r => r.id === slide.programme.id)
          : null
          let bannerImage
          const customSlide = (assets['page-images'] || []).find(d => slide.imageIds.includes(d.id))
          if (customSlide) {
            // This is custom code to inject sizes for page-images
            // This allows <Banner> to render the page-image versions as though they are built from image-cropper
            const pageImageUrl = customSlide.file.url
            const bannerPageImages = Object.keys(bannerCarouselCV.pageImageSizes).reduce((bannerImgObj, size) => {
              let normalSize = bannerCarouselCV.pageImageSizes[size]
              const { width, height } = imageDimensions.parse(normalSize)
              let retinaSize = `${width*2}x${height*2}`
              if(block.items > 1){
                let widthPerItem = Math.ceil(width/block.items)
                if(size === 'medium' || size === 'small') {
                  const mediumOptions = bannerCarouselCV.carouselOptionsMedium(block.items || 1)
                  widthPerItem = Math.ceil(width/mediumOptions.slidesToShow)
                }
                normalSize = `${widthPerItem}x${height}`
                retinaSize = `${widthPerItem*2}x${height*2}`
              }
              bannerImgObj[size] = {
                normal: pageImageUrl.replace('.net/', `.net/${normalSize}/`),
                retina: pageImageUrl.replace('.net/', `.net/${retinaSize}/`),
              }
              return bannerImgObj
            }, {})
            bannerImage = {
              default: bannerPageImages
            }
          } else {
            bannerImage = getBannerImageUrls(programme)
          }

          const logo = (assets['page-images'] || []).find(
            d => slide.logoIds && slide.logoIds.includes(d.id),
          )

          const programmeLink = programme && `/${theme.variables.SystemPages.catalogue.path}/${getProgrammePath(programme, theme)}`

          return (<ClientProps
            clientProps={{
              logo: {
                'default': block.items === 1 ? ((bannerCarouselCV.showLogo && logo?.file?.url) || programme?.logo?.url) : null,
                'cineflix': null
              },
              title: {
                default: slide.title || programme && programme.title,
                'cineflix': slide.title
              },
              copy: {
                default: slide.intro || programme && programme.introduction,
                'cineflix': slide.intro
              }
            }}
            renderProp={(clientProps) => (
              <Banner
                image={bannerImage}
                key={index}
                textColor={slide.textColor}
                static={true}
                shouldShowVideo={active === index}
                video={
                  theme.features.videos.videoBanners && !adminMode && block.items === 1
                    ? (slide.video || { video: null }).video
                    : undefined
                }
                clickable={slide.clickable && (programme ? programmeLink : slide.buttonUrl)}
                classes={bannerCarouselCV.bannerClasses(programme)}
                tags={renderTags(programme)}
                {...clientProps}
                programme={
                  (programme && bannerCarouselCV.showProgrammeDetails)
                    ? () => (
                        <>
                          <div className="banner__programme-genres">
                            {programme &&
                              programme.genres &&
                              programme.genres
                                .filter(g => !g['parent-id'])
                                .map(g => (
                                  <span className="tag" key={g.id}>
                                    {g.name}
                                  </span>
                                ))}
                          </div>
                          {programme?.logo?.url ? (
                            <NavLink
                              class="banner__programme-link"
                              to={programmeLink}
                            >
                              <img
                                src={programme.logo.url}
                                alt={`${programme.title} logo`}
                                className="banner__logo"
                              />
                            </NavLink>
                          ) : (
                            <p className="banner__programme-title">
                                <NavLink
                                  className="banner__programme-link"
                                  to={programmeLink}
                                >
                                  {programme.title}
                                </NavLink>
                              </p>
                            )}
                          </>
                        )
                      : null
                  }
                >
                  {(slide.buttonUrl || programme) && slide.buttonCopy && !slide.clickable && (
                    <a href={slide.buttonUrl || programme && programmeLink} className={bannerCarouselCV.slideButtonClasses}>
                      <ClientSpecific client="fremantle">
                        <Icon width="32" height="32" id="i-info" classes="button__icon" />
                      </ClientSpecific>
                      {slide.buttonCopy}
                    </a>
                  )}
                </Banner>
            )} />
          )
        })}
    </Carousel>
  )
}


const enhance = compose(
  withTheme
)
const EnhancedBannerCarouselComponent = enhance(BannerCarouselComponent)

interface DataFetchingProps {
  programmeIds: string[]
  theme: CustomThemeType
}

const useDataFetching = (bannerCarouselCV, { programmeIds, theme }: DataFetchingProps) => {
  useEffect(() => {
    ProgrammesStore.on('dataChange', setResources)
    return () => ProgrammesStore.removeListener('dataChange', setResources)
  })

  const [resources, updateResources] = useState<ProgrammeType[]>([])

  const setResources = () => {
    updateResources(ProgrammesStore.getDataResources(programmeIds))
  }

  useEffect(() => {
    const programmes = [
      'title,genres,banner-urls,introduction',
      theme.features?.programmeOverview?.logoTitleBanner && 'logo',
    ]
    const includes =  ['genres']
    const fields = {
      genres: 'name,parent-id',
    }

    if(bannerCarouselCV.tagsOrder.includes('duration')) {
      programmes.push('custom-attributes')
      includes.push('custom-attributes,custom-attributes.custom-attribute-type')
      fields['custom-attributes'] = 'custom-attribute-type,value,position'
    }

    if(bannerCarouselCV.tagsOrder.includes('catalogues')) {
      programmes.push('catalogues')
      includes.push('catalogues')
      fields['catalogues'] = 'name'
    }

    if (programmeIds.length > 0) {
      ProgrammeActions.getDataResources({
        filter: {
          ids: programmeIds.join(',')
        },
        include: includes.join(','),
        fields: {
          ...fields,
          programmes: programmes.filter(Boolean).join(',')
        }
      })
    }
  }, [])
  return { resources }
}

interface Props {
  block: BannerCarouselBlock
  assets: {
    'page-images': PageImageType[]
  }
  adminMode: boolean
  theme: CustomThemeType
}
