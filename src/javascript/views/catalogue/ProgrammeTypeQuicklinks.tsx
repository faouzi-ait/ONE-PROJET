import React from 'react'
import styled from 'styled-components'
import {ProgrammeTypeType} from 'javascript/types/ModelTypes'

export const ProgrammeTypeQuickLinks: React.FC<{
  onSelect: (id: number) => void
  typeSelected: string,
  centered?: boolean,
  data: ProgrammeTypeType[]
}> = ({ onSelect, typeSelected, centered, data }) => {
  if (!data) {
    return null
  }
  return (
    <Wrapper centered={centered}>
      {data.map(programmeType => {
        return (
          <button
            className={`button ${
              typeSelected === programmeType.id ? 'button--filled' : ''
            }`}
            onClick={() => onSelect(programmeType.id)}
            key={programmeType.id}
          >
            {programmeType.name}
          </button>
        )
      })}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  centered: boolean
}>`
  display: flex;
  flex-wrap: wrap;
  
  button {
    margin: 5px;
  }
  margin: ${props => {
    return props.centered ? '20px -5px -5px' : '-5px'
  }};
  justify-content: ${props => {
    return props.centered ? 'center' : 'flex-start'
  }};
`