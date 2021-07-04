import React from 'react'
import { storiesOf } from '@storybook/react'
import { Tags, Tag } from '.'

storiesOf('Tags', module)
  .addDecorator(story => <div style={{ padding: '1rem' }}>{story()}</div>)
  .add('Normal', () => (
    <>
      <Tags>
        <Tag>Hey</Tag>
        <Tag>There</Tag>
      </Tags>
    </>
  ))
