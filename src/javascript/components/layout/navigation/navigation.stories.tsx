import React from 'react'
import { storiesOf } from '@storybook/react'
import Navigation from './index'

storiesOf('Navigation', module)
  .addDecorator(story => (
    <div style={{ padding: '1rem', minHeight: '10rem' }}>{story()}</div>
  ))
  .add('Normal', () => (
    <>
      <div className="nav-open">
        <Navigation
          pages={[
            {
              id: '123',
              'content-positionable': {
                id: '1',
                title: 'Helloooo',
              },
            },
          ]}
        ></Navigation>
      </div>
    </>
  ))
