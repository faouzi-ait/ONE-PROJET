import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

import Stats from './'

const data = {
  items: [{
    value: '2,000',
    label: 'Series'
  }],
  title: 'Statistics',
  centered: true
}

describe('Stats block', () => {
  it('Should render with a title and data', async () => {
    render(<Stats {...data} />)

    //block is visible
    expect(screen.getByTestId('stats-block')).toBeTruthy

    //block has items
    expect(screen.getByTestId('stats-item')).toBeTruthy

    //block has title
    expect(screen.getByTestId('stats-title')).toBeTruthy

    //block is centered
    expect(screen.getByTestId('stats-grid').classList.contains('grid--justify')).toBe(true)
    
  })
})