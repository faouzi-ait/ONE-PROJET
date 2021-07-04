/*
* This memory is used to hold state from assets/index component.
*
* When moving from AssetManagementIndex to AssetManagementEdit we used to pass state
* to the edit component, so as when we returned back to AssetManagementIndex we could reload
* the last state and have all the columns pre-filled with the existing state.
*
* Now with React Router v5 we cannot send state through with the NavLink as we get a
* NS_ERROR_ILLEGAL_VALUE (https://developer.mozilla.org/en-US/docs/Mozilla/Errors)
*
* We are trying to attach functions or null values in our state object, which is not allowed.
* (Also have an issue with ITV having too large a dataset and breaking xmlHttp 640k limit)
*
* This is a quick hack to get it working. In an ideal world we would have state management at
* the view level and never lose this state between components.
*
* This makes a global variable available to AssetManagementIndex which we can store the state in
* whilst we move to AssetManagementEdit. Then on the return we can retrive it.
*
* To enable this we add { hasMemory: true } to the NavLink state.  Passing this variable through
* AssetManagementEdit... This allows us to recollect it when AssetManagementIndex reloads as we
* can check props.location.state.hasMemory == true and reload it from this globalMemory module.
*
* This needs updating to a Flux Store - or ideally Redux state management in the future.
*
* // mono-repo: hack to make things work in time...
*/

import deepmerge from 'deepmerge-concat'

let memory = null

const setMemory = (state) => {
  memory = deepmerge({}, state)
}

const getMemory = () => {
  const returnState = Object.assign({}, memory)
  memory = null
  return Object.keys(returnState).length ? returnState : null
}

const assetMemory = {
  getMemory,
  setMemory
}

export default assetMemory