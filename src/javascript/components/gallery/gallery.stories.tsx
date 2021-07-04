import React from 'react'
import { storiesOf } from '@storybook/react'
import Gallery from './'

const galleryItems = [{
  image: 'hhttps://homepages.cae.wisc.edu/~ece533/images/serrano.png',
  thumbnail: 'https://homepages.cae.wisc.edu/~ece533/images/serrano.png',
  alt: 'Serrano',
  caption: 'Click to enlarge'
}, {
  image: 'https://homepages.cae.wisc.edu/~ece533/images/baboon.png',
  thumbnail: 'https://homepages.cae.wisc.edu/~ece533/images/baboon.png',
  alt: 'Baboon',
  caption: 'Click to enlarge'
}]


storiesOf('Gallery', module)
  .addDecorator(story => <div style={{ padding: '1rem' }}>{story()}</div>)
  .add('Normal', () => (
    <Gallery
      items={galleryItems}
    />
  ))

