import React, { createContext, useContext } from 'react'
import styled, { css } from 'styled-components'

const GridContext = createContext<GridContextValue>({ internalMargin: '15px' })

interface GridContextValue {
  internalMargin: string
}

type GridProps = {
  internalMargin: string
  justifyContent?: 'center' | 'flex-start' | 'flex-end' | 'space-between'
  alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch'
  flexDirection?: 'row'
  flexWrap?: 'wrap' | 'no-wrap'
}

export const Grid: React.FC<GridProps> = ({
  children,
  internalMargin,
  justifyContent,
  alignItems,
  flexDirection,
  flexWrap,
  ...props
}) => {
  return (
    <GridContext.Provider value={{ internalMargin }}>
      <GridWrapper
        {...{
          internalMargin,
          justifyContent,
          alignItems,
          flexWrap,
          flexDirection,
        }}
        {...props}
      >
        {children}
      </GridWrapper>
    </GridContext.Provider>
  )
}

const GridWrapper = styled.div<GridProps>`
  display: flex;
  ${({
    justifyContent,
    alignItems,
    internalMargin,
    flexDirection,
    flexWrap,
  }) => css`
    justify-content: ${justifyContent || 'flex-start'};
    align-items: ${alignItems || 'flex-start'};
    margin: -${internalMargin || '15px'};
    flex-wrap: ${flexWrap || 'wrap'};
    flex-direction: ${flexDirection || 'row'};
    ${alignItems === 'stretch' && css`
      & > * {
        display: inline-flex;
      }
    `}
  `}
`

interface GridItemProps {
  xs?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  /** Adds a piece of CSS which removes margins from the grid's children */
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  removeChildMargin?: boolean
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  xs = 12,
  md,
  lg,
  xl,
  removeChildMargin,
  ...props
}) => {
  const { internalMargin } = useContext(GridContext)
  return (
    <GridItemWrapper
      internalMargin={internalMargin}
      removeChildMargin={removeChildMargin}
      xs={xs}
      md={md}
      lg={lg}
      xl={xl}
      {...props}
    >
      {children}
    </GridItemWrapper>
  )
}

const GridItemWrapper = styled.div<{ internalMargin: string } & GridItemProps>`
  margin: ${props => props.internalMargin};
  width: ${props =>
    `calc((100% / ${12 / props.xs}) - (${props.internalMargin} * 2))`};

  ${props => props.md ? css`
    @media screen and (min-width: 767px) {
      width: ${`calc((100% / ${12 / props.md}) - (${props.internalMargin} * 2))`};
    }
  ` : ''}

  ${props => props.lg ? css`
    @media screen and (min-width: 1023px) {
      width: ${`calc((100% / ${12 / props.lg}) - (${props.internalMargin} * 2))`};
    }
  ` : ''}
  ${props => props.xl ? css`
    @media screen and (min-width: 1279px) {
      width: ${`calc((100% / ${12 / props.xl}) - (${props.internalMargin} * 2))`};
    }
  ` : ''}

  ${props =>
    props.removeChildMargin
      ? css`
          & > * {
            margin: 0;
          }
        `
      : ''}
`
