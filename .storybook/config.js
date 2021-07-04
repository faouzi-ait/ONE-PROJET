import React from 'react'
import { configure, addDecorator } from '@storybook/react'
import ThemeProvider from '../src/javascript/utils/theme/ThemeProvider'
import store from '../src/javascript/utils/store'
import { Provider } from 'react-redux'
import '../src/stylesheets/core/base'
import '../src/stylesheets/core/components/content-blocks/base'
import { BrowserRouter } from 'react-router-dom'
import GlobalStyle from '../src/javascript/utils/theme/GlobalStyle'

function importAll(context) {
  context.keys().forEach(context)
}

// Fonts
importAll(require.context('../src/fonts', false, /\.(ttc|ttf|otf|woff|woff2)$/))

// Images
importAll(require.context('../src/images', true, /\.(jpg|png|svg|pdf)$/))

addDecorator(story => (
  <Provider store={store}>
    <ThemeProvider>
      <GlobalStyle></GlobalStyle>
      <BrowserRouter>
        <div className="custom">
          <div id="app">
            <div className="page__wrapper">{story()}</div>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  </Provider>
))

// automatically import all files ending in *.stories.js
const req = require.context('../src/javascript', true, /\.stories\.(jsx|tsx)?$/)
function loadStories() {
  req.keys().forEach(filename => req(filename))
}

configure(loadStories, module)
