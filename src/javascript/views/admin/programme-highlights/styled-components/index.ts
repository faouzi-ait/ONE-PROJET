import styled from "styled-components"

export const DescriptorText = styled.p`
  opacity: 0.6;
  margin-top: 0px;
  font-size: 0.9rem;
`

export const Divider = styled.hr`
  opacity: 0.1;
  margin-top: 2rem;
  margin-bottom: 0rem;
  border: 0.5px solid;
`

export const ProgrammeCategoriesWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  & > * {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
  margin-left: -0.5rem;
  margin-right: -0.5rem;
  align-items: center;
`

export const ProgrammeCategoriesTitle = styled.h3`
  margin-top: 1.8rem;
  margin-bottom: 1.8rem;
`

export const RadioOptions = styled.div`
  display: flex;
  & > * {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
  margin-left: -0.5rem;
  margin-right: -0.5rem;
  margin-bottom: 1.8rem;
  align-items: center;
`

export const RadioLabel = styled.label`
  margin-bottom: 0.8rem;
  display: block;
  font-weight: bold;
`