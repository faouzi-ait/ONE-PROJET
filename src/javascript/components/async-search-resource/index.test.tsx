import React from 'react'
import '@testing-library/jest-dom'

import {
  render,
  screen,
} from '@testing-library/react'

import makeServer from 'javascript/utils/test-utils/server'
import AsyncSearchResource from './index'

let server
beforeEach(() => {
  server = makeServer()
})

afterEach(() => {
  server.shutdown()
})

describe('AsyncSearchResource', () => {
  describe('Should render select with territories from API using prefetchPageSize={2} ', () => {
    beforeEach(async () => {
      server.create('territory', { name: 'Hollywood' })
      server.create('territory', { name: 'Orange County' })
      server.create('territory', { name: 'Van Nuys' })
      server.create('territory', { id: 4, name: 'Moorpark' })
      server.create('territory', { name: 'Santa Monica' })
      render(<AsyncSearchResource resourceType={'territories'} prefetchPageSize={2} value={{ id: 4, name: 'Moorpark' }} onChange={() => {}} />)
    })

    it('Territories should be empty to begin with', () => {
      expect(screen.queryAllByRole('listitem', { name: 'territories'})).toHaveLength(0)
    })

    it('Territories should populate when gaining focus', async () => {
      await screen.getByRole('combobox', { name: 'territories' }).focus()
      const listItems = await screen.findAllByRole('listitem', { name: 'territories'})
      const territories = listItems.map((territory) => territory.textContent)
      expect(territories).toEqual([
        'Hollywood',
        'Orange County',
        'Type to search more records...',
      ])
    })

    it('Should pre-populate with the given value', () => {
      expect(screen.getAllByText(/Moorpark/)).toHaveLength(1)
    })
  })
})