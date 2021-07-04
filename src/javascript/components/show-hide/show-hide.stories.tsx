import React from 'react'
import { storiesOf } from '@storybook/react'
import ShowHide from '.'

storiesOf('Show Hide', module)
  .addDecorator(story => (
    <div style={{ padding: '1rem', maxWidth: '400px' }}>{story()}</div>
  ))
  .add('Without Titles', () => (
    <>
      <ShowHide>
        <div>Hi there!</div>
      </ShowHide>
      <ShowHide>
        <div>Hello there!</div>
      </ShowHide>
    </>
  ))
  .add('With Titles', () => (
    <>
      <ShowHide title="First one!">
        <div>Hi there!</div>
      </ShowHide>
      <ShowHide title="Second one!">
        <div>Hello there!</div>
      </ShowHide>
    </>
  ))
