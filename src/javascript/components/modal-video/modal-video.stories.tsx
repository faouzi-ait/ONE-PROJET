import { storiesOf } from '@storybook/react'
import React from 'react'
import { ResumeOrPlayDialog } from 'javascript/components/modal-video'
import Modal from '../modal'
import styled from 'styled-components'

storiesOf('ResumeOrPlayDialog', module)
  .add('Normal', () => (
    <div style={{ height: '100vh'}}>
      <BackgroundImage src="https://images.unsplash.com/photo-1573641287741-f6e223d81a0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"></BackgroundImage>
      <Modal modifiers={['video']}>
        <h3 className="modal__title">Video Name</h3>
        <ResumeOrPlayDialog
          beginPlayingVideo={async () => {}}
        ></ResumeOrPlayDialog>
      </Modal>
    </div>
  ))
  .add('Full Width', () => (

    <div style={{ height: '100vh'}}>
      <BackgroundImage src="https://images.unsplash.com/photo-1573641287741-f6e223d81a0f"></BackgroundImage>
      <Modal modifiers={['full-width', 'video']}>
        <h3 className="modal__title">Video Name</h3>
        <ResumeOrPlayDialog
          beginPlayingVideo={async () => {}}
          isFullWidthModal
        ></ResumeOrPlayDialog>
      </Modal>
    </div>
  ))

const BackgroundImage = styled.img`
  width: 100vw;
  position: absolute;
  height: 100vh;
  top: 0;
  left: 0;
`
