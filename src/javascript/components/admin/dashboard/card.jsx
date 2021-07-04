// React
import React from 'react'
import styled from 'styled-components'
import Icon from 'javascript/components/icon'
class DashboardCard extends React.Component {
  constructor(props){
    super(props)
  }

  render (){
    const {title, stats, children, icon, width, height, reports, subHeading = true} = this.props
    const displayedResults = reports && reports.filter(r => r.display || r.display === undefined)
    const displayedStats = stats && stats.filter(s => s.display || s.display === undefined)
    return (
      <Card>
        <Title>
            <CardIcon id={icon} width={width} height={height} />
            {title}
        </Title>
        {subHeading && displayedResults.length > 0 &&
            <Heading>This week:</Heading>
        }
        { displayedResults && displayedResults.length > 0 &&
            <Stats border={false}>
                {displayedResults.map(r => {
                    return (
                        <StatItem loading={r.loading}>
                            <Tag theme={r.theme}>{r.value}</Tag>{r.label}
                        </StatItem>
                    )
                })}
            </Stats>
        }
        { displayedStats && displayedStats.length > 0 &&
            <Stats>
                {displayedStats.map(s => {
                    return (
                        <StatItem loading={s.loading}>
                            <StatValue>{s.value}</StatValue>{s.label}
                        </StatItem>
                    )
                })}
            </Stats>
        }
        <Children>
            {children}
        </Children>
      </Card>
    )
  }
}

const Card = styled.section`
  background: #ffffff;
  box-sizing: border-box
  border-radius: 12px;
  display: flex
  flex-direction: column
  padding: 25px;
`

const Title = styled.h1`
    display: flex
    align-items: center
    font-size: 20px;
    margin: 0 0 20px
`

const Stats = styled.ul`
    border-top: ${({border}) => border === false ? 'none' : 'solid 1px #cccccc'}
    list-style: none
    margin: 0
    padding: ${({border}) => border === false ? '0' : '20px'} 0 20px
`

const StatItem = styled.li`
    align-items: center
    display: flex
    font-size: 16px
    padding: 10px 0
    transition: opacity .8s
    opacity: ${({loading}) => loading === true ? '0' : '1'}
`
    
const StatValue = styled.span`
    font-weight: bold
    font-size: 28px
    line-height: 1
    text-align: center
    width: 90px
`

const CardIcon = styled(Icon)`
    display: inline-block
    flex: 0 0 auto
    fill: #2a2f2f;
    margin-right: 20px
`

const Children = styled.div`
    display: flex
    flex-direction: column
    align-items: center
    margin-top: auto
    h1 + & {
        margin-top: 0
    }
`

const Tag = styled.div`
    background-color: ${({theme}) => theme  === 'warning' ? '#ef990b' : '#26cd6f'}
    border-radius: 5px
    font-size: 16px
    color: white
    font-weight: bold
    padding: 2px 7px
    margin-right: 10px
`

const Heading = styled.h2`
    font-size: 16px
    font-weight: bold
    margin: 0 0 10px
`

export default DashboardCard