import React from 'react'
import { storiesOf } from '@storybook/react'
import Carousel from './index'

storiesOf('Carousel', module)
  .addDecorator(story => <div style={{ padding: '1rem' }}>{story()}</div>)
  .add('Normal', () => (
    <>
      <Carousel
        options={{ arrows: true, slidesToShow: 4 }}
      >
        <div>Slide 1</div>
        <div>Slide 2</div>
        <div>Slide 3</div>
        <div>Slide 4</div>
        <div>Slide 5</div>
        <div>Slide 6</div>
        <div>Slide 7</div>
        <div>Slide 8</div>
      </Carousel>
    </>
  ))
