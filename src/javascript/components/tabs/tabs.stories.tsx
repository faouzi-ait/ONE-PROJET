import React from 'react'
import { storiesOf } from '@storybook/react'
import Tabs from './index'

storiesOf('Tabs', module)
  .addDecorator(story => <div style={{ padding: '1rem' }}>{story()}</div>)
  .add('Normal', () => (
    <>
      <Tabs>
        <div title="Tab 1"></div>
        <div title="Tab 2"></div>
      </Tabs>
    </>
  ))
  .add('Many', () => (
    <>
      <Tabs>
        <div title="Tab 1"></div>
        <div title="Tab 2"></div>
        <div title="Tab 3"></div>
        <div title="Tab 4"></div>
        <div title="Tab 5"></div>
        <div title="Tab 6"></div>
        <div title="Tab 7"></div>
      </Tabs>
    </>
  ))
