import React, { useEffect, useState, useRef } from 'react'
import makeLiteStyles from 'javascript/utils/theme/makeLiteStyles'
import { css } from 'styled-components'

import 'stylesheets/core/components/autocue-modal'
import withTheme from 'javascript/utils/theme/withTheme'
import { ThemeType } from 'javascript/utils/theme/types/ThemeType'
import Button from 'javascript/components/button'

interface Props {
  title?: string
  isUserStillWatching: boolean
  closeEvent: () => void
  onSubmit: () => void
  theme: ThemeType
}

const TIME_DELAY = 5 // This has a sass variable as well - $time `theme/${CLIENT}/stylesheets/components/autocue-modal.sass

const CountdownModal = ({
  title = '',
  isUserStillWatching,
  closeEvent,
  onSubmit,
  theme
}: Props) => {
  const [seconds, setSeconds] = useState(TIME_DELAY)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (!isUserStillWatching) {
      if (seconds > 0) {
        timeoutRef.current = setTimeout(() => {
          setSeconds(prevSeconds => (prevSeconds -= 1))
        }, 1000)
      } else {
        onSubmit()
      }
    }
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [seconds])

  if (isUserStillWatching) {
    return (
      <div className="autocue__content-block">
        <div className="autocue__content" style={{ marginTop: '35%' }}>
          <h3>Are you still watching?</h3>
          <div className="autocue__actions">
            <Button
              className="button button--filled"
              style={{ margin: '0px 5px' }}
              onClick={onSubmit}
            >
              {' '}
              Continue{' '}
            </Button>
            <Button
              className="button button--filled"
              style={{ margin: '0px 5px' }}
              onClick={closeEvent}
            >
              {' '}
              Back{' '}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="autocue__content-block">
      <div className="autocue__content">
        <h3>{title}</h3>
        <span>{`Next ${theme.localisation.video.lower} will play in...`}</span>
      </div>
      <div className="autocue__timer">
        <div className="autocue__circle autocue__center">
          <div className="autocue__count">{seconds}</div>
          <div className="autocue__l-half"></div>
          <div className="autocue__r-half"></div>
        </div>
      </div>
      <div className="autocue__actions">
        <Button
          className="button button--filled"
          style={{ margin: '0px 5px' }}
          onClick={closeEvent}
        >
          {' '}
          Cancel{' '}
        </Button>
        <Button
          className="button button--filled"
          style={{ margin: '0px 5px' }}
          onClick={onSubmit}
        >
          {' '}
          Play Now{' '}
        </Button>
      </div>
    </div>
  )
}

export default withTheme(CountdownModal)


export const autoCueStyles = makeLiteStyles(
  styles => css`
    .autocue {
      &__actions {
        color: ${styles.buttons.primaryColor};
      }
      &__count {
        color: ${styles.colors.brand};
      }
      &__content {
        color: ${styles.typography.bodyColor};
        h3 {
          color: ${styles.typography.headingsColor};
        }
      }
      &__l-half,
      &__r-half {
        &::before {
          border-color:  ${styles.colors.brand};
        }
      }
    }
  `,
)
