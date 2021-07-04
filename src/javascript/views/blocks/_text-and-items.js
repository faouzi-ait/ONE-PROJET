import React from 'react'

// Components
import Blocks from 'javascript/views/blocks/index'
import Carousel from 'javascript/components/carousel'
import Card from 'javascript/components/card'

export default (block, assets, props) => {
  const classes = ['content-block__media', block.mediaPos, block.media].join(' content-block__media--')
  return (
    <div>
      <div className="content-block--text">
        <div className="container">
          <div className={ (block.media === 'video' || block.media === 'image') && 'grid grid--two' }>
            {(block.media && block.mediaPos === 'left' || block.media === 'programme') && (
              <div className={classes}>
                {Blocks({
                  ...block,
                  type: block.media
                }, assets, props, true)}
              </div>
            )}
            <div className="wysiwyg" dangerouslySetInnerHTML={{__html: block.content}}></div>
            {block.media && block.mediaPos === 'right' && block.media !== 'programme' && (
              <div className={classes}>
                {Blocks({
                  ...block,
                  type: block.media
                }, assets, props, true)}
              </div>
            )}
          </div>
        </div>
      </div>
      {block.itemsType==='related-pages' && block.relatedPagesPageType === 'cards' ? (
        <div className={`content-block__items ${block.mediaPos==='right' && 'content-block__items--flipped'}`}>
          <Carousel
            options={{ arrows: true, slidesToShow: 4 }}
            responsive={[{
              breakpoint: 768,
                options: {
                  slidesToShow: 2,
                  arrows: false,
                  dots: true
                }
              },{
                breakpoint: 568,
                options: {
                  slidesToShow: 1
                }
              }]}>
            {block.pages.map((v,i) => {
              const image = assets['page-images'] && assets['page-images'].find(d => v.imageIds.includes(d.id))
              return <Card key={i} title={v.title} description={v.description} tags={[{id:1,name:v.label}]} image={{src:image&&image.file.url}} url={v.url} />
            })}
          </Carousel>
        </div>
      ) : (
        <div>
        {block.itemsType==='related-pages' && block.pages.length > 0 && (
          <div className="container">
            <div className={`content-block__items ${block.mediaPos==='right' && 'content-block__items--flipped'}`}>
              {Blocks({
                background: block.relatedPagesBackground,
                title: block.relatedPagesTitle,
                numberOfItems: block.relatedPagesNumberOfItems,
                pages: block.pages,
                actionLink: block.relatedPagesActionLink,
                latest: block.relatedPagesLatest,
                collection: block.relatedPagesCollection,
                order: block.order,
                type: block.relatedPagesPageType
              }, assets, props)}
            </div>
          </div>
        )}
        {block.itemsType==='promo-carousel' && block.tabs.filter(({programmes}) => programmes.length > 0).length > 0 && (
          <div className="content-block__carousel">
            {Blocks({
              background: block.promoCarouselBackground,
              arrows: block.promoCarouselArrows,
              dots: block.promoCarouselDots,
              scrollBar: block.promoCarouselScrollBar,
              pager: block.promoCarouselPager,
              tabs: block.tabs,
              type: block.promoCarouselType
            }, assets)}
          </div>
        )}
        </div>
      )}
    </div>
  )
}