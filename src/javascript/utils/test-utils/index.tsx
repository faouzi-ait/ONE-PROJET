import React from 'react'
import { render as jestRender } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import store from 'javascript/utils/store'
import { ThemeType } from '../theme/types/ThemeType'
import ModalRenderer from 'javascript/components/modal-renderer'
import ThemeProvider, { defaultTheme } from '../theme/ThemeProvider'

export const getLastHistory = (historyMock) => { // e.g. const historyMock = { push: jest.fn() }
  if (historyMock.push.mock.calls.length === 0) return
  const lastCall = historyMock.push.mock.calls[historyMock.push.mock.calls.length - 1][0]
  if (typeof lastCall === 'string') {
    return { pathname: lastCall, state: {} }
  }
  return lastCall
}


export const render = (ComponentToRender, clientName = '') => {
  //@ts-ignore
  testClient = clientName || ''
  jestRender(ComponentToRender)
}

export const renderWithRouter = (ComponentToRender, theme = defaultTheme, clientName = '') => {
  return render(
    <ThemeProvider testTheme={theme}>
      <BrowserRouter>
        <ComponentToRender />
      </BrowserRouter>
    </ThemeProvider>
  , clientName)
}

export const renderWithStore = (ComponentToRender, theme = defaultTheme, clientName = '') => {
  return render(
    <Provider store={store} >
      <ThemeProvider testTheme={theme}>
        <ComponentToRender />
      </ThemeProvider>
    </Provider>
  , clientName)
}

export const renderWithRouterAndStore = (ComponentToRender, theme, clientName = '') => {
  return render(
    <Provider store={store}>
      <ThemeProvider testTheme={theme}>
        <BrowserRouter>
          {ComponentToRender}
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  , clientName)
}

export const renderWithRouterStoreAndModal = (ComponentToRender, theme = defaultTheme, clientName = '') => {
  return renderWithRouterAndStore(
    <>
      {ComponentToRender}
      <ModalRenderer />
    </>
  , theme, clientName)
}

type ThemeOverrideType = {
  [key: string]: any /* not a nested object (key uses dot notation. e.g. 'features.videos.types') */
}

export const createTheme: (themeOverrides: ThemeOverrideType) => ThemeType = (themeOverrides: ThemeOverrideType = {}) => {
  const theme = JSON.parse(JSON.stringify(defaultTheme)) // needs to be a deep copy
  Object.keys(themeOverrides).forEach((override) => {
    const navigateDepth = (obj, paths, value) => {
      const thisPath = paths.shift()
      if (paths.length === 0) {
        return obj[thisPath] = value
      }
      navigateDepth(obj[thisPath], paths, value)
    }
    navigateDepth(theme, override.split('.'), themeOverrides[override])
  })
  return theme
}

const testUtils = {
  createTheme,
  render,
  renderWithRouter,
  renderWithRouterAndStore,
  renderWithRouterStoreAndModal,
  renderWithStore,
}

export default testUtils
