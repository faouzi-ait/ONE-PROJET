import React from 'react'
import { storiesOf } from '@storybook/react'
import Card from './index'

storiesOf('Card', module)
  .addDecorator(story => (
    <div style={{ padding: '1rem', width: '400px' }}>{story()}</div>
  ))
  .add('Normal', () => (
    <>
      <Card
        title="Hello"
        description="An awesome description"
        image={{
          src:
            'https://images.pexels.com/photos/556416/pexels-photo-556416.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
        }}
        url="/something"
      />
    </>
  ))
