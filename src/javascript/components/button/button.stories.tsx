import React from 'react'
import Button from '.'
import { storiesOf } from '@storybook/react'
import Icon from '../icon'

storiesOf('Button', module)
  .addDecorator(story => <div style={{ padding: '1rem' }}>{story()}</div>)
  .add('Sizes', () => (
    <>
      <Button>Normal</Button>
      <Button sizeModifier="small">Small</Button>
      <Button sizeModifier="smallest">Smallest</Button>
    </>
  ))
  .add('Variants', () => (
    <>
      <Button>Normal</Button>
      <Button variant="filled">Filled</Button>
    </>
  ))
  .add('States', () => (
    <>
      <Button state="alert">Alert</Button>
      <Button state="loading">Loading</Button>
      <Button state="loading" variant="filled">Loading</Button>
    </>
  ))
  .add('Colors', () => (
    <>
      <Button color="error">Error</Button>
      <Button color="null">Null</Button>
      <Button color="success">Success</Button>
      <Button color="transparent">Transparent</Button>
    </>
  ))
  .add('Icon', () => (
    <>
      <Button containsIcon>
        <Icon id="i-close" classes="button__icon" />
      </Button>
      <Button containsIcon variant="filled">
        <Icon id="i-close" classes="button__icon" />
      </Button>
      <Button containsIcon variant="reversed">
        <Icon id="i-close" classes="button__icon" />
      </Button>
      <Button containsIcon color="success">
        <Icon id="i-close" classes="button__icon" />
      </Button>
      <Button containsIcon color="error">
        <Icon id="i-close" classes="button__icon" />
      </Button>
      <Button containsIcon color="transparent">
        <Icon id="i-close" classes="button__icon" />
      </Button>
      <Button containsIcon state="loading">
        <Icon id="i-close" classes="button__icon" />
      </Button>
      <Button containsIcon state="alert">
        <Icon id="i-close" classes="button__icon" />
      </Button>
    </>
  ))
