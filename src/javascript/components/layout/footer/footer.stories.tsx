import React from 'react'
import Footer from '.'
import { storiesOf } from '@storybook/react'

storiesOf('Footer', module).add('Default', () => (
  <>
    <Footer
      pages={[
        {
          id: '1',
          title: 'Hello',
          'content-positionable': {
            id: 12,
            title: 'Hello',
          },
        },
      ]}
    />
  </>
))
