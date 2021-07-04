import React from 'react'
import pluralize from 'pluralize'
import '@testing-library/jest-dom'
import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import {
  createTheme,
  renderWithRouterAndStore,
} from 'javascript/utils/test-utils'
import makeServer from 'javascript/utils/test-utils/server'
import SeriesBroadcasters from './index'

let server
let testProgramme
let testSeries

beforeEach(() => {
  server = makeServer()
  testProgramme = server.create('programme', { title: 'TestProgramme' })
  testSeries = server.create('series', {
    name: 'Series 1',
    programme: testProgramme
  })
})

afterEach(() => {
  server.shutdown()
})

const theme = createTheme({
  'localisation.series.upper': '__SeriesLocalisation__',
  'localisation.broadcaster.upper': '__BroadcasterLocalisation__',
})


jest.mock('@bugsnag/js')
jest.mock('javascript/components/async-search-resource')
jest.mock('javascript/components/reorderable-list')

const componentProps = {
  theme,
  match: { params: { programme: '1', series: '1' }},
  location: {}
}

describe('Series Broadcasters', () => {

  describe('loading with no list items', () => {
    beforeEach(() => {
      renderWithRouterAndStore(<SeriesBroadcasters {...componentProps} />, theme)
    })

    it('Should render with a loading spinner', () => {
      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })
    it('Should render with a "back button" to Series', () => {
      expect(screen.getByText(`Back to ${pluralize(theme.localisation.series.upper)}`)).toBeInTheDocument()
    })
  })

  describe('Adding a new broadcaster', () => {
    const broadcasterInDb = { id: '1', name: 'TVP Polonia' }
    beforeEach(async () => {
      renderWithRouterAndStore(<SeriesBroadcasters {...componentProps} />, theme)
      server.create('broadcaster', broadcasterInDb)
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    it('Should render with title', async () => {
      expect(screen.queryByText(`Manage ${testSeries.attrs.name} ${pluralize(theme.localisation.broadcaster.upper)}`)).toBeInTheDocument()
    })

    it('Should add a series broadcaster after selecting one in async select', async () => {
      await fireEvent.change(screen.getByRole('combobox', { name: 'broadcasters'}), {
        target: { data: broadcasterInDb}
      })
      await waitFor(() => screen.findByText('TVP Polonia'))
      expect(screen.queryByText('TVP Polonia')).toBeInTheDocument()
    })
  })

  describe('With existsing items in db ->', () => {
    const seriesBroadcasters = ['TVP Polonia', 'Deutsche Welle', 'TV5 Monde']
    beforeEach(async () => {
      seriesBroadcasters.forEach((broadcaster, index) => {
        server.create('series-broadcaster', {
          'series': testSeries,
          'broadcaster': server.create('broadcaster', { name: broadcaster }),
          position: index + 1
        })
      })
      renderWithRouterAndStore(<SeriesBroadcasters {...componentProps} />, theme)
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    describe('Removing a broadcaster', () => {
      it('Should have the correct series broadcasters in db', () => {
        expect(screen.getByText(seriesBroadcasters[0])).toBeInTheDocument()
        expect(screen.getByText(seriesBroadcasters[1])).toBeInTheDocument()
        expect(screen.getByText(seriesBroadcasters[2])).toBeInTheDocument()
      })

      it('Should delete a row when clicking \'Remove\'', async () => {
        expect(screen.queryByText(seriesBroadcasters[1])).toBeTruthy()
        await fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[1])
        await waitForElementToBeRemoved(() => screen.queryByText(seriesBroadcasters[1]))
        expect(screen.queryByText(seriesBroadcasters[1])).toBeNull()
      })
    })

    describe('Changing the order of a broadcaster', () => {
      it('Should have the correct series broadcasters in default order in db', () => {
        const cells = screen.getAllByRole('cell')
        expect(cells[0]).toHaveTextContent(seriesBroadcasters[0])
        expect(cells[2]).toHaveTextContent(seriesBroadcasters[1])
        expect(cells[4]).toHaveTextContent(seriesBroadcasters[2])
      })

      it('Should move a row and change its position', async () => {
        await fireEvent.dragEnd(screen.getAllByRole('row')[1], {
          target: { data: {
            startIndex: 0,
            endIndex: 2
          }}
        })
        await waitForElementToBeRemoved(() => screen.queryByTestId('wait-for-loader'))
        const cells = screen.getAllByRole('cell')
        expect(cells[0]).toHaveTextContent(seriesBroadcasters[1])
        expect(cells[2]).toHaveTextContent(seriesBroadcasters[0])
        expect(cells[4]).toHaveTextContent(seriesBroadcasters[2])
      })
    })
  })
})