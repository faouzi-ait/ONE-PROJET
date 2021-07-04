import React from 'react'
import Header from '.'
import { storiesOf } from '@storybook/react'

storiesOf('Header', module)
  .addDecorator(story => <div style={{ minHeight: '20rem' }}>{story()}</div>)
  .add('Normal', () => <Header />)
