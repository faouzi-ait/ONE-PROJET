import React from 'react'
import '@testing-library/jest-dom'

import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'

import makeServer from 'javascript/utils/test-utils/server'
import CountriesSelect from './index'

let server
beforeEach(() => {
  server = makeServer()
})

afterEach(() => {
  server.shutdown()
})

describe('Country Select', () => {
  describe('Should render select with countries from API', () => {
    beforeEach(async () => {
      render(<CountriesSelect />)
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    })
    it('Countries should be in alphabetical order', () => {
      const countries = screen.getAllByRole('listitem', { name: 'country-code' })
      const countryNames = countries.map((country) => country.textContent)
      expect(countryNames).toEqual([
        'Antarctica',
        'Swaziland',
        'United Kingdom',
        'United States',
      ])
    })
  })

  describe('Should render select with countries from API using priorityCountryCodes', () => {
    beforeEach(async () => {
      render(<CountriesSelect priorityCountryCodes={'GB,US'} />)
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    })
    it('Countries should be in priority followed by alphabetical order', () => {
      const countries = screen.getAllByRole('listitem', { name: 'country-code' })
      const countryNames = countries.map((country) => country.textContent)
      expect(countryNames).toEqual([
        'United Kingdom',
        'United States',
        'Antarctica',
        'Swaziland',
      ])
    })
  })

  describe('Should pre-select the value provided', () => {
    beforeEach(async () => {
      render(<CountriesSelect priorityCountryCodes={'GB,US'} value={'SZ'}/>)
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    })
    it('option "Swaziland" should be selected', () => {
      expect(screen.getByRole('option', { name: 'Swaziland'})).toBeInTheDocument()
    })
  })
})