import React from 'react'
import '@testing-library/jest-dom'
import {
  fireEvent,
  screen,
  render,
  waitForElementToBeRemoved,
  waitFor,
} from '@testing-library/react'
import makeServer from 'javascript/utils/test-utils/server'
import WeightedSearchTerms from './weighted-search-terms'

let server
beforeEach(() => {
  server = makeServer()
})

afterEach(() => {
  server.shutdown()
})

const noItemsText = 'There are currently no weighted words, try creating some!'
const addButtonText =  'Add a New Term'

describe('Weighted Terms', () => {
  describe('basic add functionality', () => {
    const closeEvent = jest.fn(() => {})
    beforeEach(async () => {
      render(<WeightedSearchTerms programme={{ id: '123' }} closeEvent={closeEvent} />)
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    })

    it('Should render a form with no Weighted Word terms after initial fetch completes', () => {
      expect(screen.getByText(noItemsText)).toBeInTheDocument()
    })

    it('Should creata a new row to add Weighted Words on clicking "Add"', async () => {
      await fireEvent.click(screen.getByRole('button', { name: addButtonText }))
      expect(screen.queryByText(noItemsText)).toBeNull()
    })

    it('Should only allow saving if new row is edited', async () => {
      await fireEvent.click(screen.getByRole('button', { name: addButtonText }))
      // initially 'Save' button does not exist
      expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
      await fireEvent.change(screen.getByRole('textbox', { name: 'name' }), {
        target: { value: 'TestWord' }
      })
      // after editing new row 'Save' button exists
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('Should POST and save a newly created "Term"', async () => {
      await fireEvent.click(screen.getByRole('button', { name: addButtonText }))
      await fireEvent.change(screen.getByRole('textbox', { name: 'name' }), {
        target: { value: 'TestRow1' }
      })
      await fireEvent.change(screen.getByRole('textbox', { name: 'weight' }), {
        target: { value: '596' }
      })
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await fireEvent.click(saveButton)

      // loading spinner on 'Save' button
      expect(saveButton).toHaveClass('button--loading')

      // modal close event has been called
      await waitFor(() => expect(closeEvent).toHaveBeenCalledTimes(1))

      // ensure database contains newly created row
      expect(server.db.weightedWords[0]).toEqual({ programmeId: null, name: 'TestRow1', weight: '596', id: '1' })
    })
  })

  describe('validate input', () => {
    const closeEvent = jest.fn(() => {})
    beforeEach(async () => {
      render(<WeightedSearchTerms programme={{ id: '123' }} closeEvent={closeEvent} />)
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    })

    it('Should only allow entering of numbers into weight input', async () => {
      await fireEvent.click(screen.getByRole('button', { name: addButtonText }))
      // initially 'Save' button does not exist
      await fireEvent.change(screen.getByRole('textbox', { name: 'weight' }), {
        target: { value: '125' }
      })
      expect(screen.getByRole('textbox', { name: 'weight' })).toHaveValue('125')

      await fireEvent.change(screen.getByRole('textbox', { name: 'weight' }), {
        target: { value: '2.4d6fv8-po' }
      })
      expect(screen.getByRole('textbox', { name: 'weight' })).toHaveValue('2468')
    })

    it('Should only save a "Term" if it has a name', async () => {
      await fireEvent.click(screen.getByRole('button', { name: addButtonText }))
      await fireEvent.change(screen.getAllByRole('textbox', { name: 'name' })[0], {
        target: { value: 'TestRow1' }
      })
      await fireEvent.change(screen.getAllByRole('textbox', { name: 'weight' })[0], {
        target: { value: '369' }
      })

      await fireEvent.click(screen.getByRole('button', { name: addButtonText }))
      await fireEvent.change(screen.getAllByRole('textbox', { name: 'name' })[1], {
        target: { value: '' }
      })
      await fireEvent.change(screen.getAllByRole('textbox', { name: 'weight' })[1], {
        target: { value: '123' }
      })
      await fireEvent.click(screen.getByRole('button', { name: addButtonText }))
      await fireEvent.change(screen.getAllByRole('textbox', { name: 'name' })[2], {
        target: { value: 'TestRow3' }
      })
      await fireEvent.change(screen.getAllByRole('textbox', { name: 'weight' })[2], {
        target: { value: '246' }
      })
      await fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => expect(closeEvent).toHaveBeenCalledTimes(1))
      // ensure database only contains newly created rows
      expect(server.db.weightedWords).toHaveLength(2)
      expect(server.db.weightedWords[0]).toEqual({ programmeId: null, name: 'TestRow1', weight: '369', id: '1' })
      expect(server.db.weightedWords[1]).toEqual({ programmeId: null, name: 'TestRow3', weight: '246', id: '2' })
    })
  })

  describe('edit a "Term"', () => {
    const closeEvent = jest.fn(() => {})
    beforeEach(async () => {
      server.create('weighted-word', { name: 'testRow1', weight: '2' })
      server.create('weighted-word', { name: 'testRow2', weight: '1' })
      render(<WeightedSearchTerms programme={{ id: '123' }} closeEvent={closeEvent} />)
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    })

    it('Should only allow saving if row is edited', async () => {
      // initially 'Save' button does not exist
      expect(screen.queryByRole('button', { name: 'Save' })).toBeNull()
      await fireEvent.change(screen.getAllByRole('textbox', { name: 'name' })[0], {
        target: { value: 'TestRow1' }
      })
      // after editing new row 'Save' button exists
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })

    it('Should update database when editing a "Term"', async () => {
      await fireEvent.change(screen.getAllByRole('textbox', { name: 'name' })[0], {
        target: { value: 'testRow1Updated' }
      })
      await fireEvent.change(screen.getAllByRole('textbox', { name: 'weight' })[0], {
        target: { value: '56' }
      })
      await fireEvent.click(screen.getByRole('button', { name: 'Save' }))
      await waitFor(() => expect(closeEvent).toHaveBeenCalledTimes(1))
      // // ensure database only contains newly created rows
      expect(server.db.weightedWords).toHaveLength(2)
      expect(server.db.weightedWords[0]).toEqual({ programmeId: null, name: 'testRow1Updated', weight: '56', id: '1' })
      expect(server.db.weightedWords[1]).toEqual({ programmeId: null, name: 'testRow2', weight: '1', id: '2' })
    })
  })

  describe('Delete a "Term"', () => {
    const closeEvent = jest.fn(() => {})
    beforeEach(async () => {
      server.create('weighted-word', { name: 'testRow1', weight: '2' })
      server.create('weighted-word', { name: 'testRow2', weight: '1' })
      render(<WeightedSearchTerms programme={{ id: '123' }} closeEvent={closeEvent} />)
      await waitForElementToBeRemoved(() => screen.getByTestId('wait-for-loader'))
    })

    it('Should delete a "Term" from the database', async () => {
      await waitFor(() => expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(2))
      await fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
      await waitFor(() => expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1))

      expect(server.db.weightedWords.length).toBe(1)
      expect(server.db.weightedWords[0]).toEqual({ programmeId: null, name: 'testRow2', weight: '1', id: '2' })
    })
  })
})