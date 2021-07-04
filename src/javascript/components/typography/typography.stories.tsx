import React from 'react'
import { storiesOf } from '@storybook/react'

storiesOf('Typography', module)
  .addDecorator(story => <div style={{ padding: '1rem' }}>{story()}</div>)
  .add('All Typography', () => (
    <>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
      <p>Paragraph</p>
      <cite>Cite</cite>
      <ul><li>Unordered list</li></ul>
      <ol><li>Ordered list</li></ol>
      <a>Link</a>
    </>
  ))
