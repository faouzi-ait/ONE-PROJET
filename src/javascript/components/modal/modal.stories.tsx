import React from 'react'
import { storiesOf } from '@storybook/react'
import Modal from './'

storiesOf('Modal', module)
  .addDecorator(story => <div style={{ padding: '1rem' }}>{story()}</div>)
  .add('Normal', () => (
    <Modal
      title={`Modal`}
      titleIcon={{ id: 'i-admin-add', width: 14, height: 14 }}
    >
      <div className="modal__content">
        With some Modal content...
      </div>
    </Modal>
  ))
