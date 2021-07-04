import React from 'react'
import { storiesOf } from '@storybook/react'
import Sharer from './'

storiesOf('Sharer', module)
  .addDecorator(story => <div style={{ padding: '1rem' }}>{story()}</div>)
  .add('Normal', () => (
    <Sharer title="Random Share topic/title" />
  ))
