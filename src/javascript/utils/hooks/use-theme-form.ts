import React, { useState, useEffect } from 'react'
import deepmerge from 'deepmerge-concat'
import deepEqual from 'deep-equal'

import getTheme from 'javascript/utils/theme/getTheme'
import { StatusEnum } from './use-redux-enum-api-logic'
import { ThemeType, CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
import useAsyncProcessChecker from './use-async-process-checker'
import useEnumApiLogic from './use-enum-api-logic'
import useLocalState from './use-local-state'
import { useReduxThemeState } from 'javascript/utils/theme/ThemeProvider'
import { useSetAdminPrompt } from 'javascript/components/admin/layout/admin-subnav-context'
import useWatchForTruthy from './use-watch-for-truthy'
import defaultApiStyles from 'javascript/config/default-api-styles'
import { defaultTheme } from 'javascript/utils/theme/ThemeProvider'

interface UseThemeFormParams<Inputs> {
  inputs: InputMatrix<Inputs>
  handleSubmit: (values: CustomThemeType) => Promise<CustomThemeType>
}

export type InputMatrix<Inputs extends {}> = {
  [K in keyof Inputs]: {
    selector: (theme: ThemeType) => Inputs[K]
    reverseSelector: (value: Inputs[K]) => CustomThemeType
    /**
     * If you want this value to update live in the
     * theme state - defaults to true
     */
    shouldLiveUpdate?: boolean
  }
}

interface UseThemeStylesFormReturn<Inputs> {
  onSubmit: () => void
  values: Inputs
  initialValues: Inputs
  makeOnChange: <K extends keyof Inputs>(key: K) => (value: Inputs[K]) => void
  makeCheckboxOnChange: <K extends keyof Inputs>(
    key: K,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void
  makeOnBlur: <K extends keyof Inputs>(key?: K) => () => void
  makeOnFocus: <K extends keyof Inputs>(key: K) => () => void
  isInputActive: <K extends keyof Inputs>(key: K) => boolean
  makeInputProps: <K extends keyof Inputs>(
    key: K,
  ) => {
    onChange: (value: Inputs[K]) => void
    onBlur: () => void
    onFocus: () => void
    value: any
    active: boolean
  }
  makeCheckboxInputProps: <K extends keyof Inputs>(
    key: K,
  ) => {
    onChange: (value: any) => void
    onBlur: () => void
    onFocus: () => void
    checked: boolean
    id: keyof Inputs
  }
  makeColorInputProps: <K extends keyof Inputs>(
    key: K,
  ) => {
    onColorChange: (value: { hex: any }) => void
    onBlur: () => void
    onFocus: () => void
    value: any
    active: boolean
  }
  haveChangesBeenMade: boolean
  hasSubmittedTheForm: boolean
  submitStatus: StatusEnum
  resetToDefault: (key: keyof Inputs) => void
}

/**
 * Handles grabbing initial values from the theme held in redux,
 * changing them, and resetting them if the user finishes using the form
 */
const useThemeForm = <Inputs extends {}>({
  handleSubmit,
  inputs,
}: UseThemeFormParams<Inputs>): UseThemeStylesFormReturn<Inputs> => {
  const {
    setTheme,
    state: { theme },
  } = useReduxThemeState()

  const calculateInitialValues = (): Inputs => {
    // @ts-ignore
    return Object.keys(inputs).reduce(
      // @ts-ignore
      (obj, key: keyof Inputs) => (
        {
        ...obj,
        [key]: inputs[key].selector(theme),
      }),
      {},
    )
  }

  const getCustomThemeFromValues = (values: Inputs): CustomThemeType => {
    // @ts-ignore
    return Object.keys(inputs).reduce((obj, key: keyof Inputs) => {
      if (values[key] !== undefined) {
        return deepmerge(obj, inputs[key].reverseSelector(values[key]))
      }
      return obj
    }, {})
  }

  const [initialValues, setInitialValues] = useState<Inputs>(calculateInitialValues())
  //@ts-ignore
  const [defaultResetValues, setDefaultResetValues] = useState<Inputs>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const {
    state: { status: submitStatus },
    reportStarted,
    reportError,
    reportFulfilled,
    reset,
  } = useEnumApiLogic()

  const [haveChangesBeenMade, setHaveChangesbeenMade] = useState(false)
  const [inputActive, setInputActive] = useState<keyof Inputs>(undefined)

  const { state: currentValues, setCurrentValues } = useLocalState<
    Inputs,
    {
      setCurrentValues: (values: Inputs) => void
    },
    {}
  >({
    initialState: calculateInitialValues(),
    actions: {
      setCurrentValues: (oldState, newState) => ({ ...oldState, ...newState }),
    },
  })

  useEffect(() => {
    setCurrentValues(calculateInitialValues())
  }, [theme])

  const changeAfterDelay = useChangeAfterThrottle()

  const getAlteredValues = (currentValues: Inputs, initialValues: Inputs): Inputs => {
    //@ts-ignore
    return Object.keys(currentValues).reduce((acc, key) => {
      if (typeof currentValues[key] === 'object' && !Array.isArray(currentValues[key]) && currentValues[key] !== null) {
        const alteredValues = getAlteredValues(currentValues[key], initialValues[key])
        if (Object.keys(alteredValues).length) {
          acc[key] = alteredValues
        }
      } else if (!deepEqual(currentValues[key], initialValues[key])) {
        acc[key] = currentValues[key]
      }
      return acc
    }, {})
  }

  const onSubmit = (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    reportStarted()

    const currentValuesWithDefaults = {
      ...currentValues,
      ...defaultResetValues
    }
    const alteredValues = getCustomThemeFromValues(getAlteredValues(currentValuesWithDefaults, initialValues))
    handleSubmit(alteredValues).then(values => {
      setHasSubmitted(true)
      reportFulfilled(values)
      setInitialValues(calculateInitialValues())
    }).catch((err) => {
      reportError()
    })
  }

  const handleChangeAfterDelay = (key: keyof Inputs, updatedValues: Inputs) => {
    if (!haveChangesBeenMade) {
      setHaveChangesbeenMade(true)
    }
    if (submitStatus !== 'idle') {
      reset()
    }
    if (
      typeof inputs[key].shouldLiveUpdate === 'undefined' ||
      inputs[key].shouldLiveUpdate
    ) {
      changeAfterDelay(() => {
        setTheme(getCustomThemeFromValues(updatedValues))
      })
    }
  }

  const makeOnChange = <K extends keyof Inputs>(key: K) => (
    valueOrEvent: Inputs[K] | React.ChangeEvent,
    ) => {
    // @ts-ignore
    let resolvedValue = valueOrEvent.target
    ? valueOrEvent['target'].value
    : valueOrEvent

    if (typeof resolvedValue === 'object' && resolvedValue.value) {
      resolvedValue = resolvedValue.value
    }
    removeAnyDefaultResetValues(key)
    const updatedValues = currentValues
    updatedValues[key] = resolvedValue
    setCurrentValues(updatedValues)
    handleChangeAfterDelay(key, updatedValues)
  }

  const makeOnColorChange = (key: keyof Inputs) => (value: { hex: any }) => {
    removeAnyDefaultResetValues(key)
    const updatedValues = currentValues
    updatedValues[key] = value.hex
    setCurrentValues(updatedValues)
    handleChangeAfterDelay(key, updatedValues)
  }

  const makeCheckboxOnChange = <K extends keyof Inputs>(key: K) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    removeAnyDefaultResetValues(key)
    const updatedValues = currentValues
    // @ts-ignore
    updatedValues[key] = event.target.checked
    setCurrentValues(updatedValues)
    handleChangeAfterDelay(key, updatedValues)
  }

  const makeOnFocus = <K extends keyof Inputs>(key: K) => () => {
    setInputActive(key)
  }

  const makeOnBlur = <K extends keyof Inputs>(key?: K | undefined) => () => {
    if (inputActive === key) {
      setInputActive(undefined)
    } else if (!key) {
      setInputActive(undefined)
    }
  }

  const removeAnyDefaultResetValues = (key: keyof Inputs) => {
    if (defaultResetValues.hasOwnProperty(key)) {
      //remove api default saved values. user has edited again
      const resetValues = defaultResetValues
      delete resetValues[key]
      setDefaultResetValues(resetValues)
    }
  }

  const isInputActive = (key: keyof Inputs) => {
    return inputActive === key
  }

  const makeInputProps = (key: keyof Inputs) => {
    return {
      onChange: makeOnChange(key),
      onBlur: makeOnBlur(key),
      active: isInputActive(key),
      onFocus: makeOnFocus(key),
      value: currentValues[key],
    }
  }

  const makeColorInputProps = (key: keyof Inputs) => {
    return {
      onColorChange: makeOnColorChange(key),
      onBlur: makeOnBlur(key),
      onFocus: makeOnFocus(key),
      active: isInputActive(key),
      value: currentValues[key],
    }
  }

  const makeCheckboxInputProps = (key: keyof Inputs) => {
    return {
      onChange: makeCheckboxOnChange(key),
      checked: Boolean(currentValues[key]),
      onBlur: makeOnBlur(key),
      onFocus: makeOnFocus(key),
      id: key,
    }
  }

  //@ts-ignore
  useEffect(() => {
    return async () => {
      /**
       * If the user hasn't submitted their changes,
       * go back to the API theme
       */
      if (!hasSubmitted) {
        const theme = await getTheme()
        setTheme(theme)
      }
    }
  }, [])

  const setShouldShowPrompt = useSetAdminPrompt()

  useWatchForTruthy(haveChangesBeenMade, () => {
    if (setShouldShowPrompt) {
      setShouldShowPrompt(true)
    }
  })

  useWatchForTruthy(hasSubmitted, () => {
    if (setShouldShowPrompt) {
      setShouldShowPrompt(false)
    }
  })

  const resetToDefault = (key: keyof Inputs) => {
    //@ts-ignore
    const defaultApiValue = inputs[key].selector({
      ...defaultTheme,
      //@ts-ignore
      styles: defaultApiStyles
    })
    const calculatedDefault = inputs[key].selector(defaultTheme)
    const valueForInput = defaultApiValue || calculatedDefault
    makeOnChange(key)(valueForInput)
    // save api default values for reset - FE will always display calculated default, but Save will want to use api default
    // onSubmit uses defaultResetValues to overwrite calculatedValues unless user interaction has edited them
    const resetValues = defaultResetValues
    resetValues[key] = defaultApiValue
    setDefaultResetValues(resetValues)
  }

  return {
    onSubmit,
    values: currentValues,
    initialValues,
    makeOnChange,
    makeOnBlur,
    makeOnFocus,
    isInputActive,
    makeInputProps,
    makeCheckboxOnChange,
    makeColorInputProps,
    makeCheckboxInputProps,
    haveChangesBeenMade,
    hasSubmittedTheForm: hasSubmitted,
    submitStatus,
    resetToDefault,
  }
}

export default useThemeForm

const useChangeAfterThrottle = () => {
  const processChecker = useAsyncProcessChecker()

  return (action: () => void) => {
    const thisProcess = processChecker.begin()
    setTimeout(() => {
      if (processChecker.checkIfShouldContinue(thisProcess)) {
        action()
      }
    }, 200)
  }
}
