import React from 'react'
import { storiesOf } from '@storybook/react'
import Banner from './index'

storiesOf('Banner', module)
  .addDecorator(story => <div style={{ padding: '1rem' }}>{story()}</div>)
  .add('Normal', () => (

    <Banner
      title={`ONE Lite`}
      copy={'Our worldwide audience is growing fast and they’re falling in love with home grown shows made by us and our partners.'}
    />

  ))
