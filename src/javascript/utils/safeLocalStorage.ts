const getItem = (key: string) => {
  try {
    return localStorage.getItem(key)
  } catch (e) {
    console.warn(e)
  }
}

const removeItem = (key: string) => {
  try {
    return localStorage.removeItem(key)
  } catch (e) {
    console.warn(e)
  }
}

const setItem = (key: string, value: string) => {
  try {
    return localStorage.setItem(key, value)
  } catch (e) {
    console.warn(e)
  }
}

const getItemWithExpiration = (key: string) => {
  const data = getItem(key)
  if (!data) return
  const { value, timestamp } = JSON.parse(data)
  if (!timestamp || !value) return
  if (new Date().getTime() < timestamp) {
    return value
  }
  removeItem(key)
}

const setItemWithExpiration = (key: string, value: any, minutes: number) => {
  const expirationMS = minutes * 60 * 1000
  const data = {value, timestamp: new Date().getTime() + expirationMS}
  return setItem(key, JSON.stringify(data))
}

/**
 * Sometimes, accessing localStorage throws
 * an error for those with ad blockers. We need to
 * wrap each usage of it in a try/catch
 */
export const safeLocalStorage = {
  getItem,
  getItemWithExpiration,
  setItem,
  setItemWithExpiration,
  removeItem,
}
