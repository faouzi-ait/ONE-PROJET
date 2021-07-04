import React from 'react'
import Carousel from 'javascript/components/carousel'

export default (block) => (children) => (
  <Carousel options={{
    slidesToShow: block.programmeCarouselItems,
    dots: block.dots,
    arrows: block.arrows
  }} responsive={[{
    breakpoint: 1024,
    options: {
      slidesToShow: 3,
    }, 
  }, {
    breakpoint: block.carouselMediumBreakpoint,
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
    {children}
  </Carousel>
)