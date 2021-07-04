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
import ProgrammeBroadcasters from './index'

let server
let testProgramme

beforeEach(() => {
  server = makeServer()
  testProgramme = server.create('programme', { title: 'TestProgramme' })
})

afterEach(() => {
  server.shutdown()
})

const theme = createTheme({
  'localisation.programme.upper': '__ProgrammeLocalisation__',
  'localisation.broadcaster.upper': '__BroadcasterLocalisation__',
})


jest.mock('@bugsnag/js')
jest.mock('javascript/components/async-search-resource')
jest.mock('javascript/components/reorderable-list')

const componentProps = {
  theme,
  match: { params: { programme: '1' }}
}

describe('Programme Broadcasters', () => {

  describe('loading with no list items', () => {
    beforeEach(() => {
      renderWithRouterAndStore(<ProgrammeBroadcasters {...componentProps} />, theme)
    })

    it('Should render with a loading spinner', () => {
      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })
    it('Should render with a "back button" to Programmes', () => {
      expect(screen.getByText(`Back to ${pluralize(theme.localisation.programme.upper)}`)).toBeInTheDocument()
    })
  })

  describe('Adding a new broadcaster', () => {
    const broadcasterInDb = { id: '1', name: 'TVP Polonia' }
    beforeEach(async () => {
      renderWithRouterAndStore(<ProgrammeBroadcasters {...componentProps} />, theme)
      server.create('broadcaster', broadcasterInDb)
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    it('Should render with title', async () => {
      expect(screen.queryByText(`Manage ${testProgramme.attrs.title} ${pluralize(theme.localisation.broadcaster.upper)}`)).toBeInTheDocument()
    })

    it('Should add a programme broadcaster after selecting one in async select', async () => {
      await fireEvent.change(screen.getByRole('combobox', { name: 'broadcasters'}), {
        target: { data: broadcasterInDb}
      })
      await waitFor(() => screen.findByText('TVP Polonia'))
      expect(screen.queryByText('TVP Polonia')).toBeInTheDocument()
    })
  })

  describe('With existsing items in db ->', () => {
    const programmeBroadcasters = ['TVP Polonia', 'Deutsche Welle', 'TV5 Monde']
    beforeEach(async () => {
      programmeBroadcasters.forEach((broadcaster, index) => {
        server.create('programme-broadcaster', {
          'programme': testProgramme,
          'broadcaster': server.create('broadcaster', { name: broadcaster }),
          position: index + 1
        })
      })
      renderWithRouterAndStore(<ProgrammeBroadcasters {...componentProps} />, theme)
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    describe('Removing a broadcaster', () => {
      it('Should have the correct programme broadcasters in db', () => {
        expect(screen.getByText(programmeBroadcasters[0])).toBeInTheDocument()
        expect(screen.getByText(programmeBroadcasters[1])).toBeInTheDocument()
        expect(screen.getByText(programmeBroadcasters[2])).toBeInTheDocument()
      })

      it('Should delete a row when clicking \'Remove\'', async () => {
        expect(screen.queryByText(programmeBroadcasters[1])).toBeTruthy()
        await fireEvent.click(screen.getAllByRole('button', { name: 'Remove' })[1])
        await waitForElementToBeRemoved(() => screen.queryByText(programmeBroadcasters[1]))
        expect(screen.queryByText(programmeBroadcasters[1])).toBeNull()
      })
    })

    describe('Changing the order of a broadcaster', () => {
      it('Should have the correct programme broadcasters in default order in db', () => {
        const cells = screen.getAllByRole('cell')
        expect(cells[0]).toHaveTextContent(programmeBroadcasters[0])
        expect(cells[2]).toHaveTextContent(programmeBroadcasters[1])
        expect(cells[4]).toHaveTextContent(programmeBroadcasters[2])
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
        expect(cells[0]).toHaveTextContent(programmeBroadcasters[1])
        expect(cells[2]).toHaveTextContent(programmeBroadcasters[0])
        expect(cells[4]).toHaveTextContent(programmeBroadcasters[2])
      })
    })
  })

})