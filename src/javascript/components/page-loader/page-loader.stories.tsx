import React from 'react'
import { storiesOf } from '@storybook/react'
import PageLoader from './'

storiesOf('Page Loader', module)
  .addDecorator(story => <div style={{ padding: '1rem' }}>{story()}</div>)
  .add('Loading...', () => (
    <PageLoader >
      <div>
        Loading... THIS SHOULD NOT BE VISIBLE EVER!!!
      </div>
    </PageLoader>
  ))
  .add('Finished Loading', () => (
    <PageLoader loaded={true}>
      <div>
        Loader finished - Displaying children... (This is Correct!)
      </div>
    </PageLoader>
  ))
  .add('Errored', () => (
    <PageLoader errored={true}>
      <div>
        Errored... THIS SHOULD NOT BE VISIBLE EVER!!!
      </div>
    </PageLoader>
  ))