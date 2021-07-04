import React from 'react'
import pluralize from 'pluralize'
import styled, { css } from 'styled-components'
//Components
import Button from 'javascript/components/button'
import { ProgrammeHighlightsLayout } from 'javascript/views/admin/programme-highlights'
import SharedIcon from 'javascript/components/shared-icon'
//Types
import { CustomThemeType } from 'javascript/utils/theme/types/ThemeType'
// Hoc
import withTheme from 'javascript/utils/theme/withTheme'

interface PageLayoutPickerProps {
  handleCancel: () => void
  handleSave: () => void
  isLoading: boolean
  layoutSelected: ProgrammeHighlightsLayout
  selectLayout: (layout: ProgrammeHighlightsLayout) => void
  shouldDisableSaveButton: boolean
  shouldShowSaveAndCancelButtons: boolean
  theme: CustomThemeType
}

const PageLayoutPicker: React.FC<PageLayoutPickerProps> = ({
  handleCancel,
  handleSave,
  isLoading,
  layoutSelected,
  selectLayout,
  shouldDisableSaveButton,
  shouldShowSaveAndCancelButtons,
  theme,
}) => {
  const makeSelection = (layout: PageLayoutPickerProps['layoutSelected']) => {
    if (layoutSelected !== layout) {
      selectLayout(layout)
    }
  }
  return (
    <PageLayoutPickerWrapper>
      <Title>Choose your highlights page layout</Title>
      <Flex>
        <LayoutPickerContainer right>
          <TextWrapper>
            <Subtitle right>{`Layout 1 - ${theme.localisation.programme.upper} Listing`}</Subtitle>
            <Description right>
              Single {theme.localisation.programme.lower} in the banner
            </Description>
            <Description right>
              {pluralize.plural(theme.localisation.programme.upper)} in grid view
            </Description>
          </TextWrapper>
          <BigIconButton
            onClick={() => makeSelection('grid-view')}
            isSelected={layoutSelected === 'grid-view'}
            right
          >
            <SharedIcon icon="grid-view" />
          </BigIconButton>
        </LayoutPickerContainer>
        <LayoutPickerContainer>
          <BigIconButton
            onClick={() => makeSelection('carousel-with-collections')}
            isSelected={layoutSelected === 'carousel-with-collections'}
          >
            <SharedIcon icon="banner-carousel-view" />
          </BigIconButton>
          <TextWrapper>
            <Subtitle>Layout 2 - Collection View</Subtitle>
            <Description>
              Multi-{theme.localisation.programme.lower} carousel in the banner
            </Description>
            <Description>
              User-defined {theme.localisation.programme.lower} collections
            </Description>
          </TextWrapper>
        </LayoutPickerContainer>
      </Flex>
      <ActionsWrapper shouldShow={shouldShowSaveAndCancelButtons}>
        <ButtonsWrapper>
          <Button
            variant="filled"
            sizeModifier="small"
            disabled={shouldDisableSaveButton || isLoading}
            onClick={handleSave}
          >
            Save Layout
          </Button>
          <Button color="null" sizeModifier="small" onClick={handleCancel}>
            Cancel
          </Button>
        </ButtonsWrapper>
        <ActionsDescription>
          Please save this layout to begin editing.
        </ActionsDescription>
      </ActionsWrapper>
    </PageLayoutPickerWrapper>
  )
}

const TextWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`

const ActionsDescription = styled.p`
  margin: 0;
  margin-top: 0.8rem;
  text-align: center;
  max-width: 300px;
  opacity: 0.6;
  font-size: 0.8rem;
`

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
  & > * {
    margin-left: 0.25rem;
    margin-right: 0.25rem;
  }
`

const ActionsWrapper = styled.div<{ shouldShow: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: ${({ shouldShow }) => (shouldShow ? '1rem' : '0rem')};
  max-height: ${({ shouldShow }) => (shouldShow ? '71px' : '0px')};
  transition: opacity 0.15s, max-height 0.25s, margin-top 0.25s;
  ${({ shouldShow }) =>
    shouldShow
      ? css`
          opacity: 1;
          pointer-events: all;
        `
      : css`
          opacity: 0;
          pointer-events: none;
        `}
`

interface RightProp {
  right?: boolean
}

const rightFunction = ({ right }: RightProp) =>
  right
    ? css`
        text-align: right;
      `
    : ''

const PageLayoutPickerWrapper = styled.div`
  margin-bottom: 2rem;
`

const LayoutPickerContainer = styled.div<RightProp>`
  padding: 1rem;
  padding-top: 0rem;
  display: flex;
  justify-content: ${({ right }) => (right ? 'flex-end' : 'flex-start')};
  flex: 1;
`

const Title = styled.h2`
  text-align: center;
`

interface BigIconButtonProps {
  isSelected: boolean
}

const BigIconButton = styled.button.attrs({
  className: 'BigIconButton',
})<BigIconButtonProps & RightProp>`
  padding: 1rem 2rem;
  border-radius: 8px;
  outline: 0;
  margin-left: ${({ right }) => (right ? '1rem' : '0px')};
  margin-right: ${({ right }) => (!right ? '1rem' : '0px')};
  position: relative;
  border: none;
  &:hover {
    opacity: 0.85;
  }
  transition: background-color 0.2s, opacity 0.2s;
  background-color: ${({ isSelected }) =>
    isSelected ? 'rgba(42,43,45,1)' : 'rgba(179, 179, 177, 1)'};
  cursor: pointer;
  &:focus {
    opacity: 0.85;
  }
  ::after {
    content: '';
    position: absolute;
    width: 100%;
    opacity: ${({ isSelected }) => (isSelected ? '1' : '0')};
    transform: translateY(${({ isSelected }) => (isSelected ? '0px' : '-3px')});
    bottom: -0.8rem;
    left: 0;
    height: 6px;
    transition: all 0.2s;
    border-radius: 4px;
  }

  svg {
    ${({ isSelected }) =>
      isSelected
        ? css`
            stroke: white;
          `
        : ''}
  }
`

const Subtitle = styled.h3<RightProp>`
  margin-bottom: 0px;
  margin-top: 0px;
  ${rightFunction}
`

const Description = styled.p<RightProp>`
  margin-bottom: 0px;
  margin-top: 0px;
  opacity: 0.7;
  ${rightFunction}
`

const Flex = styled.div`
  display: flex;
  justify-content: center;
`

export default withTheme(PageLayoutPicker)
