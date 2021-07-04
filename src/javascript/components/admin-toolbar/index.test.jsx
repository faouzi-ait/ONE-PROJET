import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import {
  renderWithRouterAndStore,
} from 'javascript/utils/test-utils'

import AdminToolbar from './'

describe('Admin Toolbar', () => {
  it('Should render and be collapsable', async () => {
    renderWithRouterAndStore(<AdminToolbar type={'page'} id={1} user={{roles:[{ name: 'admin' }]}} />)

    expect(screen.getByTestId('toolbar')).toBeTruthy

    //When the user clicks the toggle button, the toolbar should collapse
    fireEvent.click(screen.getByTestId('toggle-button'))

    expect(screen.getByTestId('toolbar')).not.toHaveStyle({bottom: 0})
  })
})