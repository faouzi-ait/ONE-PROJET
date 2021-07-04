import React from 'react'
import pluralize from 'pluralize'
import '@testing-library/jest-dom'
import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import {
  createTheme,
  renderWithRouterAndStore,
  renderWithRouterStoreAndModal
} from 'javascript/utils/test-utils'
import makeServer from 'javascript/utils/test-utils/server'
import BroadcastersIndex from './index'

let server
beforeEach(() => {
  server = makeServer()
})

afterEach(() => {
  server.shutdown()
})

const theme = createTheme({
  'localisation.broadcaster.upper': '__BroadcasterLocalisation__',
})

const noItemsText = `There are currently no ${pluralize(theme.localisation.broadcaster.upper)}, try creating some!`
const newButtonText =  `New ${theme.localisation.broadcaster.upper}`

describe('Broadcasters', () => {
  describe('loading with no list items', () => {
    beforeEach(() => {
      renderWithRouterAndStore(<BroadcastersIndex theme={theme} />, theme)
    })

    it('Should render with a loading spinner', () => {
      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })
    it('Should render with title', () => {
      expect(screen.getByText(`Manage ${pluralize(theme.localisation.broadcaster.upper)}`)).toBeInTheDocument()
    })
    it('Should render with a "new button"', () => {
      expect(screen.getByText(newButtonText)).toBeInTheDocument()
    })
    it('Should render with a `No Broadcasters` message', async () => {
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
      expect(screen.getByText(noItemsText)).toBeInTheDocument()
    })
  })

  describe('Adding a new broadcaster', () => {
    beforeEach(async () => {
      renderWithRouterStoreAndModal(<BroadcastersIndex theme={theme} />, theme)
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
      await fireEvent.click(screen.getAllByRole('button', { name: newButtonText })[0])
    })

    it('Should open a modal when clicking "new button"', () => {
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('Should create a new broadcaster when submitting modal', async () => {

      // there are no broadcasters to begin with
      expect(screen.getByText(noItemsText)).toBeInTheDocument()

      await fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'TVP Polonia' }
      })
      await fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0])

      // ensure we have 2 rows in the table (heading + 1 data row)
      const tableRows = await screen.findAllByRole('row')
      expect(tableRows).toHaveLength(2)

      // ensure we have a row that includes the Broadcaster: 'TVP Polonia'
      expect(screen.getByText('TVP Polonia')).toBeTruthy()

      // ensure the modal has been closed
      expect(screen.queryByTestId('modal')).toBeNull()
    })
  })

  describe('Loading with list items', () => {
    beforeEach(() => {
      server.create('broadcaster', { name: 'TVP Polonia' })
      server.create('broadcaster', { name: 'Deutsche Welle' })
      server.create('broadcaster', { name: 'Al Jazeera' })
      renderWithRouterAndStore(<BroadcastersIndex theme={theme} />, theme)
    })

    it('Should render with a loading spinner', () => {
      expect(screen.getByTestId('loader')).toBeInTheDocument()
    })

    it('Should remove loading spinner after fetching Broadcasters', async () => {
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    it('Should render with 3 broadcaster items', async () => {

      expect(await screen.findByText('TVP Polonia')).toBeTruthy()

      expect(await screen.findByText('Deutsche Welle')).toBeTruthy()

      expect(await screen.findByText('Al Jazeera')).toBeTruthy()

      // ensure we have 4 rows in the table (heading + 3 data rows)
      const tableRows = await screen.findAllByRole('row')
      expect(tableRows).toHaveLength(4)
    })
  })

  describe('Editing a Broadcaster', () => {
    beforeEach(async () => {
      server.create('broadcaster', { name: 'TVP Polonia' })
      renderWithRouterStoreAndModal(<BroadcastersIndex theme={theme} />, theme)
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
      await fireEvent.click(screen.getByText('Edit'))
    })

    it('Should open a modal when editing a broadcaster', async () => {
      expect(screen.getByTestId('modal')).toBeInTheDocument()
    })

    it('Should update Broadcaster name when editing', async () => {
      expect(await screen.findByText('TVP Polonia')).toBeTruthy()

      await fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'Deutsche Welle' }
      })
      await fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0])

      expect(await screen.findByText('Deutsche Welle')).toBeTruthy()

      // ensure we still have only 2 rows in the table (heading + 1 data row)
      const tableRows = await screen.findAllByRole('row')
      expect(tableRows).toHaveLength(2)

      // ensure the modal has been closed
      expect(screen.queryByTestId('modal')).toBeNull()
    })
  })

  describe('Deleting a Broadcaster', () => {
    beforeEach(async () => {
      server.create('broadcaster', { name: 'TVP Polonia' })
      server.create('broadcaster', { name: 'Deutsche Welle' })
      renderWithRouterStoreAndModal(<BroadcastersIndex theme={theme} />, theme)
      await waitForElementToBeRemoved(() => screen.getByTestId('loader'))
    })

    it('Should prompt the user to confirm deleting a Broadcaster', async () => {
      // ensure we have 3 rows in the table (heading + 2 data rows)
      let tableRows = await screen.findAllByRole('row')
      expect(tableRows).toHaveLength(3)

      const allDeleteButtons = screen.getAllByText('Delete')
      await fireEvent.click(allDeleteButtons[1])

      // ensure it has opened a modal
      expect(screen.getByTestId('modal')).toBeInTheDocument()

      await fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
      await waitForElementToBeRemoved(() => screen.getByTestId('modal'))

      // ensure we have 2 rows in the table (heading + 1 data row)
      tableRows = await screen.findAllByRole('row')
      expect(tableRows).toHaveLength(2)

      expect(await screen.findByText('TVP Polonia')).toBeTruthy()
      // ensure the modal has been closed
      expect(screen.queryByTestId('modal')).toBeNull()
    })
  })

})